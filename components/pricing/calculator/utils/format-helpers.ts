/**
 * مساعدات التنسيق للحاسبة
 * أدوات مساعدة لتنسيق الأرقام والعملات بالشكل المناسب للغة العربية
 */

/**
 * دالة آمنة للتحقق من صحة الأرقام
 */
function safeNumber(value: any): number {
  if (value === null || value === undefined || value === "") return 0
  const num = Number(value)
  if (isNaN(num) || !isFinite(num)) return 0
  return Math.max(0, num)
}

/**
 * تنسيق الرقم بالعملة (الريال)
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  const safeAmount = safeNumber(amount)

  try {
    const formatted = new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(safeAmount)

    // التأكد من أن النتيجة لا تحتوي على NaN
    if (formatted && !formatted.includes("NaN")) {
      return formatted
    }
  } catch (error) {
    console.warn("Error formatting currency:", error)
  }

  return `${safeAmount} ريال`
}

/**
 * تنسيق الرقم كنسبة مئوية
 */
export function formatPercent(amount: number | string | null | undefined): string {
  const safeAmount = safeNumber(amount)

  try {
    const formatted = new Intl.NumberFormat("ar-SA", {
      style: "percent",
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(safeAmount / 100)

    // التأكد من أن النتيجة لا تحتوي على NaN
    if (formatted && !formatted.includes("NaN")) {
      return formatted
    }
  } catch (error) {
    console.warn("Error formatting percent:", error)
  }

  return `${safeAmount.toFixed(1)}%`
}

/**
 * تقريب الرقم لأقرب 5 ريالات
 */
export function roundToNearest5(amount: number | string | null | undefined): number {
  const safeAmount = safeNumber(amount)
  const rounded = Math.ceil(safeAmount / 5) * 5
  return isNaN(rounded) || !isFinite(rounded) ? 0 : rounded
}

/**
 * تنسيق رقم عادي
 */
export function formatNumber(amount: number | string | null | undefined): string {
  const safeAmount = safeNumber(amount)

  try {
    const formatted = new Intl.NumberFormat("ar-SA").format(safeAmount)

    // التأكد من أن النتيجة لا تحتوي على NaN
    if (formatted && !formatted.includes("NaN")) {
      return formatted
    }
  } catch (error) {
    console.warn("Error formatting number:", error)
  }

  return safeAmount.toString()
}

/**
 * حساب النسبة المئوية
 */
export function calculatePercentage(
  amount: number | string | null | undefined,
  total: number | string | null | undefined,
): number {
  const safeAmount = safeNumber(amount)
  const safeTotal = safeNumber(total)

  if (safeTotal === 0) return 0

  const percentage = (safeAmount / safeTotal) * 100
  return isNaN(percentage) || !isFinite(percentage) ? 0 : percentage
}

/**
 * تقريب رقم لعدد معين من الخانات العشرية
 */
export function roundToDecimal(amount: number | string | null | undefined, decimals = 2): number {
  const safeAmount = safeNumber(amount)
  const factor = Math.pow(10, decimals)
  const rounded = Math.round(safeAmount * factor) / factor
  return isNaN(rounded) || !isFinite(rounded) ? 0 : rounded
}
