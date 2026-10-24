'use client'

import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/components/ui/cn'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'destructive' | 'ghost' | 'soft'
  size?: 'default' | 'sm' | 'lg'
  asChild?: boolean
  loading?: boolean
}

const variants = {
  default:
    'bg-vouch-600 text-white hover:bg-vouch-700 active:bg-vouch-800 shadow-sm',
  outline:
    'border border-vouch-200 bg-white hover:bg-vouch-50 text-vouch-700',
  destructive:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
  ghost: 'hover:bg-vouch-100 text-vouch-700',
  soft: 'bg-vouch-100 text-vouch-800 hover:bg-vouch-200',
}

const sizes = {
  default: 'h-11 px-5 py-2 text-sm font-medium',
  sm: 'h-9 px-3 text-xs font-medium',
  lg: 'h-12 px-8 text-base font-medium',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'default',
    size = 'default',
    asChild = false,
    loading = false,
    children,
    ...props
  }, ref) => {
    const Comp = asChild ? React.Fragment : 'button'
    return (
      <Comp
        ref={ref as React.Ref<HTMLButtonElement>}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-vouch-600 focus:ring-offset-2',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={props.disabled || loading}
        {...(asChild ? {} : { type: 'button' })}
        {...props}
      >
        {loading && (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" strokeWidth={2} />
        )}
        {children}
      </Comp>
    )
  }
)
Button.displayName = 'Button'
