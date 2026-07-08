import React from 'react'
import { Button } from '@/components/ui/button'

interface OAuthButtonsProps {
  onGoogleClick: () => void
  disabled?: boolean
  googleText: string
}

export function OAuthButtons({
  onGoogleClick,
  disabled,
  googleText,
}: OAuthButtonsProps) {
  return (
    <div className="space-y-3 w-full">
      <Button
        type="button"
        variant="outline"
        onClick={onGoogleClick}
        disabled={disabled}
        className="w-full h-12 rounded-full border border-border-strong hover:bg-surface-sunken bg-surface font-semibold text-ink text-sm flex items-center justify-center gap-3 transition-all duration-200 shadow-sm"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.642 1.052 14.958 0 12 0 7.354 0 3.307 2.67 1.341 6.576l3.925 3.189z"
          />
          <path
            fill="#4285F4"
            d="M16.04 15.345c-1.077.733-2.502 1.107-4.04 1.107-2.927 0-5.414-1.986-6.3-4.664L1.75 14.94A11.94 11.94 0 0 0 12 24c3.24 0 6.19-1.08 8.4-2.91l-4.36-3.745z"
          />
          <path
            fill="#FBBC05"
            d="M5.7 11.788a7.07 7.07 0 0 1 0-2.024L1.775 6.576a11.942 11.942 0 0 0 0 10.848l3.926-3.636z"
          />
          <path
            fill="#34A853"
            d="M23.49 12.275c0-.825-.075-1.62-.215-2.385H12v4.56h6.48A5.54 5.54 0 0 1 16.04 18l4.36 3.745c2.55-2.35 4.09-5.81 4.09-9.47z"
          />
        </svg>
        <span>{googleText}</span>
      </Button>
    </div>
  )
}
