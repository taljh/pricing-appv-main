import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "compact" | "number"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          // تحسينات RTL للعربية
          "rtl:text-right ltr:text-left",
          "rtl:placeholder:text-right ltr:placeholder:text-left",
          // تحسين الحشو والارتفاع حسب النوع
          variant === "compact" && "h-9 px-3 py-1.5",
          variant === "number" && "h-9 px-3 py-1.5 text-right font-medium tabular-nums",
          variant === "default" && "h-10 px-3 py-2",
          // تحسين عرض الأرقام
          type === "number" && "tabular-nums font-medium text-right",
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = "Input"

export { Input }
