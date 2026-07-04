'use client'

import React, { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MultiSelect } from '@/components/ui/multi-select'
import type { ComboboxOption } from '@/components/ui/combobox'
import type { PortfolioProject } from '@/types'
import { useTranslations } from 'next-intl'

interface Props {
  initialData?: PortfolioProject
  availableTechnologies: { id: string; name: string }[]
  onSave: (project: PortfolioProject) => void
  onCancel: () => void
}

export function PortfolioProjectForm({
  initialData,
  availableTechnologies,
  onSave,
  onCancel,
}: Props) {
  const t = useTranslations('Portfolio')

  const schema = useMemo(() => {
    return z.object({
      title: z.string().min(3, t('errorTitleReq')),
      description: z.string().min(10, t('errorDescReq')),
      technologies: z.array(z.string()).min(1, t('errorTechReq')),
      completionDate: z.string().min(1, t('errorDateReq')),
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
      completionDate: initialData?.completionDate || '',
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
        completionDate: initialData.completionDate,
        repositoryUrl: initialData.repositoryUrl || '',
        demoUrl: initialData.demoUrl || '',
      })
    }
  }, [initialData, reset])

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
      completionDate: data.completionDate,
    }

    if (data.repositoryUrl) {
      project.repositoryUrl = data.repositoryUrl
    }
    if (data.demoUrl) {
      project.demoUrl = data.demoUrl
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
        <Label htmlFor="completionDate">{t('formDateLabel')}</Label>
        <Input
          id="completionDate"
          type="date"
          {...register('completionDate')}
        />
        {errors.completionDate && (
          <p className="text-sm text-destructive">
            {String(errors.completionDate.message)}
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

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button type="submit">{t('save')}</Button>
      </div>
    </form>
  )
}
