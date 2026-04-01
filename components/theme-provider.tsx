'use client'

import * as React from 'react'
import { DirectionProvider } from '@radix-ui/react-direction'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

/**
 * Radix primitives (Tabs, RovingFocus, Menu, …) default to ltr without this.
 * Must match <html dir="rtl"> so layout, grid order, and text align correctly.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <DirectionProvider dir="rtl">
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
    </DirectionProvider>
  )
}
