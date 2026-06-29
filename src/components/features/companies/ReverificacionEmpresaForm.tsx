'use client'

import { useRef, useState, useMemo } from 'react'
import { useRouter } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { User, Upload, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { reverificarEmpresa } from '@/lib/company/actions'
import { CountryRegionFields } from '@/components/features/geo/CountryRegionFields'
import type { ComboboxOption } from '@/components/ui/combobox'

/**
 * Valores iniciales para prellenar el formulario de re-verificación con los
 * datos actuales del empresario rechazado. Los campos de enum se pasan vacíos
 * solo si aún no había valor (el placeholder del select).
 */
export interface ReverificacionInitialValues {
  nombre: string
  primer_apellido: string
  segundo_apellido: string
  fecha_nacimiento: string
  nombre_empresa: string
  cedula: string
  sitio_web: string
  tipo_empresario: 'empresa_formal' | 'emprendedor' | ''
  pais: string
  ciudad: string
  alcance_operativo: 'nacional' | 'internacional' | 'ambos' | ''
  foto_perfil: string
}

interface ReverificacionEmpresaFormProps {
  userId: string
  countries: ComboboxOption[]
  initialRegions: ComboboxOption[]
  initialValues: ReverificacionInitialValues
}

/**
 * Formulario enfocado de re-verificación del empresario rechazado (A2 Fase 2).
 * Reusa el set de campos del onboarding (representante + empresa core), sin
 * logo/sector/descripción ni términos (ya aceptados). Al enviar actualiza los
 * datos y devuelve el estado a 'pendiente' vía `reverificarEmpresa`.
 */
export function ReverificacionEmpresaForm({
  userId,
  countries,
  initialRegions,
  initialValues,
}: ReverificacionEmpresaFormProps) {
  const tO = useTranslations('Onboarding')
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [fotoUrl, setFotoUrl] = useState<string | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(
    initialValues.foto_perfil || null,
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const maxBirthDate = useMemo(() => {
    const d = new Date()
    d.setFullYear(d.getFullYear() - 18)
    return d.toISOString().split('T')[0]
  }, [])

  const schema = useMemo(
    () =>
      z.object({
        nombre: z
          .string()
          .min(2, tO('errorNombre'))
          .max(80, tO('errorNombreMax')),
        primer_apellido: z
          .string()
          .min(2, tO('errorPrimerApellido'))
          .max(80, tO('errorPrimerApellidoMax')),
        segundo_apellido: z
          .string()
          .max(80, tO('errorSegundoApellidoMax'))
          .optional(),
        fecha_nacimiento: z
          .string()
          .min(1, tO('errorFechaNacimiento'))
          .regex(/^\d{4}-\d{2}-\d{2}$/, tO('errorFechaFormato'))
          .refine((val) => {
            const birth = new Date(val + 'T00:00:00')
            const now = new Date()
            const age = now.getFullYear() - birth.getFullYear()
            const m = now.getMonth() - birth.getMonth()
            return (
              age > 18 ||
              (age === 18 &&
                (m > 0 || (m === 0 && now.getDate() >= birth.getDate())))
            )
          }, tO('errorMustBe18')),
        nombre_empresa: z
          .string()
          .min(2, tO('errorNombreEmpresa'))
          .max(150, tO('errorNombreEmpresaMax')),
        cedula: z.string().min(1, tO('errorCedula')).max(50, tO('errorCedula')),
        sitio_web: z
          .string()
          .url(tO('errorSitioWeb'))
          .max(200, tO('errorSitioWeb'))
          .or(z.literal(''))
          .optional(),
        tipo_empresario: z.enum(['empresa_formal', 'emprendedor'], {
          message: tO('errorTipoEmpresario'),
        }),
        pais: z.string().min(2, tO('errorPais')),
        ciudad: z.string(),
        alcance_operativo: z.enum(['nacional', 'internacional', 'ambos'], {
          message: tO('errorAlcance'),
        }),
      }),
    [tO],
  )

  type FormValues = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: initialValues.nombre,
      primer_apellido: initialValues.primer_apellido,
      segundo_apellido: initialValues.segundo_apellido,
      fecha_nacimiento: initialValues.fecha_nacimiento,
      nombre_empresa: initialValues.nombre_empresa,
      cedula: initialValues.cedula,
      sitio_web: initialValues.sitio_web,
      ...(initialValues.tipo_empresario
        ? { tipo_empresario: initialValues.tipo_empresario }
        : {}),
      pais: initialValues.pais,
      ciudad: initialValues.ciudad,
      ...(initialValues.alcance_operativo
        ? { alcance_operativo: initialValues.alcance_operativo }
        : {}),
    },
  })

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const isValidType = ['image/jpeg', 'image/png'].includes(file.type)
    const isValidSize = file.size <= 5 * 1024 * 1024
    if (!isValidType || !isValidSize) {
      toast.error(tO('fotoError'))
      return
    }

    setFotoPreview(URL.createObjectURL(file))
    setPhotoUploading(true)

    const supabase = createSupabaseBrowserClient()
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${userId}/${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('fotos-perfil')
      .upload(path, file, { upsert: true })

    if (error) {
      toast.error(tO('fotoError'))
      setPhotoUploading(false)
      return
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('fotos-perfil').getPublicUrl(path)

    setFotoUrl(publicUrl)
    setPhotoUploading(false)
  }

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    const result = await reverificarEmpresa({
      nombre: data.nombre,
      primerApellido: data.primer_apellido,
      ...(data.segundo_apellido
        ? { segundoApellido: data.segundo_apellido }
        : {}),
      fechaNacimiento: data.fecha_nacimiento,
      ...(fotoUrl ? { fotoPerfilUrl: fotoUrl } : {}),
      nombreEmpresa: data.nombre_empresa,
      cedula: data.cedula,
      ...(data.sitio_web ? { sitioWeb: data.sitio_web } : {}),
      tipoEmpresario: data.tipo_empresario,
      pais: data.pais,
      region: data.ciudad,
      alcanceOperativo: data.alcance_operativo,
    })
    setLoading(false)

    if (result.ok) {
      toast.success(tO('reverifySuccess'))
      router.refresh()
      return
    }
    toast.error(tO('reverifyError'))
  }

  const inputClass =
    'h-12 rounded-xl bg-surface-sunken/50 border-border focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all'
  const inputErrorClass =
    'h-12 rounded-xl bg-surface-sunken/50 border-destructive focus-visible:ring-1 focus-visible:ring-destructive focus-visible:border-destructive transition-all'
  const selectClass =
    'w-full h-12 rounded-xl border border-border bg-surface-sunken/50 px-3 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)] cursor-pointer'
  const selectErrorClass =
    'w-full h-12 rounded-xl border border-destructive bg-surface-sunken/50 px-3 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-destructive focus:border-destructive transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)] cursor-pointer'
  const labelClass = 'text-xs font-bold text-ink uppercase tracking-wider'
  const errorClass = 'text-xs font-semibold text-destructive mt-1'
  const sectionHeadingClass =
    'text-[10px] font-bold uppercase tracking-widest text-ink-subtle border-b border-border pb-2 mb-4'

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 text-left"
      noValidate
    >
      {/* Datos del representante */}
      <section className="space-y-4">
        <p className={sectionHeadingClass}>{tO('sectionPersonal')}</p>

        <div className="space-y-1.5">
          <Label className={labelClass}>
            {tO('labelFotoPerfil')}
            <span className="ml-1 text-ink-subtle font-normal normal-case tracking-normal">
              {tO('optional')}
            </span>
          </Label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-surface-sunken border border-border flex items-center justify-center overflow-hidden shrink-0">
              {fotoPreview ? (
                // Preview/foto actual: next/image no optimiza object URLs; <img> es
                // lo correcto para previsualizar.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={fotoPreview}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-7 h-7 text-ink-subtle" />
              )}
            </div>
            <div className="space-y-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={photoUploading}
                className="rounded-xl h-9 text-xs font-bold border-border hover:bg-surface-sunken"
              >
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                {photoUploading ? tO('fotoUploading') : tO('fotoUpload')}
              </Button>
              <p className="text-[11px] text-ink-subtle">{tO('fotoHint')}</p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className={labelClass}>{tO('labelNombre')}</Label>
            <Input
              {...register('nombre')}
              type="text"
              autoComplete="given-name"
              placeholder={tO('labelNombre')}
              className={errors.nombre ? inputErrorClass : inputClass}
            />
            {errors.nombre && (
              <p className={errorClass}>{errors.nombre.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className={labelClass}>{tO('labelPrimerApellido')}</Label>
            <Input
              {...register('primer_apellido')}
              type="text"
              autoComplete="family-name"
              placeholder={tO('labelPrimerApellido')}
              className={errors.primer_apellido ? inputErrorClass : inputClass}
            />
            {errors.primer_apellido && (
              <p className={errorClass}>{errors.primer_apellido.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className={labelClass}>
              {tO('labelSegundoApellido')}
              <span className="ml-1 text-ink-subtle font-normal normal-case tracking-normal">
                {tO('optional')}
              </span>
            </Label>
            <Input
              {...register('segundo_apellido')}
              type="text"
              placeholder={tO('labelSegundoApellido')}
              className={errors.segundo_apellido ? inputErrorClass : inputClass}
            />
            {errors.segundo_apellido && (
              <p className={errorClass}>{errors.segundo_apellido.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className={labelClass}>{tO('labelFechaNacimiento')}</Label>
            <Input
              {...register('fecha_nacimiento')}
              type="date"
              max={maxBirthDate}
              className={errors.fecha_nacimiento ? inputErrorClass : inputClass}
            />
            {errors.fecha_nacimiento && (
              <p className={errorClass}>{errors.fecha_nacimiento.message}</p>
            )}
          </div>
        </div>
      </section>

      {/* Datos de la empresa */}
      <section className="space-y-4">
        <p className={sectionHeadingClass}>{tO('sectionEmpresa')}</p>

        <div className="space-y-1.5">
          <Label className={labelClass}>{tO('labelNombreEmpresa')}</Label>
          <Input
            {...register('nombre_empresa')}
            type="text"
            placeholder={tO('labelNombreEmpresa')}
            className={errors.nombre_empresa ? inputErrorClass : inputClass}
          />
          {errors.nombre_empresa && (
            <p className={errorClass}>{errors.nombre_empresa.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className={labelClass}>{tO('labelCedula')}</Label>
          <Input
            {...register('cedula')}
            type="text"
            placeholder={tO('labelCedula')}
            className={errors.cedula ? inputErrorClass : inputClass}
          />
          {errors.cedula && (
            <p className={errorClass}>{errors.cedula.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className={labelClass}>{tO('labelSitioWeb')}</Label>
          <Input
            {...register('sitio_web')}
            type="url"
            placeholder="https://"
            className={errors.sitio_web ? inputErrorClass : inputClass}
          />
          {errors.sitio_web && (
            <p className={errorClass}>{errors.sitio_web.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className={labelClass}>{tO('labelTipoEmpresario')}</Label>
          <select
            {...register('tipo_empresario')}
            className={errors.tipo_empresario ? selectErrorClass : selectClass}
          >
            <option value="">{tO('tipoSelectPlaceholder')}</option>
            <option value="emprendedor">{tO('tipoEmprendedor')}</option>
            <option value="empresa_formal">{tO('tipoEmpresaFormal')}</option>
          </select>
          {errors.tipo_empresario && (
            <p className={errorClass}>{errors.tipo_empresario.message}</p>
          )}
        </div>

        <CountryRegionFields
          countries={countries}
          initialRegions={initialRegions}
          countryValue={watch('pais') ?? ''}
          regionValue={watch('ciudad') ?? ''}
          onCountryChange={(code) =>
            setValue('pais', code, { shouldValidate: true })
          }
          onRegionChange={(code) =>
            setValue('ciudad', code, { shouldValidate: true })
          }
          countryLabel={tO('labelPais')}
          countryId="pais"
          regionId="ciudad"
          countryInvalid={Boolean(errors.pais)}
        />
        {errors.pais && <p className={errorClass}>{errors.pais.message}</p>}

        <div className="space-y-1.5">
          <Label className={labelClass}>{tO('labelAlcance')}</Label>
          <select
            {...register('alcance_operativo')}
            className={
              errors.alcance_operativo ? selectErrorClass : selectClass
            }
          >
            <option value="">{tO('tipoSelectPlaceholder')}</option>
            <option value="nacional">{tO('alcanceNacional')}</option>
            <option value="internacional">{tO('alcanceInternacional')}</option>
            <option value="ambos">{tO('alcanceAmbos')}</option>
          </select>
          {errors.alcance_operativo && (
            <p className={errorClass}>{errors.alcance_operativo.message}</p>
          )}
        </div>
      </section>

      <Button
        type="submit"
        disabled={loading || photoUploading}
        className="w-full h-12 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] cursor-pointer"
      >
        {loading ? tO('reverifySaving') : tO('reverifySubmit')}
        {!loading && <ArrowRight className="w-4 h-4" />}
      </Button>
    </form>
  )
}
