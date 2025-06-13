'use client'

import * as React from 'react'

interface ThemeProviderProps {
  children: React.ReactNode
  [key: string]: any // للحفاظ على التوافق مع أي خصائص أخرى قد تمرر
}

// مكون ThemeProvider المبسط الذي يستخدم الوضع الفاتح فقط
export function ThemeProvider({ children }: ThemeProviderProps) {
  return <>{children}</>
}
