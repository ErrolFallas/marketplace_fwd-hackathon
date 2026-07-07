'use client'

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MultiSelect } from '@/components/ui/multi-select'
import type { ComboboxOption } from '@/components/ui/combobox'
import type { PortfolioProject } from '@/types'
import { useTranslations } from 'next-intl'
import { ImageOff, ImagePlus, Loader2 } from 'lucide-react'
import {
  uploadPortfolioProjectImage,
  deletePortfolioProjectImage,
} from '@/lib/portfolio/actions'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface Props {
  initialData?: PortfolioProject
  /** Presente cuando el proyecto se está declarando desde una participación finalizada real. */
  idParticipacion?: string
  availableTechnologies: { id: string; name: string }[]
  onSave: (project: PortfolioProject) => void
  onCancel: () => void
}

/**
 * `markPersisted` lo llama el padre SOLO cuando `savePortfolioProject`
 * confirmó éxito (incluido el caso diferido del aviso de consentimiento).
 * Antes de eso, el formulario no puede saber si `onSave` terminó en un
 * guardado real o en un consentimiento rechazado / un error de red, así que
 * no alcanza con detectar el submit para decidir si la imagen ya quedó a
 * salvo.
 */
export interface PortfolioProjectFormHandle {
  markPersisted: () => void
}

export const PortfolioProjectForm = forwardRef<
  PortfolioProjectFormHandle,
  Props
