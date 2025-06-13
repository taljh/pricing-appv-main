"use client"

import { useMemo, useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

interface EmbroideryDetails {
  hasEmbroidery: boolean
  embroideryCost: number
}

interface CostSummaryCardProps {
  productName: string
  fabricMainCost: number
  fabricSecondaryCost?: number | null
  turhaMainCost?: number | null
  turhaSecondaryCost?: number | null
  tailoringCost: number
  embroideryDetails: EmbroideryDetails
  packagingCost: number
  deliveryCost?: number | null
  extraExpenses?: number | null
  fixedCosts: number
  marketingCost: number
  profitMargin: number
}

interface PaymentMethod {
  id: string
  name: string
  code: string
  percentage_fee: number
  fixed_fee: number
  tax_rate: number
  description: string
  is_active: boolean
}

interface ProjectPaymentMethod {
  id: string
  project_settings_id: string
  payment_method_code: string
  is_enabled: boolean
  payment_methods: PaymentMethod
}

export default function CostSummaryCard({
  productName,
  fabricMainCost = 0,
  fabricSecondaryCost = 0,
  turhaMainCost = 0,
  turhaSecondaryCost = 0,
  tailoringCost = 0,
  embroideryDetails,
  packagingCost = 0,
  deliveryCost = 0,
  extraExpenses = 0,
  fixedCosts = 0,
  marketingCost = 0,
  profitMargin = 0,
}: CostSummaryCardProps) {
  const [supabase] = useState(() => createClientComponentClient<Database>())
  const [enabledPaymentMethods, setEnabledPaymentMethods] = useState<PaymentMethod[]>([])
  const [highestFeeMethod, setHighestFeeMethod] = useState<PaymentMethod | null>(null)
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(true)
  const [showFullBreakdown, setShowFullBreakdown] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [hasMissingSettings, setHasMissingSettings] = useState(false)

  // دالة آمنة للأرقام لمنع NaN
  const safeNumber = (value: any): number => {
    if (value === null || value === undefined || value === "") return 0
    const num = Number(value)
    if (isNaN(num) || !isFinite(num)) return 0
    return Math.max(0, num)
  }

  // دالة آمنة لتنسيق الأرقام
  const safeFormat = (value: any, decimals = 2): string => {
    const num = safeNumber(value)
    return num.toFixed(decimals)
  }

  // تحقق من اكتمال البيانات عند التحميل
  useEffect(() => {
    async function checkSettings() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) return

        // التحقق من إعدادات المشروع
        const { data: projectSettings, error: projectError } = await supabase
          .from("project_settings")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle()

        // التحقق من التكاليف الثابتة
        const { data: fixedCostsData, error: fixedCostsError } = await supabase
          .from("fixed_costs")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle()

        // التحقق من طرق الدفع
        const { data: paymentMethods, error: paymentError } = await supabase
          .from("project_payment_methods")
          .select("*")
          .eq("is_enabled", true)
          .maybeSingle()

        // تحديد ما إذا كانت هناك بيانات مفقودة
        const isMissing = !projectSettings || !fixedCostsData || !paymentMethods

        setHasMissingSettings(isMissing)
      } catch (error) {
        console.error("Error checking settings:", error)
      }
    }

    checkSettings()
  }, [supabase])

  // تحميل طرق الدفع المفعلة من إعدادات المستخدم
  useEffect(() => {
    const loadEnabledPaymentMethods = async () => {
      try {
        setIsLoadingPaymentMethods(true)

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          console.error("User not authenticated:", userError)
          return
        }

        // الحصول على إعدادات المشروع للمستخدم
        const { data: projectSettings, error: projectError } = await supabase
          .from("project_settings")
          .select("id")
          .eq("user_id", user.id)
          .single()

        if (projectError || !projectSettings) {
          console.error("Project settings not found:", projectError)
          return
        }

        // الحصول على طرق الدفع المفعلة (sin relación anidada)
        const { data: projectPaymentMethods, error: paymentMethodsError } = await supabase
          .from("project_payment_methods")
          .select("id, project_settings_id, payment_method_code, is_enabled")
          .eq("project_settings_id", projectSettings.id)
          .eq("is_enabled", true)

        if (paymentMethodsError) {
          console.error("Error loading project payment methods:", paymentMethodsError)
          return
        }

        if (!projectPaymentMethods || projectPaymentMethods.length === 0) {
          setEnabledPaymentMethods([])
          return
        }

        // استخراج رموز طرق الدفع المفعلة
        const paymentMethodCodes = projectPaymentMethods.map((pm) => pm.payment_method_code)

        // الحصول على تفاصيل طرق الدفع في استعلام منفصل
        const { data: paymentMethodsDetails, error: detailsError } = await supabase
          .from("payment_methods")
          .select("id, name, code, percentage_fee, fixed_fee, tax_rate, description, is_active")
          .in("code", paymentMethodCodes)
          .eq("is_active", true)

        if (detailsError) {
          console.error("Error loading payment methods details:", detailsError)
          return
        }

        setEnabledPaymentMethods(paymentMethodsDetails || [])

        // العثور على طريقة الدفع ذات أعلى رسوم
        if (paymentMethodsDetails && paymentMethodsDetails.length > 0) {
          const highest = paymentMethodsDetails.reduce((prev, current) => {
            const prevTotalFee = prev.percentage_fee + prev.fixed_fee
            const currentTotalFee = current.percentage_fee + current.fixed_fee
            return currentTotalFee > prevTotalFee ? current : prev
          })
          setHighestFeeMethod(highest)
        }
      } catch (error) {
        console.error("Error loading payment methods:", error)
      } finally {
        setIsLoadingPaymentMethods(false)
      }
    }

    loadEnabledPaymentMethods()
  }, [supabase])

  // حساب تكلفة التطريز إذا كانت موجودة
  const embroideryCost = embroideryDetails?.hasEmbroidery ? safeNumber(embroideryDetails.embroideryCost) : 0

  // حساب إجمالي التكاليف المباشرة
  const directCosts = useMemo(() => {
    return [
      safeNumber(fabricMainCost),
      safeNumber(fabricSecondaryCost),
      safeNumber(turhaMainCost),
      safeNumber(turhaSecondaryCost),
      safeNumber(tailoringCost),
      safeNumber(embroideryCost),
      safeNumber(packagingCost),
      safeNumber(deliveryCost),
      safeNumber(extraExpenses),
      safeNumber(fixedCosts),
      safeNumber(marketingCost),
    ].reduce((sum, cost) => sum + cost, 0)
  }, [
    fabricMainCost,
    fabricSecondaryCost,
    turhaMainCost,
    turhaSecondaryCost,
    tailoringCost,
    embroideryCost,
    packagingCost,
    deliveryCost,
    extraExpenses,
    fixedCosts,
    marketingCost,
  ])

  // حساب هامش الربح
  const profitAmount = (directCosts * safeNumber(profitMargin)) / 100

  // حساب السعر قبل إضافة رسوم الدفع
  const priceBeforePaymentFee = directCosts + profitAmount

  // حساب رسوم الدفع الإلكتروني من إعدادات المستخدم
  const paymentProcessingFee = useMemo(() => {
    if (!highestFeeMethod || priceBeforePaymentFee <= 0) return 0

    // حساب الرسوم بناءً على طريقة الدفع المفعلة ذات أعلى رسوم
    const percentageFee = priceBeforePaymentFee * highestFeeMethod.percentage_fee
    const totalBeforeTax = percentageFee + highestFeeMethod.fixed_fee
    const tax = totalBeforeTax * highestFeeMethod.tax_rate

    return totalBeforeTax + tax
  }, [highestFeeMethod, priceBeforePaymentFee])

  // إجمالي السعر النهائي بعد إضافة رسوم الدفع
  const totalPrice = priceBeforePaymentFee + paymentProcessingFee

  // تحليل مكونات التكلفة لعرضها في رسم بياني - بدون رموز تعبيرية
  const costComponents = [
    {
      name: "المواد الخام",
      category: "مواد",
      value: safeNumber(fabricMainCost) + safeNumber(fabricSecondaryCost),
    },
    {
      name: "الطرحة والإكسسوارات",
      category: "مواد",
      value: safeNumber(turhaMainCost) + safeNumber(turhaSecondaryCost),
    },
    {
      name: "الخياطة والتطريز",
      category: "عمالة",
      value: safeNumber(tailoringCost) + safeNumber(embroideryCost),
    },
    {
      name: "التغليف والتوصيل",
      category: "خدمات",
      value: safeNumber(packagingCost) + safeNumber(deliveryCost),
    },
    {
      name: "التسويق والإعلان",
      category: "تسويق",
      value: safeNumber(marketingCost),
    },
    {
      name: "التكاليف الثابتة والإدارية",
      category: "إدارية",
      value: safeNumber(fixedCosts) + safeNumber(extraExpenses),
    },
  ].filter((component) => component.value > 0)

  // توزيع النسب المئوية (على إجمالي التكاليف قبل الربح ورسوم الدفع)
  const costPercentages = costComponents.map((component) => ({
    ...component,
    percentage: directCosts > 0 ? (component.value / directCosts) * 100 : 0,
  }))

  // اختيار الألوان للمكونات حسب الفئة
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "مواد":
        return { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-100" }
      case "عمالة":
        return { bg: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-100" }
      case "خدمات":
        return { bg: "bg-orange-500", text: "text-orange-600", light: "bg-orange-100" }
      case "تسويق":
        return { bg: "bg-purple-500", text: "text-purple-600", light: "bg-purple-100" }
      case "إدارية":
        return { bg: "bg-gray-500", text: "text-gray-600", light: "bg-gray-100" }
      default:
        return { bg: "bg-indigo-500", text: "text-indigo-600", light: "bg-indigo-100" }
    }
  }

  // تقريب السعر النهائي لأقرب رقم (للعرض)
  const roundedPrice = Math.ceil(totalPrice / 5) * 5

  // حساب حد السعر الأدنى والأقصى للمقارنة
  const minPrice = Math.round(totalPrice * 0.95)
  const maxPrice = Math.round(totalPrice * 1.1)

  return (
    <Card className="relative overflow-hidden shadow-lg">
      {hasMissingSettings && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 ml-2" />
            <div>
              <p className="text-yellow-800 text-sm">
                بعض البيانات غير مكتملة، النتائج تقريبية فقط. يُرجى تعبئة الإعدادات لضمان دقة التسعير.
              </p>
              <a
                href="/settings"
                className="mt-2 inline-flex items-center text-sm text-yellow-700 hover:text-yellow-900 underline"
              >
                اذهب للإعدادات
                <span className="ml-1">→</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* شريط التصنيف */}
      <div className="absolute top-0 left-10 w-36 h-8 transform -translate-y-4 -rotate-45 bg-indigo-600 text-white flex items-center justify-center shadow-md">
        <span className="text-xs font-bold">نتيجة التحليل</span>
      </div>

      {/* رأس البطاقة - السعر النهائي */}
      <div className="bg-gradient-to-l from-indigo-500/10 to-indigo-500/5 p-4 pt-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-base font-bold text-gray-800">{productName}</h3>
            <p className="text-xs text-gray-500">تم حساب السعر المثالي بناءً على التكاليف المدخلة</p>
          </div>
          <motion.div
            className="bg-white px-2 py-1 rounded-full border border-indigo-200 shadow-sm flex items-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <span className="text-xs font-medium text-indigo-500">ربح {safeFormat(profitMargin, 0)}%</span>
          </motion.div>
        </div>

        {/* السعر النهائي بتنسيق متوسط وواضح */}
        <div className="mt-4 mb-2 text-center">
          <div className="text-sm text-gray-600 mb-1">السعر النهائي المقترح</div>
          <motion.div
            className="text-3xl font-bold text-indigo-700 flex items-center justify-center"
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {safeFormat(roundedPrice, 0)}
            <span className="text-sm font-normal mr-1 mb-0.5">ريال</span>
          </motion.div>
          <div className="text-xs flex items-center justify-center gap-1 mt-1 text-gray-600">
            <span>مقترح:</span>
            <span className="text-emerald-600 font-medium">{safeFormat(minPrice, 0)}</span>
            <span>-</span>
            <span className="text-emerald-600 font-medium">{safeFormat(maxPrice, 0)}</span>
            <span>ريال</span>
          </div>
        </div>

        {/* معلومات إضافية للتكلفة والربح */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-white bg-opacity-80 p-2 rounded-lg backdrop-blur-sm border border-indigo-100 text-center">
            <div className="text-xs text-gray-500">التكلفة الإجمالية</div>
            <div className="text-lg font-bold text-gray-700">
              {safeFormat(directCosts, 0)} <span className="text-xs">ريال</span>
            </div>
          </div>
          <div className="bg-white bg-opacity-80 p-2 rounded-lg backdrop-blur-sm border border-indigo-100 text-center">
            <div className="text-xs text-gray-500">الربح</div>
            <div className="text-lg font-bold text-emerald-600">
              {safeFormat(profitAmount, 0)} <span className="text-xs">ريال</span>
            </div>
          </div>
        </div>
      </div>

      {/* محتوى البطاقة */}
      <div className="p-4 bg-white">
        {/* تفاصيل توزيع التكاليف في رسم بياني شريطي */}
        <div className="mb-4">
          <h4 className="text-xs font-medium text-gray-500 mb-1">توزيع التكاليف</h4>
          <div className="h-5 bg-gray-100 rounded-full overflow-hidden flex">
            {costComponents.map((component, index) => (
              <div
                key={index}
                style={{ width: `${(component.value / directCosts) * 100}%` }}
                className={getCategoryColor(component.category).bg}
              />
            ))}
          </div>

          {/* مفتاح الرسم البياني */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs justify-start">
            {costPercentages.map((component, index) => (
              <div key={index} className="flex items-center">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${getCategoryColor(component.category).bg} ml-1`}
                ></span>
                <span className="text-gray-600">{component.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ملخص التكاليف المحسن - بدون رموز تعبيرية */}
        <div className="space-y-1 text-sm mb-3">
          <div className="flex justify-between items-center py-1 border-b border-gray-100">
            <span className="font-medium text-gray-700">المواد (قماش وطرحة)</span>
            <span className="font-medium">
              {safeFormat(
                safeNumber(fabricMainCost) +
                  safeNumber(fabricSecondaryCost) +
                  safeNumber(turhaMainCost) +
                  safeNumber(turhaSecondaryCost),
                0,
              )}{" "}
              ريال
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-gray-100">
            <span className="font-medium text-gray-700">الخياطة والتطريز</span>
            <span className="font-medium">
              {safeFormat(safeNumber(tailoringCost) + safeNumber(embroideryCost), 0)} ريال
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-gray-100">
            <span className="font-medium text-gray-700">التغليف والتوصيل</span>
            <span className="font-medium">
              {safeFormat(safeNumber(packagingCost) + safeNumber(deliveryCost), 0)} ريال
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-gray-100">
            <span className="font-medium text-gray-700">التسويق</span>
            <span className="font-medium">{safeFormat(marketingCost, 0)} ريال</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-gray-100">
            <span className="font-medium text-gray-700">تكاليف ثابتة ومصاريف أخرى</span>
            <span className="font-medium">
              {safeFormat(safeNumber(fixedCosts) + safeNumber(extraExpenses), 0)} ريال
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-gray-100">
            <span className="font-medium">الربح ({safeFormat(profitMargin, 0)}%)</span>
            <span className="font-medium">{safeFormat(profitAmount, 0)} ريال</span>
          </div>

          {/* رسوم الدفع الإلكتروني من إعدادات المستخدم */}
          <div className="flex justify-between items-center py-1 text-amber-600">
            <span className="font-medium">
              {isLoadingPaymentMethods
                ? "جاري تحميل رسوم الدفع..."
                : highestFeeMethod
                  ? `رسوم دفع (${highestFeeMethod.name} - ${(highestFeeMethod.percentage_fee * 100).toFixed(1)}%)`
                  : enabledPaymentMethods.length === 0
                    ? "رسوم دفع (لم يتم تفعيل طرق دفع)"
                    : "رسوم دفع"}
            </span>
            <span className="font-medium">{safeFormat(paymentProcessingFee, 0)} ريال</span>
          </div>

          {/* تنبيه إذا لم يتم تفعيل طرق دفع */}
          {!isLoadingPaymentMethods && enabledPaymentMethods.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-2 mt-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-amber-700">
                  <p className="font-medium">لم يتم تفعيل طرق دفع</p>
                  <p>يرجى تفعيل طرق الدفع من الإعدادات لحساب الرسوم بدقة</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator className="my-3" />

        {/* السعر النهائي المقترح */}
        <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 flex justify-between items-center mb-2">
          <div className="flex items-center">
            <CheckCircle2 className="text-indigo-600 w-4 h-4 ml-2" />
            <div>
              <p className="text-sm font-medium text-gray-800">السعر النهائي المقترح</p>
              <p className="text-xs text-gray-500">شامل التكاليف والربح ورسوم الدفع</p>
            </div>
          </div>
          <div className="text-lg font-bold text-indigo-700">{safeFormat(roundedPrice, 0)} ريال</div>
        </div>

        {/* زر اقتراح سعر استراتيجي */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSuggestions((prev) => !prev)}
          className="w-full mb-2 text-emerald-600 border-emerald-200 hover:text-emerald-700 hover:bg-emerald-50"
        >
          {showSuggestions ? "إخفاء الاقتراحات" : "اقتراحات تسعير استراتيجية"}
        </Button>

        {/* اقتراحات التسعير الاستراتيجية */}
        {showSuggestions && (
          <motion.div
            className="text-xs space-y-2 mb-3 p-3 bg-emerald-50 rounded-md border border-emerald-100"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="font-medium text-emerald-800">اقتراحات تسعير استراتيجية:</h4>

            <div className="grid grid-cols-3 gap-2 my-2">
              <div className="bg-white p-2 rounded border border-emerald-100">
                <div className="text-center font-medium text-emerald-700">سعر تنافسي</div>
                <div className="text-center font-bold text-lg text-emerald-800 mt-1">
                  {safeFormat(minPrice, 0)} ريال
                </div>
              </div>
              <div className="bg-white p-2 rounded border-2 border-emerald-300 shadow-sm">
                <div className="text-center font-medium text-emerald-700">السعر المثالي</div>
                <div className="text-center font-bold text-lg text-emerald-800 mt-1">
                  {safeFormat(roundedPrice, 0)} ريال
                </div>
              </div>
              <div className="bg-white p-2 rounded border border-emerald-100">
                <div className="text-center font-medium text-emerald-700">سعر مميز</div>
                <div className="text-center font-bold text-lg text-emerald-800 mt-1">
                  {safeFormat(maxPrice, 0)} ريال
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-start gap-1">
                <span className="text-emerald-500 font-bold">•</span>
                <p className="text-emerald-700">قد يكون السعر التنافسي مناسبًا عند الدخول للسوق أو لتعزيز المبيعات.</p>
              </div>
              <div className="flex items-start gap-1">
                <span className="text-emerald-500 font-bold">•</span>
                <p className="text-emerald-700">السعر المثالي يوازن بين الربحية وجاذبية السعر للعملاء.</p>
              </div>
              <div className="flex items-start gap-1">
                <span className="text-emerald-500 font-bold">•</span>
                <p className="text-emerald-700">
                  السعر المميز مناسب للمنتجات ذات القيمة المضافة العالية والجودة المميزة.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* زر التفاصيل الكاملة */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFullBreakdown(!showFullBreakdown)}
          className="w-full text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
        >
          {showFullBreakdown ? "عرض ملخص" : "عرض التفاصيل الكاملة"}
        </Button>

        {/* التفاصيل الكاملة */}
        {showFullBreakdown && (
          <motion.div
            className="text-xs space-y-2 mt-3 p-3 bg-gray-50 rounded-md border"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="font-medium text-gray-700">التفاصيل الكاملة للتكاليف:</h4>
            <div className="space-y-1">
              {fabricMainCost > 0 && (
                <div className="flex justify-between">
                  <span>تكلفة القماش الرئيسي</span>
                  <span>{safeFormat(fabricMainCost, 2)} ريال</span>
                </div>
              )}
              {fabricSecondaryCost && fabricSecondaryCost > 0 && (
                <div className="flex justify-between">
                  <span>تكلفة القماش الثانوي</span>
                  <span>{safeFormat(fabricSecondaryCost, 2)} ريال</span>
                </div>
              )}
              {turhaMainCost && turhaMainCost > 0 && (
                <div className="flex justify-between">
                  <span>تكلفة الطرحة الرئيسية</span>
                  <span>{safeFormat(turhaMainCost, 2)} ريال</span>
                </div>
              )}
              {turhaSecondaryCost && turhaSecondaryCost > 0 && (
                <div className="flex justify-between">
                  <span>تكلفة الطرحة الثانوية</span>
                  <span>{safeFormat(turhaSecondaryCost, 2)} ريال</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>تكلفة الخياطة</span>
                <span>{safeFormat(tailoringCost, 2)} ريال</span>
              </div>
              {embroideryCost > 0 && (
                <div className="flex justify-between">
                  <span>تكلفة التطريز</span>
                  <span>{safeFormat(embroideryCost, 2)} ريال</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>تكلفة التغليف</span>
                <span>{safeFormat(packagingCost, 2)} ريال</span>
              </div>
              {deliveryCost && deliveryCost > 0 && (
                <div className="flex justify-between">
                  <span>تكلفة التوصيل</span>
                  <span>{safeFormat(deliveryCost, 2)} ريال</span>
                </div>
              )}
              {marketingCost > 0 && (
                <div className="flex justify-between">
                  <span>تكلفة التسويق</span>
                  <span>{safeFormat(marketingCost, 2)} ريال</span>
                </div>
              )}
              {extraExpenses && extraExpenses > 0 && (
                <div className="flex justify-between">
                  <span>مصاريف إضافية</span>
                  <span>{safeFormat(extraExpenses, 2)} ريال</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>تكاليف ثابتة</span>
                <span>{safeFormat(fixedCosts, 2)} ريال</span>
              </div>

              <div className="border-t border-dashed border-gray-200 pt-2 mt-2">
                <div className="flex justify-between font-medium">
                  <span>إجمالي التكاليف</span>
                  <span>{safeFormat(directCosts, 2)} ريال</span>
                </div>
                <div className="flex justify-between text-indigo-600 font-medium">
                  <span>هامش الربح ({safeFormat(profitMargin, 0)}%)</span>
                  <span>{safeFormat(profitAmount, 2)} ريال</span>
                </div>
                <div className="flex justify-between text-amber-600 font-medium">
                  <span>
                    رسوم الدفع {highestFeeMethod && `(${(highestFeeMethod.percentage_fee * 100).toFixed(1)}%)`}
                  </span>
                  <span>{safeFormat(paymentProcessingFee, 2)} ريال</span>
                </div>
                <div className="flex justify-between font-bold mt-1 pt-2 border-t border-gray-200">
                  <span>السعر النهائي</span>
                  <span>{safeFormat(totalPrice, 2)} ريال</span>
                </div>
                <div className="flex justify-between font-bold text-indigo-700 mt-1 pt-2 border-t border-gray-200">
                  <span>السعر المقترح (مقرب)</span>
                  <span>{safeFormat(roundedPrice, 0)} ريال</span>
                </div>
              </div>
            </div>

            {/* معلومات طرق الدفع المفعلة */}
            {!isLoadingPaymentMethods && enabledPaymentMethods.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <h5 className="font-medium text-gray-700 mb-2">طرق الدفع المفعلة:</h5>
                <div className="space-y-1">
                  {enabledPaymentMethods.map((method) => (
                    <div key={method.id} className="flex justify-between text-xs">
                      <span className={method.id === highestFeeMethod?.id ? "font-medium text-amber-700" : ""}>
                        {method.name}
                        {method.id === highestFeeMethod?.id && " (أعلى رسوم)"}
                      </span>
                      <span className={method.id === highestFeeMethod?.id ? "font-medium text-amber-700" : ""}>
                        {(method.percentage_fee * 100).toFixed(1)}% + {method.fixed_fee} ريال
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* نصائح التسعير */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                <span className="text-amber-700">
                  نصيحة: قم بمقارنة السعر المقترح مع أسعار السوق للمنتجات المشابهة.
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </Card>
  )
}
