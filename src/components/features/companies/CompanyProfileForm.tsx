'use client'

import { useMemo, useState, type ChangeEvent, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  Save,
  Upload,
  ImageIcon,
  Loader2,
  User,
  Building2,
  BadgeCheck,
} from 'lucide-react'
import {
  createCompanyProfileSchema,
  MINIMUM_EMPRESARIO_AGE,
  type CompanyProfileInput,
  type CompanyProfileView,
  type VerificationStatus,
} from '@/lib/company/schemas'
import { maxBirthDateForMinAge } from '@/lib/utils/age'
import { saveCompanyProfile } from '@/lib/company/actions'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils/cn'
import { CountryRegionFields } from '@/components/features/geo/CountryRegionFields'
import { ImageCropModal } from '@/components/features/shared/ImageCropModal'
import type { ComboboxOption } from '@/components/ui/combobox'

interface CompanyProfileFormProps {
  initialProfile: CompanyProfileView
  userId: string
  countries: ComboboxOption[]
  initialRegions: ComboboxOption[]
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const VERIF_KEY: Record<VerificationStatus, string> = {
  pendiente: 'verifPendiente',
  verificado: 'verifVerificado',
  rechazado: 'verifRechazado',
}
const VERIF_STYLE: Record<VerificationStatus, string> = {
  pendiente: 'bg-warning/10 text-warning border-warning/20',
  verificado: 'bg-accent/10 text-accent border-accent/20',
  rechazado: 'bg-destructive/10 text-destructive border-destructive/20',
}

type CropTarget = 'photo' | 'logo'

export function CompanyProfileForm({
  initialProfile,
  userId,
  countries,
  initialRegions,
}: CompanyProfileFormProps) {
  const tEmpresa = useTranslations('Empresa')
  const tCommon = useTranslations('Common')
  const tValidation = useTranslations('Validation')
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    initialProfile.profilePhoto || null,
  )
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(
    initialProfile.logo || null,
  )
  const [uploadingLogo, setUploadingLogo] = useState(false)

