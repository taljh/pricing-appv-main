/**
 * مكتبة مساعدة للتعامل مع الأرقام بأمان
 * Number utilities library with comprehensive safety checks
 */

/**
 * تحويل أي قيمة إلى رقم آمن
 * Convert any value to a safe number
 */
export function safeNumber(value: any): number {
  // التعامل مع القيم الفارغة
  if (value === null || value === undefined || value === "") {
    return 0
  }

  // التعامل مع النصوص
  if (typeof value === "string") {
    // إزالة الأحرف غير الرقمية عدا النقطة والسالب
    const cleaned = value.replace(/[^\d.-]/g, "")
    if (cleaned === "" || cleaned === "-") return 0

    const parsed = Number.parseFloat(cleaned)
    return isNaN(parsed) || !isFinite(parsed) ? 0 : Math.max(0, parsed)
  }

  // التعامل مع الأرقام
  if (typeof value === "number") {
    return isNaN(value) || !isFinite(value) ? 0 : Math.max(0, value)
  }

  // محاولة التحويل لأي نوع آخر
  const converted = Number(value)
  return isNaN(converted) || !isFinite(converted) ? 0 : Math.max(0, converted)
}

/**
 * تحويل قيمة إلى نسبة مئوية آمنة
 * Convert value to safe percentage
 */
export function safePercentage(value: any, total: any): number {
  const safeVal = safeNumber(value)
  const safeTotal = safeNumber(total)

  if (safeTotal === 0) return 0

  const percentage = (safeVal / safeTotal) * 100
  return isNaN(percentage) || !isFinite(percentage) ? 0 : percentage
}

/**
 * قسمة آمنة
 * Safe division
 */
export function safeDivision(numerator: any, denominator: any): number {
  const safeNum = safeNumber(numerator)
  const safeDen = safeNumber(denominator)

  if (safeDen === 0) return 0

  const result = safeNum / safeDen
  return isNaN(result) || !isFinite(result) ? 0 : result
}

/**
 * ضرب آمن
 * Safe multiplication
 */
export function safeMultiplication(...values: any[]): number {
  let result = 1

  for (const value of values) {
    const safeVal = safeNumber(value)
    result *= safeVal

    if (!isFinite(result) || isNaN(result)) {
      return 0
    }
  }

  return result
}

/**
 * جمع آمن
 * Safe addition
 */
export function safeAddition(...values: any[]): number {
  let result = 0

  for (const value of values) {
    const safeVal = safeNumber(value)
    result += safeVal

    if (!isFinite(result) || isNaN(result)) {
      return 0
    }
  }

  return result
}

/**
 * تقريب آمن
 * Safe rounding
 */
export function safeRound(value: any, decimals = 0): number {
  const safeVal = safeNumber(value)
  const multiplier = Math.pow(10, decimals)

  const result = Math.round(safeVal * multiplier) / multiplier
  return isNaN(result) || !isFinite(result) ? 0 : result
}

/**
 * تحقق من صحة الرقم
 * Validate if number is valid
 */
export function isValidNumber(value: any): boolean {
  const num = Number(value)
  return !isNaN(num) && isFinite(num) && num >= 0
}

/**
 * تنسيق الرقم للعرض
 * Format number for display
 */
export function formatDisplayNumber(value: any, decimals = 2): string {
  const safeVal = safeNumber(value)
  return safeVal.toFixed(decimals)
}

/**
 * تحويل إلى عدد صحيح آمن
 * Convert to safe integer
 */
export function safeInteger(value: any): number {
  const safeVal = safeNumber(value)
  return Math.floor(safeVal)
}
