"use client"
import { useRTL } from "@/lib/rtl-context"

interface ArabicNumberProps {
  value: number | string | null | undefined
  currency?: boolean
  precision?: number
  compact?: boolean
  className?: string
  currencyCode?: string
  currencyDisplay?: "symbol" | "narrowSymbol" | "code" | "name"
}

/**
 * Arabic Number Component - محسن لمنع أخطاء NaN
 * مكون متخصص لعرض الأرقام بتنسيق عربي مع حماية شاملة من الأخطاء
 */
export function ArabicNumber({
  value,
  currency = false,
  precision = 0,
  compact = false,
  className = "",
  currencyCode = "SAR",
  currencyDisplay = "narrowSymbol",
}: ArabicNumberProps) {
  const { isRTL } = useRTL()
  const locale = isRTL ? "ar-SA" : "en-US"

  // دالة تنظيف وتحويل القيم بحماية شاملة
  const sanitizeValue = (inputValue: any): number => {
    // التعامل مع القيم الفارغة
    if (inputValue === null || inputValue === undefined || inputValue === "") {
      return 0
    }

    // التعامل مع النصوص
    if (typeof inputValue === "string") {
      const cleaned = inputValue.replace(/[^\d.-]/g, "")
      if (cleaned === "" || cleaned === "-") return 0
      const parsed = Number.parseFloat(cleaned)
      return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed
    }

    // التعامل مع الأرقام
    if (typeof inputValue === "number") {
      return isNaN(inputValue) || !isFinite(inputValue) ? 0 : inputValue
    }

    // أي نوع آخر
    const converted = Number(inputValue)
    return isNaN(converted) || !isFinite(converted) ? 0 : converted
  }

  const safeValue = Math.max(0, sanitizeValue(value))

  const getFormattedNumber = (): string => {
    try {
      // التأكد من أن القيمة رقم صالح قبل التنسيق
      if (!isFinite(safeValue) || isNaN(safeValue)) {
        return currency ? "0 ريال" : "0"
      }

      const options: Intl.NumberFormatOptions = {
        maximumFractionDigits: precision,
        minimumFractionDigits: currency ? 0 : 0,
      }

      if (compact) {
        options.notation = "compact"
        options.compactDisplay = "short"
      }

      if (currency) {
        options.style = "currency"
        options.currency = currencyCode
        options.currencyDisplay = currencyDisplay
      }

      const formatter = new Intl.NumberFormat(locale, options)
      const formatted = formatter.format(safeValue)

      // التأكد من أن النتيجة نص صالح وليس NaN
      if (typeof formatted === "string" && formatted !== "NaN" && !formatted.includes("NaN")) {
        return formatted
      }

      // fallback formatting إذا فشل التنسيق
      if (currency) {
        return `${safeValue.toFixed(precision)} ريال`
      }
      return safeValue.toFixed(precision)
    } catch (error) {
      console.warn("Error formatting number:", error)
      // fallback formatting
      if (currency) {
        return `${safeValue.toFixed(precision)} ريال`
      }
      return safeValue.toFixed(precision)
    }
  }

  const formattedValue = getFormattedNumber()

  // التأكد من أن القيمة المعروضة ليست NaN
  const displayValue = formattedValue && formattedValue !== "NaN" ? formattedValue : currency ? "0 ريال" : "0"

  return (
    <span className={className} suppressHydrationWarning>
      {displayValue}
    </span>
  )
}

/**
 * Format Price - دالة مساعدة محسنة
 */
export function formatPrice(
  value: number | string | null | undefined,
  currencyCode = "SAR",
  locale = "ar-SA",
  precision = 0,
): string {
  const sanitizeValue = (inputValue: any): number => {
    if (inputValue === null || inputValue === undefined || inputValue === "") return 0
    if (typeof inputValue === "string") {
      const cleaned = inputValue.replace(/[^\d.-]/g, "")
      if (cleaned === "" || cleaned === "-") return 0
      const parsed = Number.parseFloat(cleaned)
      return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed
    }
    if (typeof inputValue === "number") {
      return isNaN(inputValue) || !isFinite(inputValue) ? 0 : inputValue
    }
    const converted = Number(inputValue)
    return isNaN(converted) || !isFinite(converted) ? 0 : converted
  }

  const safeValue = Math.max(0, sanitizeValue(value))

  // التأكد من أن القيمة صالحة قبل التنسيق
  if (!isFinite(safeValue) || isNaN(safeValue)) {
    return `0 ريال`
  }

  try {
    const formatted = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: precision,
      minimumFractionDigits: 0,
      currencyDisplay: "narrowSymbol",
    }).format(safeValue)

    // التأكد من أن النتيجة لا تحتوي على NaN
    if (formatted && !formatted.includes("NaN")) {
      return formatted
    }
  } catch (error) {
    console.warn("Error formatting price:", error)
  }

  return `${safeValue.toFixed(precision)} ريال`
}

/**
 * Format Number - دالة مساعدة محسنة
 */
export function formatNumber(
  value: number | string | null | undefined,
  locale = "ar-SA",
  precision = 0,
  compact = false,
): string {
  const sanitizeValue = (inputValue: any): number => {
    if (inputValue === null || inputValue === undefined || inputValue === "") return 0
    if (typeof inputValue === "string") {
      const cleaned = inputValue.replace(/[^\d.-]/g, "")
      if (cleaned === "" || cleaned === "-") return 0
      const parsed = Number.parseFloat(cleaned)
      return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed
    }
    if (typeof inputValue === "number") {
      return isNaN(inputValue) || !isFinite(inputValue) ? 0 : inputValue
    }
    const converted = Number(inputValue)
    return isNaN(converted) || !isFinite(converted) ? 0 : converted
  }

  const safeValue = Math.max(0, sanitizeValue(value))

  // التأكد من أن القيمة صالحة قبل التنسيق
  if (!isFinite(safeValue) || isNaN(safeValue)) {
    return "0"
  }

  try {
    const formatted = new Intl.NumberFormat(locale, {
      maximumFractionDigits: precision,
      notation: compact ? "compact" : "standard",
    }).format(safeValue)

    // التأكد من أن النتيجة لا تحتوي على NaN
    if (formatted && !formatted.includes("NaN")) {
      return formatted
    }
  } catch (error) {
    console.warn("Error formatting number:", error)
  }

  return safeValue.toFixed(precision)
}

/**
 * Safe Number - دالة مساعدة للتحقق من الأرقام
 */
export function safeNumber(value: any): number {
  if (value === null || value === undefined || value === "") return 0
  if (typeof value === "string") {
    const cleaned = value.replace(/[^\d.-]/g, "")
    if (cleaned === "" || cleaned === "-") return 0
    const parsed = Number.parseFloat(cleaned)
    return isNaN(parsed) || !isFinite(parsed) ? 0 : Math.max(0, parsed)
  }
  if (typeof value === "number") {
    return isNaN(value) || !isFinite(value) ? 0 : Math.max(0, value)
  }
  const converted = Number(value)
  return isNaN(converted) || !isFinite(converted) ? 0 : Math.max(0, converted)
}