  // Imagen seleccionada pendiente de recorte y a qué campo pertenece. El modal
  // compartido la recorta; el File recortado sube en el submit (sin cambios de
  // backend): la foto al bucket fotos-perfil y el logo al bucket logos.
  const [cropTarget, setCropTarget] = useState<CropTarget | null>(null)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)

  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const profileSchema = useMemo(
    () => createCompanyProfileSchema(tValidation),
    [tValidation],
  )
  // Tope del selector: la fecha de quien cumple la mayoría de edad justo hoy.
  const maxBirthDate = useMemo(
    () => maxBirthDateForMinAge(MINIMUM_EMPRESARIO_AGE, new Date()),
    [],
  )

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CompanyProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: initialProfile.firstName,
      lastName1: initialProfile.lastName1,
      lastName2: initialProfile.lastName2 ?? '',
      birthDate: initialProfile.birthDate ?? '',
      profilePhoto: initialProfile.profilePhoto,
      name: initialProfile.name,
      companyType: initialProfile.companyType,
      sector: initialProfile.sector,
      cedula: initialProfile.cedula ?? '',
      description: initialProfile.description,
      contactEmail: initialProfile.contactEmail,
      website: initialProfile.website,
      logo: initialProfile.logo,
      country: initialProfile.country ?? '',
      city: initialProfile.city ?? '',
      ...(initialProfile.operatingScope
        ? { operatingScope: initialProfile.operatingScope }
        : {}),
    },
  })

  const watchedType = watch('companyType')

  const validateImage = (file: File): boolean => {
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error(tEmpresa('fileTooLarge'))
      return false
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error(tEmpresa('fileFormatInvalid'))
      return false
    }
    return true
  }

  const handleSelectForCrop =
    (target: CropTarget) => (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (!file || !validateImage(file)) return
      const reader = new FileReader()
      reader.onload = () => {
        setImageToCrop(reader.result as string)
        setCropTarget(target)
      }
      reader.readAsDataURL(file)
    }

  const handleCropConfirm = (croppedFile: File) => {
    const previewUrl = URL.createObjectURL(croppedFile)
    if (cropTarget === 'photo') {
      setPhotoFile(croppedFile)
      setPhotoPreview(previewUrl)
    } else if (cropTarget === 'logo') {
      setLogoFile(croppedFile)
      setLogoPreview(previewUrl)
    }
    setCropTarget(null)
    setImageToCrop(null)
  }

  const closeCropModal = () => {
    setCropTarget(null)
    setImageToCrop(null)
  }

  const uploadImage = async (
    bucket: string,
    file: File,
    userId: string,
  ): Promise<string> => {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${userId}/${bucket}-${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true })
    if (error) {
      throw new Error(error.message)
    }
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
  }

  const onSubmit = async (values: CompanyProfileInput) => {
    setLoading(true)
    try {
      // La foto va al bucket fotos-perfil (no exige fila empresario).
      let photoUrl = values.profilePhoto
      if (photoFile) {
        setUploadingPhoto(true)
        photoUrl = await uploadImage('fotos-perfil', photoFile, userId)
        setUploadingPhoto(false)
      }

      // Guardar primero crea/actualiza la fila empresario → habilita la RLS de
      // logos (que exige que el empresario ya exista).
      const baseProfile: CompanyProfileInput = {
        ...values,
        profilePhoto: photoUrl,
      }
      const firstSave = await saveCompanyProfile(baseProfile)
      if (!firstSave.ok) {
        throw new Error(firstSave.error)
      }

      let logoUrl = values.logo
      if (logoFile) {
        setUploadingLogo(true)
        logoUrl = await uploadImage('logos', logoFile, userId)
        setUploadingLogo(false)
        const logoSave = await saveCompanyProfile({
          ...baseProfile,
          logo: logoUrl,
        })
        if (!logoSave.ok) {
          throw new Error(logoSave.error)
        }
      }

      toast.success(tEmpresa('profileSaved'))
      router.push('/empresario/perfil')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tCommon('error'))
    } finally {
      setLoading(false)
      setUploadingPhoto(false)
      setUploadingLogo(false)
    }
  }

  const verif = initialProfile.verificationStatus

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-8">
        {/* Estado de verificación (solo lectura) */}
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card/40 px-4 py-3">
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-5 h-5 text-secondary shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {tEmpresa('verificationLabel')}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {tEmpresa('verificationHint')}
              </p>
            </div>
          </div>
          {verif ? (
            <span
              className={cn(
                'text-[11px] font-semibold px-2.5 py-0.5 rounded-full border',
                VERIF_STYLE[verif],
              )}
            >
              {tEmpresa(VERIF_KEY[verif])}
            </span>
          ) : (
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-border bg-muted text-muted-foreground">
              {tEmpresa('verifNone')}
            </span>
          )}
        </div>

        {/* === Datos del representante === */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {tEmpresa('sectionPersonalTitle')}
            </CardTitle>
            <CardDescription>{tEmpresa('sectionPersonalDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Field
                id="firstName"
                label={tEmpresa('fieldFirstName')}
                error={errors.firstName?.message}
              >
                <Input
                  id="firstName"
                  type="text"
                  placeholder={tEmpresa('fieldFirstNamePlaceholder')}
                  className="bg-card/50 border-border focus-visible:ring-primary"
                  {...register('firstName')}
                />
              </Field>
              <Field
                id="lastName1"
                label={tEmpresa('fieldLastName1')}
                error={errors.lastName1?.message}
              >
                <Input
                  id="lastName1"
                  type="text"
                  placeholder={tEmpresa('fieldLastName1Placeholder')}
                  className="bg-card/50 border-border focus-visible:ring-primary"
                  {...register('lastName1')}
                />
              </Field>
              <Field
                id="lastName2"
                label={tEmpresa('fieldLastName2')}
                optional={tEmpresa('optionalTag')}
                error={errors.lastName2?.message}
              >
                <Input
                  id="lastName2"
                  type="text"
                  placeholder={tEmpresa('fieldLastName2Placeholder')}
                  className="bg-card/50 border-border focus-visible:ring-primary"
                  {...register('lastName2')}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field
                id="birthDate"
                label={tEmpresa('fieldBirthDate')}
                error={errors.birthDate?.message}
              >
                <Input
                  id="birthDate"
                  type="date"
                  max={maxBirthDate}
                  className="bg-card/50 border-border focus-visible:ring-primary"
                  {...register('birthDate')}
                />
              </Field>
              <ReadonlyField
                label={tEmpresa('emailReadonly')}
                value={initialProfile.contactEmail}
                hint={tEmpresa('emailReadonlyHint')}
              />
            </div>

            <ImageUploadField
              label={tEmpresa('fieldPhoto')}
              title={tEmpresa('uploadPhotoTitle')}
              preview={photoPreview}
              uploading={uploadingPhoto}
              disabled={loading}
              rounded
              onSelect={handleSelectForCrop('photo')}
            />
          </CardContent>
        </Card>

        {/* === Datos de la empresa === */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {tEmpresa('sectionCompanyTitle')}
            </CardTitle>
            <CardDescription>{tEmpresa('sectionCompanyDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Field
              id="name"
              label={tEmpresa('fieldName')}
              error={errors.name?.message}
            >
              <Input
                id="name"
                type="text"
                placeholder={tEmpresa('fieldNamePlaceholder')}
                className="bg-card/50 border-border focus-visible:ring-primary"
                {...register('name')}
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field
                id="companyType"
                label={tEmpresa('fieldType')}
                error={errors.companyType?.message}
              >
                <Controller
                  name="companyType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full bg-card/50 border-border focus:ring-primary">
                        <SelectValue
                          placeholder={tEmpresa('selectTypePlaceholder')}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="formal">
                          {tEmpresa('typeFormal')}
                        </SelectItem>
                        <SelectItem value="emprendedor">
                          {tEmpresa('typeEmprendedor')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="text-[11px] text-muted-foreground">
                  {tEmpresa('typeHint')}
                </p>
              </Field>
              <Field
                id="sector"
                label={tEmpresa('fieldSector')}
                error={errors.sector?.message}
              >
                <Input
                  id="sector"
                  type="text"
                  placeholder={tEmpresa('fieldSectorPlaceholder')}
                  className="bg-card/50 border-border focus-visible:ring-primary"
                  {...register('sector')}
                />
              </Field>
            </div>

            <Field
              id="cedula"
              label={
                watchedType === 'emprendedor'
                  ? tEmpresa('fieldCedulaIdentidad')
                  : tEmpresa('fieldCedulaJuridica')
              }
              error={errors.cedula?.message}
            >
              <Input
                id="cedula"
                type="text"
                placeholder={tEmpresa('fieldCedulaPlaceholder')}
                className="bg-card/50 border-border focus-visible:ring-primary"
                {...register('cedula')}
              />
            </Field>

            <CountryRegionFields
              countries={countries}
              initialRegions={initialRegions}
              countryValue={watch('country') ?? ''}
              regionValue={watch('city') ?? ''}
              onCountryChange={(code) =>
                setValue('country', code, { shouldValidate: true })
              }
              onRegionChange={(code) =>
                setValue('city', code, { shouldValidate: true })
              }
              countryLabel={tEmpresa('fieldCountry')}
              countryId="country"
              regionId="city"
              countryInvalid={Boolean(errors.country)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field
                id="operatingScope"
                label={tEmpresa('fieldScope')}
                error={errors.operatingScope?.message}
              >
                <Controller
                  name="operatingScope"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ''}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full bg-card/50 border-border focus:ring-primary">
                        <SelectValue
                          placeholder={tEmpresa('selectScopePlaceholder')}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nacional">
                          {tEmpresa('scopeNacional')}
                        </SelectItem>
                        <SelectItem value="internacional">
                          {tEmpresa('scopeInternacional')}
                        </SelectItem>
                        <SelectItem value="ambos">
                          {tEmpresa('scopeAmbos')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>

            <Field
              id="website"
              label={tEmpresa('fieldWebsite')}
              optional={tEmpresa('optionalTag')}
              error={errors.website?.message}
            >
              <Input
                id="website"
                type="url"
                placeholder={tEmpresa('fieldWebsitePlaceholder')}
                className="bg-card/50 border-border focus-visible:ring-primary"
                {...register('website')}
              />
            </Field>

            <Field
              id="description"
              label={tEmpresa('fieldDescription')}
              optional={tEmpresa('optionalTag')}
              hint={tCommon('minCharsLabel', { n: 20 })}
              error={errors.description?.message}
            >
              <Textarea
                id="description"
                rows={4}
                placeholder={tEmpresa('fieldDescriptionPlaceholder')}
                className="bg-card/50 border-border focus-visible:ring-primary"
                {...register('description')}
              />
            </Field>

            <input type="hidden" {...register('logo')} />
            <ImageUploadField
              label={tEmpresa('fieldLogoUpload')}
              title={tEmpresa('uploadLogoTitle')}
              preview={logoPreview}
              uploading={uploadingLogo}
              disabled={loading}
              onSelect={handleSelectForCrop('logo')}
            />
            {errors.logo?.message && (
              <p className="text-xs font-semibold text-destructive">
                {errors.logo.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* El correo viaja oculto (no editable); la BD lo congela igual. */}
        <input type="hidden" {...register('contactEmail')} />
        <input type="hidden" {...register('profilePhoto')} />

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold flex items-center gap-1.5 shadow-sm px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {loading ? tCommon('loading') : tEmpresa('saveProfile')}
          </Button>
        </div>
      </form>

      <ImageCropModal
        open={cropTarget !== null}
        onOpenChange={(open) => {
          if (!open) closeCropModal()
        }}
        imageSrc={imageToCrop}
        labels={{
          title: tEmpresa('cropImageTitle'),
          description: tEmpresa('cropImageDesc'),
          cancel: tCommon('cancel'),
          confirm: tEmpresa('cropConfirm'),
        }}
        onConfirm={handleCropConfirm}
      />
    </>
  )
}

function Field({
  id,
  label,
  optional,
  hint,
  error,
  children,
}: {
  id: string
  label: string
  optional?: string | undefined
  hint?: string | undefined
  error?: string | undefined
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="text-sm font-bold flex justify-between items-center gap-2"
      >
        <span>
          {label}
          {optional && (
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
              ({optional})
            </span>
          )}
        </span>
        {hint && (
          <span className="text-xs font-normal text-muted-foreground">
            {hint}
          </span>
        )}
      </Label>
      {children}
      {error && (
        <p className="text-xs font-semibold text-destructive">{error}</p>
      )}
    </div>
  )
}

function ReadonlyField({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-bold block">{label}</Label>
      <Input
        type="text"
        value={value}
        readOnly
        disabled
        className="bg-muted/40 border-border text-muted-foreground"
      />
      <p className="text-[11px] text-muted-foreground">{hint}</p>
    </div>
  )
}

function ImageUploadField({
  label,
  title,
  preview,
  uploading,
  disabled,
  rounded,
  onSelect,
}: {
  label: string
  title: string
  preview: string | null
  uploading: boolean
  disabled: boolean
  rounded?: boolean
  onSelect: (event: ChangeEvent<HTMLInputElement>) => void
}) {
  const tEmpresa = useTranslations('Empresa')
  return (
    <div className="space-y-2">
      <Label className="text-sm font-bold block text-left">{label}</Label>
      <div className="flex flex-col sm:flex-row gap-4 items-center p-4 bg-card/40 border border-dashed border-border rounded-xl hover:border-primary/50 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]">
        <div
          className={cn(
            'w-20 h-20 bg-muted flex items-center justify-center shrink-0 border border-border overflow-hidden relative',
            rounded ? 'rounded-full' : 'rounded-xl',
          )}
        >
          {preview ? (
            // referrerPolicy="no-referrer": los avatares de Google
            // (lh3.googleusercontent.com) bloquean el hotlink cuando la request
            // manda `Referer`; sin referrer cargan igual que abiertos directo.
            // Inofensivo para blobs de preview y URLs propias de Supabase.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt=""
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
          )}
          {uploading && (
            <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          )}
        </div>
        <div className="flex-1 text-center sm:text-left space-y-1">
          <p className="text-xs font-semibold text-foreground">{title}</p>
          <p className="text-[10px] text-muted-foreground">
            {tEmpresa('uploadFormats')}
          </p>
          <label className="inline-block">
            <span className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/15 text-primary hover:bg-primary/25 text-[11px] font-bold rounded-lg transition-all">
              <Upload className="w-3.5 h-3.5" />
              {tEmpresa('selectFile')}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={disabled}
              onChange={onSelect}
            />
          </label>
        </div>
      </div>
    </div>
  )
}
