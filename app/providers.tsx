"use client"

import type React from "react"

import { AuthProvider } from "@/lib/auth-context"
import { RTLProvider } from "@/components/ui/rtl-provider"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <RTLProvider>
      <AuthProvider>
        {children}
        <Toaster
          position="top-center"
          dir="rtl"
          toastOptions={{
            style: {
              textAlign: "right",
              direction: "rtl",
            },
          }}
        />
      </AuthProvider>
    </RTLProvider>
  )
}
