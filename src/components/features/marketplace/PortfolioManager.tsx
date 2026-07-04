'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { PortfolioProjectForm } from './PortfolioProjectForm'
import { CountryRegionFields } from '@/components/features/geo/CountryRegionFields'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import {
  saveStudentProfile,
  addStudentSkill,
  deleteStudentSkill,
  getActiveTechnologies,
  savePortfolioProject,
  deletePortfolioProject,
  uploadAndSaveProfilePhoto,
  type StudentProfileView,
} from '@/lib/portfolio/actions'
import type { ComboboxOption } from '@/components/ui/combobox'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import {
  PlusCircle,
  Pencil,
  Trash2,
  ExternalLink,
  GitBranch,
  Loader2,
  BookOpen,
  MapPin,
  User,
  Wrench,
  FolderGit2,
} from 'lucide-react'
import type { PortfolioProject, StudentSkill } from '@/types'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImageCropModal } from '@/components/features/shared/ImageCropModal'

function SkillForm({
  initialData,
  availableTechnologies,
  existingSkills,
  isSaving,
  onSave,
  onCancel,
}: {
  initialData?: StudentSkill
  availableTechnologies: { id: string; name: string }[]
  existingSkills: StudentSkill[]
  isSaving: boolean
  onSave: (skill: StudentSkill) => void
  onCancel: () => void
}) {
  const t = useTranslations('Portfolio')

  const skillSchema = React.useMemo(() => {
    return z.object({
      name: z
        .string()
        .min(2, t('errorTitleReq'))
        .refine((val) => {
          if (initialData && initialData.name === val) return true
          return !existingSkills.some((s) => s.name === val)
        }, t('errorSkillExists')),
      level: z.enum(['basico', 'intermedio', 'avanzado']),
    })
  }, [t, initialData, existingSkills])
  type SkillFormValues = z.infer<typeof skillSchema>

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: initialData?.name || '',
      level: initialData?.level || 'basico',
    },
  })

  const onSubmit = (data: SkillFormValues) => {
    onSave({
      id: initialData?.id || `skill-${Date.now()}`,
      name: data.name,
      level: data.level,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="skill-name" className="text-sm font-medium">
          {t('skillName')}
        </label>
        <select
          id="skill-name"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          {...register('name')}
        >
          <option value="">{t('selectSkillPlaceholder')}</option>
          {availableTechnologies.map((tech) => (
            <option key={tech.id} value={tech.name}>
              {tech.name}
            </option>
          ))}
        </select>
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <label htmlFor="skill-level" className="text-sm font-medium">
          {t('skillLevel')}
        </label>
        <select
          id="skill-level"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          {...register('level')}
        >
          <option value="basico">{t('levelBasic')}</option>
          <option value="intermedio">{t('levelIntermediate')}</option>
          <option value="avanzado">{t('levelAdvanced')}</option>
        </select>
        {errors.level && (
          <p className="text-xs text-destructive">{errors.level.message}</p>
        )}
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('saving')}
            </>
          ) : (
            t('saveSkill')
          )}
        </Button>
      </div>
    </form>
  )
}

