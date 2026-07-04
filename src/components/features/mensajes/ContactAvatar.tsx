import { cn } from '@/lib/utils/cn'

const AVATAR_COLORS = [
  'bg-primary/20 text-primary',
  'bg-secondary/20 text-secondary',
  'bg-accent/20 text-accent',
  'bg-warning/20 text-warning',
  'bg-magenta/20 text-magenta',
  'bg-highlight/20 text-foreground',
]

const FALLBACK_AVATAR_COLOR = 'bg-primary/20 text-primary'

function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash + name.charCodeAt(i)) % AVATAR_COLORS.length
  }
  return AVATAR_COLORS[hash] ?? FALLBACK_AVATAR_COLOR
}

function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(' ')
    .filter((p) => p.length > 0)
  const first = parts[0]?.[0] ?? ''
  const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + second).toUpperCase()
}

const SIZE_CLASSES = {
  sm: 'w-9 h-9 text-xs',
  md: 'w-10 h-10 text-sm',
} as const

interface ContactAvatarProps {
  name: string
  size?: keyof typeof SIZE_CLASSES
}

export function ContactAvatar({ name, size = 'sm' }: ContactAvatarProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-heading font-bold',
        getAvatarColor(name),
        SIZE_CLASSES[size],
      )}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  )
}
