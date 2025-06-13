"use client"

import { cn } from "@/lib/utils"

import type React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AdditionalCostSectionProps {
  label: string
  value: number | undefined
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  placeholder?: string
  className?: string
}

const AdditionalCostSection: React.FC<AdditionalCostSectionProps> = ({
  label,
  value,
  onChange,
  required = false,
  placeholder = "0",
  className = "",
}) => {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label
        htmlFor={label}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1"
      >
        {label}
        {required && <span className="text-red-500 text-xs">*</span>}
      </Label>
      <div className="relative">
        <Input
          type="number"
          value={value || ""}
          onChange={onChange}
          variant="compact"
          className="text-right pr-12 pl-3 font-medium tabular-nums"
          dir="rtl"
          placeholder={placeholder}
          step="0.01"
          min="0"
        />
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground pointer-events-none font-medium">
          ريال
        </span>
      </div>
    </div>
  )
}

export default AdditionalCostSection