export function PortfolioManager({
  initialProfile,
  countries = [],
  initialRegions = [],
}: {
  initialProfile?: StudentProfileView | null
  countries?: ComboboxOption[]
  initialRegions?: ComboboxOption[]
}) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false)
  const [availableTechnologies, setAvailableTechnologies] = useState<
    { id: string; name: string }[]
  >([])
  const [isSavingPersonal, setIsSavingPersonal] = useState(false)
  const [isSavingBio, setIsSavingBio] = useState(false)
  const [isSavingLinks, setIsSavingLinks] = useState(false)
  const [isSavingLocation, setIsSavingLocation] = useState(false)
  const [isBusy, setIsBusy] = useState(false)
  const [editingProject, setEditingProject] = useState<
    PortfolioProject | undefined
  >(undefined)
  const [editingSkill, setEditingSkill] = useState<StudentSkill | undefined>(
    undefined,
  )

  // Ubicación: estado local explícito (no react-hook-form). El form anterior
  // usaba watch/setValue/reset con un useEffect que pisaba la selección, por lo
  // que el país/región no llegaba al submit. Estado directo = guardado fiable.
  const [portfolioCountry, setPortfolioCountry] = useState(
    initialProfile?.paisIsoResidencia || '',
  )
  const [portfolioRegion, setPortfolioRegion] = useState(
    initialProfile?.regionResidencia || '',
  )

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [localPhotoUrl, setLocalPhotoUrl] = useState<string | null>(null)

  // Imagen seleccionada pendiente de recorte (el modal compartido la procesa).
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [isCropModalOpen, setIsCropModalOpen] = useState(false)

  const t = useTranslations('Portfolio')
  const locale = useLocale()

  useEffect(() => {
    getActiveTechnologies().then((res) => {
      if (res.ok) setAvailableTechnologies(res.data)
    })
  }, [])

  const projects = initialProfile?.projects || []
  const skills = initialProfile?.skills || []

  // --- Datos personales (tabla usuarios) ---
  const personalSchema = React.useMemo(() => {
    return z.object({
      firstName: z.string().trim().min(2, t('errorFirstNameReq')),
      lastName1: z.string().trim().min(2, t('errorLastName1Req')),
      lastName2: z.string().trim().optional(),
    })
  }, [t])
  type PersonalValues = z.infer<typeof personalSchema>

  const {
    register: registerPersonal,
    handleSubmit: handlePersonalSubmit,
    formState: { errors: personalErrors },
  } = useForm<PersonalValues>({
    resolver: zodResolver(personalSchema),
    defaultValues: {
      firstName: initialProfile?.firstName || '',
      lastName1: initialProfile?.lastName1 || '',
      lastName2: initialProfile?.lastName2 || '',
    },
  })

  // --- Biografía (estudiantes.descripcion) ---
  const bioSchema = React.useMemo(() => {
    return z.object({
      bio: z.string().max(2000, t('errorBioMax')),
    })
  }, [t])
  type BioValues = z.infer<typeof bioSchema>

  const [portfolioBio, setPortfolioBio] = useState(
    initialProfile?.descripcion || '',
  )

  const {
    register: registerBio,
    handleSubmit: handleBioSubmit,
    formState: { errors: bioErrors },
    reset: resetBio,
  } = useForm<BioValues>({
    resolver: zodResolver(bioSchema),
    defaultValues: { bio: portfolioBio || '' },
  })

  useEffect(() => {
    resetBio({ bio: portfolioBio || '' })
  }, [portfolioBio, resetBio])

  // --- Enlaces / GitHub (estudiantes.url_portafolio) ---
  const linksSchema = React.useMemo(() => {
    return z.object({
      urlPortafolio: z
        .string()
        .trim()
        .max(150)
        .refine(
          (v) => v === '' || /^https?:\/\/.+/.test(v),
          t('errorGithubInvalid'),
        ),
    })
  }, [t])
  type LinksValues = z.infer<typeof linksSchema>

  const {
    register: registerLinks,
    handleSubmit: handleLinksSubmit,
    formState: { errors: linksErrors },
  } = useForm<LinksValues>({
    resolver: zodResolver(linksSchema),
    defaultValues: { urlPortafolio: initialProfile?.urlPortafolio || '' },
  })

  const handlePersonalSave = async (data: PersonalValues) => {
    setIsSavingPersonal(true)
    const res = await saveStudentProfile({
      firstName: data.firstName,
      lastName1: data.lastName1,
      lastName2: data.lastName2 ?? '',
    })
    setIsSavingPersonal(false)

    if (res.ok) {
      toast.success(t('toastPersonalSaved'))
      router.refresh()
    } else {
      toast.error(t('toastPersonalError'))
    }
  }

  const handleBioSave = async (data: BioValues) => {
    setIsSavingBio(true)
    const res = await saveStudentProfile({ descripcion: data.bio || '' })
    setIsSavingBio(false)

    if (res.ok) {
      setPortfolioBio(data.bio || '')
      toast.success(t('toastBioSaved'))
    } else {
      toast.error(t('toastBioError'))
    }
  }

  const handleLinksSave = async (data: LinksValues) => {
    setIsSavingLinks(true)
    const res = await saveStudentProfile({
      urlPortafolio: data.urlPortafolio ? data.urlPortafolio : null,
    })
    setIsSavingLinks(false)

    if (res.ok) {
      toast.success(t('toastLinksSaved'))
    } else {
      toast.error(t('toastLinksError'))
    }
  }

  const handleLocationSave = async () => {
    setIsSavingLocation(true)
    const res = await saveStudentProfile({
      paisIsoResidencia: portfolioCountry || null,
      regionResidencia: portfolioRegion || null,
    })
    setIsSavingLocation(false)

    if (res.ok) {
      toast.success(t('toastLocationSaved'))
      router.refresh()
    } else {
      toast.error(t('toastLocationError'))
    }
  }

  const handleSave = async (project: PortfolioProject) => {
    setIsBusy(true)
    const res = await savePortfolioProject(project, editingProject?.id)
    setIsBusy(false)

    if (res.ok) {
      toast.success(t('toastProjectSaved'))
      router.refresh()
      setIsDialogOpen(false)
      setEditingProject(undefined)
    } else {
      toast.error(t('toastProjectError'))
    }
  }

  const handleDelete = async (id: string) => {
    setIsBusy(true)
    const res = await deletePortfolioProject(id)
    setIsBusy(false)

    if (res.ok) {
      toast.success(t('toastProjectDeleted'))
      router.refresh()
    } else {
      toast.error(t('toastProjectDeleteError'))
    }
  }

  const handleEdit = (project: PortfolioProject) => {
    setEditingProject(project)
    setIsDialogOpen(true)
  }

  const handleAddNew = () => {
    setEditingProject(undefined)
    setIsDialogOpen(true)
  }

  const handleSaveSkill = async (skill: StudentSkill) => {
    setIsBusy(true)
    const res = await addStudentSkill(skill.name, skill.level)
    setIsBusy(false)

    if (res.ok) {
      toast.success(t('toastSkillSaved'))
      router.refresh()
      setIsSkillDialogOpen(false)
      setEditingSkill(undefined)
    } else {
      toast.error(t('toastSkillError'))
    }
  }

  const handleDeleteSkill = async (id: string) => {
    setIsBusy(true)
    const res = await deleteStudentSkill(id)
    setIsBusy(false)

    if (res.ok) {
      toast.success(t('toastSkillDeleted'))
      router.refresh()
    } else {
      toast.error(t('toastSkillDeleteError'))
    }
  }

  const handleEditSkill = (skill: StudentSkill) => {
    setEditingSkill(skill)
    setIsSkillDialogOpen(true)
  }

  const handleAddNewSkill = () => {
    setEditingSkill(undefined)
    setIsSkillDialogOpen(true)
  }

  const photoSrc = localPhotoUrl || initialProfile?.profilePhoto || ''

  const handleCropConfirm = async (croppedFile: File) => {
    setIsUploadingPhoto(true)
    const toastId = toast.loading(t('toastUploadingPhoto'))
    try {
      const formData = new FormData()
      formData.append('file', croppedFile)

      const result = await uploadAndSaveProfilePhoto(formData)

      if (result.ok) {
        setLocalPhotoUrl(result.data)
        toast.success(t('toastPhotoUpdated'), { id: toastId })
        setIsCropModalOpen(false)
      } else {
        toast.error(t('toastPhotoError'), { id: toastId })
      }
    } catch (uploadError) {
      logger.error('PortfolioManager: fallo al recortar o subir la foto', {
        error:
          uploadError instanceof Error
            ? uploadError.message
            : String(uploadError),
      })
      toast.error(t('toastUploadError'), { id: toastId })
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      {/* === Datos personales === */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {t('personalDataTitle')}
          </CardTitle>
          <CardDescription>{t('personalDataDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Foto de perfil */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <Dialog
                open={isPhotoModalOpen}
                onOpenChange={setIsPhotoModalOpen}
              >
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="relative group rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-transform hover:scale-105 active:scale-95 cursor-pointer ring-2 ring-primary/20 ring-offset-2"
                    aria-label={t('editPhotoTitle')}
                  >
                    {photoSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photoSrc}
                        alt={t('photoAlt')}
                        className="w-24 h-24 rounded-full object-cover"
                        style={{ opacity: isUploadingPhoto ? 0.5 : 1 }}
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-secondary-foreground font-bold text-3xl">
                        {initialProfile?.firstName?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-foreground/40 hidden group-hover:flex items-center justify-center text-secondary-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      <Pencil className="w-5 h-5" />
                    </div>
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] flex flex-col items-center text-center p-8 gap-6">
                  {photoSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoSrc}
                      alt={t('photoPreviewAlt')}
                      className="w-32 h-32 rounded-full object-cover border shadow-sm"
                      style={{ opacity: isUploadingPhoto ? 0.5 : 1 }}
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center border text-primary font-bold text-4xl shadow-sm">
                      {initialProfile?.firstName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="space-y-2">
                    <DialogTitle className="text-xl font-semibold">
                      {t('editPhotoTitle')}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                      {t('editPhotoDesc')}
                    </p>
                  </div>
                  <div className="flex w-full justify-end bg-muted/20 p-4 -mx-8 -mb-8 mt-2 rounded-b-xl gap-2">
                    <DialogClose asChild>
                      <Button
                        variant="ghost"
                        className="font-semibold text-muted-foreground hover:text-foreground"
                      >
                        {t('cancel')}
                      </Button>
                    </DialogClose>
                    <Button
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
                      onClick={() => {
                        fileInputRef.current?.click()
                        setIsPhotoModalOpen(false)
                      }}
                    >
                      {t('accept')}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return

                  const isValidType = [
                    'image/jpeg',
                    'image/png',
                    'image/webp',
                  ].includes(file.type)
                  const isValidSize = file.size <= 5 * 1024 * 1024

                  if (!isValidType || !isValidSize) {
                    toast.error(t('toastImageInvalid'))
                    return
                  }

                  const reader = new FileReader()
                  reader.readAsDataURL(file)
                  reader.onload = () => {
                    setImageToCrop(reader.result as string)
                    setIsCropModalOpen(true)
                    setIsPhotoModalOpen(false)
                  }

                  e.target.value = ''
                }}
              />

              <ImageCropModal
                open={isCropModalOpen}
                onOpenChange={setIsCropModalOpen}
                imageSrc={imageToCrop}
                processing={isUploadingPhoto}
                labels={{
                  title: t('cropImageTitle'),
                  description: t('cropImageDesc'),
                  cancel: t('cancel'),
                  confirm: t('cropAndUpload'),
                }}
                onConfirm={handleCropConfirm}
                onError={() => toast.error(t('toastUploadError'))}
              />
            </div>

            {/* Nombre y apellidos */}
            <form
              onSubmit={handlePersonalSubmit(handlePersonalSave)}
              className="flex-1 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="personal-firstName">
                    {t('firstNameLabel')}
                  </Label>
                  <Input
                    id="personal-firstName"
                    {...registerPersonal('firstName')}
                  />
                  {personalErrors.firstName && (
                    <p className="text-xs text-destructive">
                      {personalErrors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="personal-lastName1">
                    {t('lastName1Label')}
                  </Label>
                  <Input
                    id="personal-lastName1"
                    {...registerPersonal('lastName1')}
                  />
                  {personalErrors.lastName1 && (
                    <p className="text-xs text-destructive">
                      {personalErrors.lastName1.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="personal-lastName2">
                  {t('lastName2Label')}{' '}
                  <span className="text-muted-foreground text-xs font-normal">
                    {t('lastName2Optional')}
                  </span>
                </Label>
                <Input
                  id="personal-lastName2"
                  {...registerPersonal('lastName2')}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isSavingPersonal}>
                  {isSavingPersonal && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t('savePersonalData')}
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* === Biografía === */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {t('bioTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBioSubmit(handleBioSave)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="portfolio-bio-textarea" className="sr-only">
                {t('bioTitle')}
              </Label>
              <Textarea
                id="portfolio-bio-textarea"
                placeholder={t('bioPlaceholder')}
                {...registerBio('bio')}
                rows={6}
              />
              {bioErrors.bio && (
                <p className="text-xs text-destructive">
                  {bioErrors.bio.message}
                </p>
              )}
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSavingBio}>
                {isSavingBio && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t('saveBio')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* === Ubicación === */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {t('locationLabel')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleLocationSave()
            }}
            className="space-y-4"
          >
            <CountryRegionFields
              countries={countries}
              initialRegions={initialRegions}
              countryValue={portfolioCountry}
              onCountryChange={(code) => setPortfolioCountry(code)}
              regionValue={portfolioRegion}
              onRegionChange={(code) => setPortfolioRegion(code)}
              countryLabel={t('countryLabel')}
              countryId="portfolio-country"
              regionId="portfolio-region"
              regionLabel={t('regionLabel')}
              hideRegionOptional={true}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isSavingLocation}>
                {isSavingLocation && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t('saveLocation')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* === Enlaces / GitHub === */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            {t('linksTitle')}
          </CardTitle>
          <CardDescription>{t('linksDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleLinksSubmit(handleLinksSave)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="portfolio-github">{t('githubLabel')}</Label>
              <Input
                id="portfolio-github"
                type="url"
                inputMode="url"
                placeholder={t('githubPlaceholder')}
                {...registerLinks('urlPortafolio')}
              />
              {linksErrors.urlPortafolio && (
                <p className="text-xs text-destructive">
                  {linksErrors.urlPortafolio.message}
                </p>
              )}
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSavingLinks}>
                {isSavingLinks && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t('saveLinks')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* === Habilidades técnicas === */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            {t('skillsTitle')}
          </CardTitle>
          <Dialog open={isSkillDialogOpen} onOpenChange={setIsSkillDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={handleAddNewSkill}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('addSkill')}
              </Button>
            </DialogTrigger>
            <DialogContent id="skill-dialog" className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingSkill ? t('editSkill') : t('newSkill')}
                </DialogTitle>
              </DialogHeader>
              <SkillForm
                {...(editingSkill ? { initialData: editingSkill } : {})}
                availableTechnologies={availableTechnologies}
                existingSkills={skills}
                isSaving={isBusy}
                onSave={handleSaveSkill}
                onCancel={() => setIsSkillDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {skills.length === 0 ? (
            <div className="flex h-20 items-center justify-center rounded-lg border border-dashed">
              <p className="text-muted-foreground">{t('noSkills')}</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/20 px-3 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium text-sm truncate">
                      {skill.name}
                    </span>
                    <Badge
                      variant={
                        skill.level === 'avanzado'
                          ? 'default'
                          : skill.level === 'intermedio'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {skill.level === 'avanzado'
                        ? t('levelAdvanced')
                        : skill.level === 'intermedio'
                          ? t('levelIntermediate')
                          : t('levelBasic')}
                    </Badge>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditSkill(skill)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive/80"
                      onClick={() => handleDeleteSkill(skill.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* === Proyectos del portafolio (al final) === */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <FolderGit2 className="h-5 w-5 text-primary" />
              {t('managerTitle')}
            </CardTitle>
            <CardDescription className="mt-1">
              {t('projectsManagerDesc')}
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={handleAddNew}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('addProject')}
              </Button>
            </DialogTrigger>
            <DialogContent
              id="portfolio-dialog"
              className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
            >
              <DialogHeader>
                <DialogTitle>
                  {editingProject ? t('editProject') : t('newProject')}
                </DialogTitle>
              </DialogHeader>
              <PortfolioProjectForm
                {...(editingProject ? { initialData: editingProject } : {})}
                availableTechnologies={availableTechnologies}
                onSave={handleSave}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
              <p className="text-muted-foreground">{t('noProjects')}</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {projects.map((project) => (
                <Card key={project.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="line-clamp-1">
                      {project.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {t('finishedPrefix')}{' '}
                      {new Date(project.completionDate).toLocaleDateString(
                        locale,
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3 prose-body">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <Badge key={tech} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-4 text-sm mt-4">
                      {project.repositoryUrl && (
                        <a
                          href={project.repositoryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-primary hover:underline"
                        >
                          <GitBranch className="mr-1 h-4 w-4" /> {t('repo')}
                        </a>
                      )}
                      {project.demoUrl && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="flex items-center text-primary hover:underline cursor-pointer">
                              <ExternalLink className="mr-1 h-4 w-4" />{' '}
                              {t('demo')}
                            </button>
                          </DialogTrigger>
                          <DialogContent
                            showCloseButton={false}
                            className="max-w-4xl h-[80vh] flex flex-col gap-0 p-0 overflow-hidden bg-background rounded-xl"
                          >
                            <DialogHeader className="p-3 border-b bg-muted/30 flex flex-row items-center">
                              <div className="flex items-center gap-2 pl-1">
                                <DialogClose asChild>
                                  <button
                                    className="w-3 h-3 rounded-full bg-magenta hover:bg-magenta/80 focus:outline-none"
                                    aria-label={t('closeModal')}
                                  />
                                </DialogClose>
                                <a
                                  href={project.demoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-3 h-3 rounded-full bg-success hover:bg-success/80 focus:outline-none"
                                  aria-label={t('openInNewWindow')}
                                />
                              </div>
                              <DialogTitle className="flex-1 text-center text-xs font-medium text-muted-foreground pr-10">
                                {project.title} {t('demo')}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="flex-1 w-full bg-muted/10 relative">
                              <iframe
                                src={project.demoUrl}
                                className="w-full h-full border-0"
                              />
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2 border-t p-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(project)}
                    >
                      <Pencil className="mr-2 h-4 w-4" /> {t('edit')}
                    </Button>
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => handleDelete(project.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> {t('delete')}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
