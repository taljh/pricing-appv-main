"use client"

import * as React from "react"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ToggleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked: boolean
  onCheckedChange?: (checked: boolean) => void
  activeLabel?: string
  inactiveLabel?: string
  size?: "default" | "sm" | "lg"
  disabled?: boolean
}

const ToggleButton = React.forwardRef<HTMLButtonElement, ToggleButtonProps>(
  (
    { 
      className, 
      checked, 
      onCheckedChange, 
      activeLabel = "مفعل", 
      inactiveLabel = "غير مفعل", 
      size = "default",
      disabled = false,
      ...props 
    }, 
    ref
  ) => {
    const handleClick = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked)
      }
    }

    const sizes = {
      default: "px-4 py-2 text-sm",
      sm: "px-3 py-1.5 text-xs",
      lg: "px-5 py-2.5 text-base"
    }

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          "flex items-center gap-1.5 rounded-md font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rtl:text-right",
          checked
            ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-md"
            : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200",
          disabled && "opacity-50 cursor-not-allowed",
          sizes[size],
          className
        )}
        dir="rtl"
        {...props}
      >
        {checked ? (
          <>
            <Check className="h-3.5 w-3.5" />
            <span>{activeLabel}</span>
          </>
        ) : (
          <>
            <X className="h-3.5 w-3.5" />
            <span>{inactiveLabel}</span>
          </>
        )}
      </button>
    )
  }
)

ToggleButton.displayName = "ToggleButton"

export { ToggleButton }