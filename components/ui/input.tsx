'use client'

import * as React from 'react'
import { cn } from '@/components/ui/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'flex h-11 w-full rounded-xl border border-vouch-200 bg-white px-4 py-2 text-sm shadow-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-vouch-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vouch-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-xl border border-vouch-200 bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-vouch-600 focus:ring-offset-2 disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
)
Select.displayName = 'Select'
