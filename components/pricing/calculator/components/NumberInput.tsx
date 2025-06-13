"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface NumberInputProps {
  label: string
  value: number
  onChange: (value: number) => void
  required?: boolean
  disabled?: boolean
  description?: string
}

export default function NumberInput({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  description,
}: NumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === "" ? 0 : Number.parseFloat(e.target.value)
    onChange(isNaN(newValue) ? 0 : newValue)
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium flex items-center gap-1">
        {label}
        {required && <span className="text-red-500 text-xs">*</span>}
      </Label>
      <div className="relative">
        <Input
          type="number"
          step="0.01"
          min="0"
          value={value || 0}
          onChange={handleChange}
          className="text-right pr-12 pl-3 font-medium tabular-nums max-w-[200px]"
          dir="rtl"
          disabled={disabled}
        />
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground pointer-events-none font-medium">
          ريال
        </span>
      </div>
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
  )
}