>(function PortfolioProjectForm(
  {
    initialData,
    idParticipacion,
    availableTechnologies,
    onSave,
    onCancel,
  }: Props,
  ref,
) {
  const t = useTranslations('Portfolio')

  const schema = useMemo(() => {
    return z.object({
      title: z.string().min(3, t('errorTitleReq')),
      description: z.string().min(10, t('errorDescReq')),
      technologies: z.array(z.string()).min(1, t('errorTechReq')),
      repositoryUrl: z
        .string()
        .url(t('errorRepoInvalid'))
        .optional()
        .or(z.literal('')),
      demoUrl: z
        .string()
        .url(t('errorDemoInvalid'))
        .optional()
        .or(z.literal('')),
    })
  }, [t])

  type FormData = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      technologies: initialData?.technologies ?? [],
      repositoryUrl: initialData?.repositoryUrl || '',
      demoUrl: initialData?.demoUrl || '',
    },
  })

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        description: initialData.description,
        technologies: initialData.technologies ?? [],
        repositoryUrl: initialData.repositoryUrl || '',
        demoUrl: initialData.demoUrl || '',
      })
    }
  }, [initialData, reset])

  // Imagen opcional del proyecto: subida directa a Cloudinary (sin recorte,
  // una captura de proyecto es rectangular, no cuadrada como un avatar).
  // `initialImageUrl` es la que ya está guardada en la BD (si se está
  // editando); si el egresado reemplaza o quita una imagen que subió en esta
  // misma sesión (todavía no guardada), la borramos de Cloudinary al toque
  // para no dejarla huérfana. La que ya está guardada NO se borra acá: eso
  // lo resuelve `savePortfolioProject` recién cuando el cambio se confirma.
  const initialImageUrl = initialData?.imageUrl || ''
  const [imageUrl, setImageUrl] = useState(initialImageUrl)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const discardUnsavedImage = (url: string) => {
    if (url && url !== initialImageUrl) {
      void deletePortfolioProjectImage(url)
    }
  }

  // Red de seguridad al desmontar (Radix desmonta este formulario al
  // cerrarse el diálogo, sea por el botón Cancelar, click afuera o Escape):
  // si en ese momento hay una imagen subida que nunca quedó realmente
  // persistida, se borra. `submittedRef` solo lo pone en true el PADRE, vía
  // `markPersisted`, y solo después de que `savePortfolioProject` confirmó
  // éxito — nunca al simple hacer submit, porque el guardado puede quedar
  // pendiente de un consentimiento que el egresado rechace, o puede fallar.
  const submittedRef = useRef(false)
  const imageUrlRef = useRef(imageUrl)
  useEffect(() => {
    imageUrlRef.current = imageUrl
  }, [imageUrl])
  useEffect(() => {
    return () => {
      if (!submittedRef.current) discardUnsavedImage(imageUrlRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useImperativeHandle(ref, () => ({
    markPersisted: () => {
      submittedRef.current = true
    },
  }))

  const handleImageSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (
      !ALLOWED_IMAGE_TYPES.includes(file.type) ||
      file.size > MAX_IMAGE_BYTES
    ) {
      toast.error(t('toastImageInvalid'))
      return
    }

    setIsUploadingImage(true)
    const formData = new FormData()
    formData.append('file', file)
    const result = await uploadPortfolioProjectImage(formData)
    setIsUploadingImage(false)

    if (result.ok) {
      discardUnsavedImage(imageUrl)
      setImageUrl(result.data)
      toast.success(t('toastProjectImageUploaded'))
    } else {
      toast.error(t('toastProjectImageError'))
    }
  }

  const handleRemoveImage = () => {
    discardUnsavedImage(imageUrl)
    setImageUrl('')
  }

  // Tecnologías seleccionadas (nombres). El picker (MultiSelect) ofrece el
  // catálogo con búsqueda y chips removibles. Una tecnología heredada que ya no
  // esté en el catálogo activo se agrega como opción extra para que siga
  // visible y removible (no se pierde al guardar).
  const selectedTechnologies = watch('technologies')

  const technologyOptions = useMemo<ComboboxOption[]>(() => {
    const catalog = availableTechnologies.map((tech) => ({
      value: tech.name,
      label: tech.name,
    }))
    const inheritedOutsideCatalog = selectedTechnologies
      .filter(
        (name) => !availableTechnologies.some((tech) => tech.name === name),
      )
      .map((name) => ({ value: name, label: name }))
    return [...catalog, ...inheritedOutsideCatalog]
  }, [availableTechnologies, selectedTechnologies])

  const onSubmit = (data: FormData) => {
    const project: PortfolioProject = {
      id: initialData?.id || `port-proj-${Date.now()}`,
      title: data.title,
      description: data.description,
      technologies: data.technologies,
    }

    if (data.repositoryUrl) {
      project.repositoryUrl = data.repositoryUrl
    }
    if (data.demoUrl) {
      project.demoUrl = data.demoUrl
    }
    if (imageUrl) {
      project.imageUrl = imageUrl
    }
    if (idParticipacion) {
      project.idParticipacion = idParticipacion
    }

    onSave(project)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">{t('formTitleLabel')}</Label>
        <Input
          id="title"
          {...register('title')}
          placeholder={t('formTitlePlaceholder')}
        />
        {errors.title && (
          <p className="text-sm text-destructive">
            {String(errors.title.message)}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t('formDescriptionLabel')}</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder={t('formDescriptionPlaceholder')}
          rows={4}
        />
        {errors.description && (
          <p className="text-sm text-destructive">
            {String(errors.description.message)}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="technologies">{t('formTechLabel')}</Label>
        <MultiSelect
          id="technologies"
          options={technologyOptions}
          selected={selectedTechnologies}
          onSelectedChange={(next) =>
            setValue('technologies', next, { shouldValidate: true })
          }
          placeholder={t('formTechPlaceholder')}
          searchPlaceholder={t('formTechSearchPlaceholder')}
          emptyText={t('formTechEmpty')}
          removeLabel={t('formTechRemove')}
        />
        {errors.technologies && (
          <p className="text-sm text-destructive">
            {String(errors.technologies.message)}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="repositoryUrl">{t('formRepoLabel')}</Label>
        <Input
          id="repositoryUrl"
          {...register('repositoryUrl')}
          placeholder={t('formRepoPlaceholder')}
        />
        {errors.repositoryUrl && (
          <p className="text-sm text-destructive">
            {String(errors.repositoryUrl.message)}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="demoUrl">{t('formDemoLabel')}</Label>
        <Input
          id="demoUrl"
          {...register('demoUrl')}
          placeholder={t('formDemoPlaceholder')}
        />
        {errors.demoUrl && (
          <p className="text-sm text-destructive">
            {String(errors.demoUrl.message)}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="project-image">{t('formImageLabel')}</Label>
        <input
          id="project-image"
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelected}
        />
        {imageUrl ? (
          <div className="relative overflow-hidden rounded-lg border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={t('formImageAlt')}
              className="h-40 w-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute right-2 top-2 rounded-full bg-foreground/70 p-1.5 text-background hover:bg-foreground/90"
              aria-label={t('formImageRemove')}
            >
              <ImageOff className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={isUploadingImage}
            className="flex h-24 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border text-sm text-muted-foreground transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:border-primary/40 hover:text-foreground"
          >
            {isUploadingImage ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('uploadingImage')}
              </>
            ) : (
              <>
                <ImagePlus className="h-4 w-4" />
                {t('formImageUpload')}
              </>
            )}
          </button>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={isUploadingImage}>
          {t('save')}
        </Button>
      </div>
    </form>
  )
})
