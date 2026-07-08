'use client'

import { useEffect, useState } from 'react'
import Cropper from 'react-easy-crop'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface PixelCrop {
  x: number
  y: number
  width: number
  height: number
}

const OUTPUT_SIZE = 500
const OUTPUT_QUALITY = 0.9

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

/**
 * Recorta `imageSrc` al área `pixelCrop` y devuelve un `File` JPEG cuadrado.
 * Lógica de canvas (DOM), compartida por el editor de egresado y el de empresario.
 */
async function getCroppedImage(
  imageSrc: string,
  pixelCrop: PixelCrop,
): Promise<File | null> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  canvas.width = OUTPUT_SIZE
  canvas.height = OUTPUT_SIZE

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE,
  )

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return resolve(null)
        resolve(new File([blob], 'cropped_image.jpg', { type: 'image/jpeg' }))
      },
      'image/jpeg',
      OUTPUT_QUALITY,
    )
  })
}

interface ImageCropModalLabels {
  title: string
  description: string
  cancel: string
  confirm: string
}

interface ImageCropModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageSrc: string | null
  /** True mientras el padre procesa el archivo recortado (p. ej. lo sube). */
  processing?: boolean
  /** Relación de aspecto del recorte. Por defecto cuadrado (1:1). */
  aspect?: number
  labels: ImageCropModalLabels
  onConfirm: (croppedFile: File) => void | Promise<void>
  /** Se invoca si el recorte falla (canvas sin contexto / blob nulo). */
  onError?: () => void
}

/**
 * Modal de recorte de imagen reutilizable. Solo recorta y entrega un `File`
 * vía `onConfirm`; el padre decide qué hacer con él (subir a Cloudinary, dejarlo
 * para el submit, etc.). Mantiene el mismo recorte cuadrado para ambos perfiles.
 */
export function ImageCropModal({
  open,
  onOpenChange,
  imageSrc,
  processing = false,
  aspect = 1,
  labels,
  onConfirm,
  onError,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(
    null,
  )

  // El modal es una única instancia reutilizada para distintos campos (foto,
  // logo). Sin este reset, el segundo recorte de la sesión arranca con el
  // zoom/posición/área pegados del recorte anterior.
  useEffect(() => {
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
  }, [imageSrc])

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return
    const croppedFile = await getCroppedImage(imageSrc, croppedAreaPixels)
    if (!croppedFile) {
      onError?.()
      return
    }
    await onConfirm(croppedFile)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] flex flex-col gap-0 p-0 overflow-hidden bg-surface rounded-xl">
        <DialogHeader className="p-4 border-b bg-muted/30">
          <DialogTitle className="text-center font-medium">
            {labels.title}
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 space-y-6">
          <div className="space-y-2 text-center">
            <p className="text-sm text-muted-foreground">
              {labels.description}
            </p>
          </div>
          <div className="relative w-full h-[400px] bg-foreground/5 rounded-md overflow-hidden">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                cropShape="rect"
                showGrid={true}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, croppedPixels) =>
                  setCroppedAreaPixels(croppedPixels)
                }
              />
            )}
          </div>
          <div className="flex w-full justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={processing}
            >
              {labels.cancel}
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={processing}
              onClick={handleConfirm}
            >
              {processing ? '...' : labels.confirm}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
