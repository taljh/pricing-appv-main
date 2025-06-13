"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Package, Save, AlertCircle, Check, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import CustomerAcquisitionAnalysis from "./components/CustomerAcquisitionAnalysis"
import ProductSelectorStep from "@/components/products/ProductSelectorStep"
import ProductTypeSelector, { type ProductType } from "./ProductTypeSelector"
import AbayaProductForm from "./AbayaProductForm"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import CostSummaryCard from "./components/CostSummaryCard"

interface Costs {
  fabricMainCost: number
  fabricSecondaryCost: number
  turhaMainCost: number
  turhaSecondaryCost: number
  tailoringCost: number
  packagingCost: number
  deliveryCost: number
  extraExpenses: number
  fixedCosts: number
  directCosts: number
  marketingCost: number
  profitAmount: number
  paymentGatewayFees: number
  finalPrice: number
}

interface PricingFormData {
  name: string
  sku: string
  product_type: ProductType
  fabric_main_cost: number
  has_secondary_fabric: boolean
  fabric_secondary_cost: number
  has_turha: boolean
  turha_main_cost: number
  has_secondary_turha: boolean
  turha_secondary_cost: number
  tailoring_cost: number
  packaging_cost: number
  delivery_cost: number
  extra_expenses: number
  fixed_costs: number
  profit_margin: number
  marketing_costs: number
  marketing_type: "fixed" | "percentage"
  category: string
}

interface PricingCalculatorProps {
  onClose?: () => void
  initialProductId?: string | null
}

export default function PricingCalculator({ onClose, initialProductId }: PricingCalculatorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(false)
  const [isProductSelectorVisible, setIsProductSelectorVisible] = useState(false)
  const [isProductTypeVisible, setIsProductTypeVisible] = useState(!initialProductId)
  const [error, setError] = useState<string | null>(null)
  const [costs, setCosts] = useState<Costs>({
    fabricMainCost: 0,
    fabricSecondaryCost: 0,
    turhaMainCost: 0,
    turhaSecondaryCost: 0,
    tailoringCost: 0,
    packagingCost: 0,
    deliveryCost: 0,
    extraExpenses: 0,
    fixedCosts: 0,
    directCosts: 0,
    marketingCost: 0,
    profitAmount: 0,
    paymentGatewayFees: 0,
    finalPrice: 0,
  })

  // حالة اختيار المنتج
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [productType, setProductType] = useState<ProductType>("abaya")

  // حالة عرض كرتات التحليل
  const [hasEnoughDataForAnalysis, setHasEnoughDataForAnalysis] = useState(false)

  // حالة التغييرات غير المحفوظة
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showExitPrompt, setShowExitPrompt] = useState(false)
  const [exitAction, setExitAction] = useState<() => void>(() => {})

  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const supabase = useMemo(() => createClientComponentClient(), [])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isDirty },
    reset,
  } = useForm<PricingFormData>({
    defaultValues: {
      name: "",
      sku: "",
      product_type: "abaya",
      fabric_main_cost: 0,
      has_secondary_fabric: false,
      fabric_secondary_cost: 0,
      has_turha: false,
      turha_main_cost: 0,
      has_secondary_turha: false,
      turha_secondary_cost: 0,
      tailoring_cost: 0,
      packaging_cost: 0,
      delivery_cost: 0,
      extra_expenses: 0,
      fixed_costs: 0,
      profit_margin: 30,
      category: "",
      marketing_type: "fixed",
      marketing_costs: 0,
    },
  })

  const watchedValues = watch()

  // دالة حساب التكاليف محسنة ودقيقة
  const calculateCosts = useCallback((formData: PricingFormData): Costs => {
    try {
      setIsCalculating(true)

      // دالة آمنة محسنة لتحويل الأرقام
      const safeNumber = (value: any): number => {
        if (value === null || value === undefined || value === "") return 0
        const num = Number(value)
        if (isNaN(num) || !isFinite(num)) return 0
        return Math.max(0, num)
      }

      // حساب التكاليف المباشرة بدقة وأمان
      const fabricMainCost = safeNumber(formData.fabric_main_cost)
      const fabricSecondaryCost = formData.has_secondary_fabric ? safeNumber(formData.fabric_secondary_cost) : 0
      const turhaMainCost = formData.has_turha ? safeNumber(formData.turha_main_cost) : 0
      const turhaSecondaryCost =
        formData.has_turha && formData.has_secondary_turha ? safeNumber(formData.turha_secondary_cost) : 0
      const tailoringCost = safeNumber(formData.tailoring_cost)
      const packagingCost = safeNumber(formData.packaging_cost)
      const deliveryCost = safeNumber(formData.delivery_cost)
      const extraExpenses = safeNumber(formData.extra_expenses)
      const fixedCosts = safeNumber(formData.fixed_costs)

      // إجمالي التكاليف المباشرة
      const directCosts =
        fabricMainCost +
        fabricSecondaryCost +
        turhaMainCost +
        turhaSecondaryCost +
        tailoringCost +
        packagingCost +
        deliveryCost +
        extraExpenses

      // حساب تكلفة التسويق
      const marketingCosts = safeNumber(formData.marketing_costs)
      const marketingCost =
        formData.marketing_type === "percentage" && directCosts > 0
          ? (directCosts * marketingCosts) / 100
          : marketingCosts

      // حساب الربح
      const profitMargin = safeNumber(formData.profit_margin)
      const totalCostsForProfit = directCosts + fixedCosts + marketingCost
      const profitAmount = totalCostsForProfit > 0 ? (totalCostsForProfit * profitMargin) / 100 : 0

      // السعر قبل رسوم الدفع
      const priceBeforeFees = totalCostsForProfit + profitAmount

      // حساب رسوم بوابة الدفع (تقديري دقيق)
      const baseFee = 1.5
      const percentageFee = priceBeforeFees * 0.0699
      const totalFee = baseFee + percentageFee
      const paymentGatewayFees = totalFee + totalFee * 0.15 // إضافة ضريبة القيمة المضافة

      // السعر النهائي
      const finalPrice = priceBeforeFees + paymentGatewayFees

      // إرجاع النتائج مع ضمان الأرقام الآمنة
      const result: Costs = {
        fabricMainCost: safeNumber(fabricMainCost),
        fabricSecondaryCost: safeNumber(fabricSecondaryCost),
        turhaMainCost: safeNumber(turhaMainCost),
        turhaSecondaryCost: safeNumber(turhaSecondaryCost),
        tailoringCost: safeNumber(tailoringCost),
        packagingCost: safeNumber(packagingCost),
        deliveryCost: safeNumber(deliveryCost),
        extraExpenses: safeNumber(extraExpenses),
        fixedCosts: safeNumber(fixedCosts),
        directCosts: safeNumber(directCosts),
        marketingCost: safeNumber(marketingCost),
        profitAmount: safeNumber(profitAmount),
        paymentGatewayFees: safeNumber(paymentGatewayFees),
        finalPrice: safeNumber(finalPrice),
      }

      return result
    } catch (error) {
      console.error("Error in calculateCosts:", error)
      // إرجاع قيم آمنة في حالة الخطأ
      return {
        fabricMainCost: 0,
        fabricSecondaryCost: 0,
        turhaMainCost: 0,
        turhaSecondaryCost: 0,
        tailoringCost: 0,
        packagingCost: 0,
        deliveryCost: 0,
        extraExpenses: 0,
        fixedCosts: 0,
        directCosts: 0,
        marketingCost: 0,
        profitAmount: 0,
        paymentGatewayFees: 0,
        finalPrice: 0,
      }
    } finally {
      setIsCalculating(false)
    }
  }, [])

  // تحديث التكاليف عند تغيير القيم
  useEffect(() => {
    if (selectedProduct) {
      const newCosts = calculateCosts(watchedValues)
      setCosts(newCosts)

      // تحديد ما إذا كانت هناك بيانات كافية لعرض كرتات التحليل
      const hasRequiredData =
        watchedValues.fabric_main_cost > 0 &&
        watchedValues.tailoring_cost > 0 &&
        watchedValues.profit_margin > 0 &&
        newCosts.finalPrice > 0
      setHasEnoughDataForAnalysis(hasRequiredData)
    }
  }, [
    selectedProduct,
    watchedValues.fabric_main_cost,
    watchedValues.has_secondary_fabric,
    watchedValues.fabric_secondary_cost,
    watchedValues.has_turha,
    watchedValues.turha_main_cost,
    watchedValues.has_secondary_turha,
    watchedValues.turha_secondary_cost,
    watchedValues.tailoring_cost,
    watchedValues.packaging_cost,
    watchedValues.delivery_cost,
    watchedValues.extra_expenses,
    watchedValues.fixed_costs,
    costs.finalPrice,
    watchedValues.profit_margin,
    calculateCosts,
  ])

  // تتبع التغييرات غير المحفوظة
  useEffect(() => {
    if (selectedProduct && isDirty) {
      setHasUnsavedChanges(true)
    }
  }, [selectedProduct, isDirty])

  // تحميل التكاليف الثابتة من قاعدة البيانات
  const loadFixedCosts = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: fixedCostPerProduct, error } = await supabase.rpc("calculate_fixed_costs_per_product", {
          user_uuid: user.id,
        })

        if (!error && fixedCostPerProduct !== null && isFinite(fixedCostPerProduct)) {
          setValue("fixed_costs", Math.max(0, fixedCostPerProduct), { shouldDirty: false })
        }
      }
    } catch (error) {
      console.error("Error loading fixed costs:", error)
    }
  }, [supabase, setValue])

  // تحميل التكاليف الثابتة عند تحميل المكون
  useEffect(() => {
    loadFixedCosts()
  }, [loadFixedCosts])

  // دالة حفظ محسنة مع ضمان الدقة والترابط مع قاعدة البيانات
  const onSubmit = async (data: PricingFormData) => {
    if (!selectedProduct?.id) {
      toast.error("يجب اختيار منتج أولاً")
      return
    }

    // حماية قوية ضد تكرار الحفظ
    if (isSubmitting) {
      console.log("Save already in progress, ignoring duplicate request")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error("يجب تسجيل الدخول لحفظ التسعير")
      }

      // حساب التكاليف النهائية من البيانات المدخلة حالياً
      const calculatedCosts = calculateCosts(data)

      // التحقق من صحة البيانات
      if (!isFinite(calculatedCosts.finalPrice) || calculatedCosts.finalPrice <= 0) {
        throw new Error("قيمة السعر النهائي غير صالحة")
      }

      if (calculatedCosts.directCosts <= 0) {
        throw new Error("التكاليف المباشرة يجب أن تكون أكبر من صفر")
      }

      // إعداد بيانات التسعير مع ضمان الدقة الكاملة
      const pricingData: any = {
        user_id: user.id,
        product_id: selectedProduct.id,
        fabric_main_cost: calculatedCosts.fabricMainCost,
        has_secondary_fabric: data.has_secondary_fabric || false,
        fabric_secondary_cost: calculatedCosts.fabricSecondaryCost,
        has_turha: data.has_turha || false,
        turha_main_cost: calculatedCosts.turhaMainCost,
        has_secondary_turha: data.has_secondary_turha || false,
        turha_secondary_cost: calculatedCosts.turhaSecondaryCost,
        tailoring_cost: calculatedCosts.tailoringCost,
        packaging_cost: calculatedCosts.packagingCost,
        delivery_cost: calculatedCosts.deliveryCost,
        extra_expenses: calculatedCosts.extraExpenses,
        fixed_costs: calculatedCosts.fixedCosts,
        profit_margin: data.profit_margin || 30,
        marketing_costs: data.marketing_costs || 0,
        marketing_type: data.marketing_type || "fixed",
        final_price: calculatedCosts.finalPrice,
        product_type: "abaya", // تثبيت نوع المنتج على العبايات
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // حفظ التسعير في قاعدة البيانات
      const { error: upsertError } = await supabase.from("pricings").upsert(pricingData, { onConflict: "product_id" })

      if (upsertError) {
        throw new Error(`خطأ في حفظ التسعير: ${upsertError.message}`)
      }

      // تحديث المنتج مع ضمان الترابط الكامل
      const productUpdateData: any = {
        has_pricing: true,
        product_type: "abaya",
        selling_price: calculatedCosts.finalPrice,
        cost_price: calculatedCosts.directCosts,
        fabric_main_cost: calculatedCosts.fabricMainCost,
        fabric_secondary_cost: calculatedCosts.fabricSecondaryCost,
        turha_main_cost: calculatedCosts.turhaMainCost,
        turha_secondary_cost: calculatedCosts.turhaSecondaryCost,
        tailoring_cost: calculatedCosts.tailoringCost,
        packaging_cost: calculatedCosts.packagingCost,
        delivery_cost: calculatedCosts.deliveryCost,
        extra_expenses: calculatedCosts.extraExpenses,
        marketing_cost: data.marketing_costs || 0,
        profit_margin: data.profit_margin || 30,
        updated_at: new Date().toISOString(),
      }

      const { error: updateError } = await supabase
        .from("products")
        .update(productUpdateData)
        .eq("id", selectedProduct.id)

      if (updateError) {
        console.warn("تم حفظ التسعير لكن فشل تحديث حالة المنتج:", updateError)
      }

      // حفظ بيانات التسعير الحالية في localStorage للكرتات الذكية
      try {
        const pricingData = {
          product_type: "abaya",
          profit_margin: data.profit_margin,
          marketing_type: data.marketing_type,
          marketing_costs: data.marketing_costs,
          timestamp: new Date().toISOString(),
        }
        localStorage.setItem("current_pricing_data", JSON.stringify(pricingData))
      } catch (error) {
        console.error("Error saving pricing data:", error)
      }

      setHasUnsavedChanges(false)
      setHasEnoughDataForAnalysis(true)
      toast.success("تم حفظ التسعير بنجاح")
      if (onClose) onClose()
    } catch (err) {
      console.error("Error saving pricing:", err)
      const errorMessage = err instanceof Error ? err.message : "حدث خطأ غير معروف"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // فحص اكتمال البيانات المطلوبة
  const isPricingComplete = useMemo(() => {
    const requiredFields = [watchedValues.fabric_main_cost, watchedValues.tailoring_cost, watchedValues.profit_margin]
    return requiredFields.every((field) => field && field > 0)
  }, [watchedValues.fabric_main_cost, watchedValues.tailoring_cost, watchedValues.profit_margin])

  // معالجة اختيار نوع المنتج - مثبت على العبايات فقط
  const handleProductTypeSelected = useCallback(
    (type: ProductType) => {
      setProductType("abaya") // تثبيت على العبايات
      setValue("product_type", "abaya", { shouldDirty: false })
      setIsProductTypeVisible(false)
      setIsProductSelectorVisible(true)
    },
    [setValue],
  )

  // وظيفة معالجة اختيار منتج محسنة
  const handleProductSelected = useCallback(
    async (productId: string): Promise<void> => {
      try {
        setIsInitialLoading(true)
        setError(null)

        if (isProductSelectorVisible) {
          setIsProductSelectorVisible(false)
          const newUrl = new URL(window.location.href)
          newUrl.searchParams.set("product_id", productId)
          window.history.pushState({}, "", newUrl)
        }

        const { data: product, error } = await supabase.from("products").select("*").eq("id", productId).single()

        if (error) {
          throw new Error(`خطأ في تحميل المنتج: ${error.message}`)
        }

        if (!product) {
          throw new Error("لم يتم العثور على المنتج")
        }

        setSelectedProduct(product)

        // تحديث النموذج ببيانات المنتج
        setValue("name", product.name || "", { shouldDirty: false })
        setValue("sku", product.sku || "", { shouldDirty: false })
        setValue("category", product.category || "", { shouldDirty: false })
        setValue("product_type", "abaya", { shouldDirty: false }) // تثبيت على العبايات

        // تحميل بيانات التسعير السابقة
        const { data: existingPricing, error: pricingError } = await supabase
          .from("pricings")
          .select("*")
          .eq("product_id", productId)
          .maybeSingle()

        if (!pricingError && existingPricing) {
          // تحديث النموذج ببيانات التسعير السابقة مع ضمان القيم الصحيحة
          const updates = {
            fabric_main_cost: existingPricing.fabric_main_cost || 0,
            has_secondary_fabric: existingPricing.has_secondary_fabric || false,
            fabric_secondary_cost: existingPricing.fabric_secondary_cost || 0,
            has_turha: existingPricing.has_turha || false,
            turha_main_cost: existingPricing.turha_main_cost || 0,
            has_secondary_turha: existingPricing.has_secondary_turha || false,
            turha_secondary_cost: existingPricing.turha_secondary_cost || 0,
            tailoring_cost: existingPricing.tailoring_cost || 0,
            packaging_cost: existingPricing.packaging_cost || 0,
            delivery_cost: existingPricing.delivery_cost || 0,
            extra_expenses: existingPricing.extra_expenses || 0,
            fixed_costs: existingPricing.fixed_costs || 0,
            profit_margin: existingPricing.profit_margin || 30,
            marketing_costs: existingPricing.marketing_costs || 0,
            marketing_type: existingPricing.marketing_type || "fixed",
          }

          Object.entries(updates).forEach(([key, value]) => {
            setValue(key as keyof PricingFormData, value, { shouldDirty: false })
          })

          // تحديد ما إذا كانت هناك بيانات كافية للتحليل
          setHasEnoughDataForAnalysis(
            existingPricing.fabric_main_cost > 0 &&
              existingPricing.tailoring_cost > 0 &&
              existingPricing.profit_margin > 0,
          )
        } else {
          // تحميل التكاليف الثابتة للمنتج الجديد
          await loadFixedCosts()
          setHasEnoughDataForAnalysis(false)
        }

        // إعادة تعيين حالة التغييرات غير المحفوظة
        setHasUnsavedChanges(false)
        toast.success("تم تحميل بيانات المنتج بنجاح")
      } catch (err) {
        console.error("Error loading product:", err)
        const errorMessage = err instanceof Error ? err.message : "حدث خطأ أثناء تحميل المنتج"
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setIsInitialLoading(false)
      }
    },
    [isProductSelectorVisible, supabase, setValue, loadFixedCosts],
  )

  // التعامل مع العودة لاختيار منتج آخر
  const handleChangeProduct = useCallback(() => {
    if (hasUnsavedChanges) {
      setExitAction(() => () => {
        setSelectedProduct(null)
        setError(null)
        reset()
        setIsProductSelectorVisible(true)
        setHasUnsavedChanges(false)
        setHasEnoughDataForAnalysis(false)

        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete("product_id")
        window.history.pushState({}, "", newUrl)
      })
      setShowExitPrompt(true)
    } else {
      setSelectedProduct(null)
      setError(null)
      reset()
      setIsProductSelectorVisible(true)
      setHasEnoughDataForAnalysis(false)

      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete("product_id")
      window.history.pushState({}, "", newUrl)
    }
  }, [reset, hasUnsavedChanges])

  // التعامل مع العودة لاختيار نوع منتج آخر
  const handleChangeProductType = useCallback(() => {
    if (hasUnsavedChanges) {
      setExitAction(() => () => {
        setSelectedProduct(null)
        setError(null)
        reset()
        setIsProductSelectorVisible(false)
        setIsProductTypeVisible(true)
        setHasUnsavedChanges(false)
        setHasEnoughDataForAnalysis(false)

        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete("product_id")
        window.history.pushState({}, "", newUrl)
      })
      setShowExitPrompt(true)
    } else {
      setSelectedProduct(null)
      setError(null)
      reset()
      setIsProductSelectorVisible(false)
      setIsProductTypeVisible(true)
      setHasEnoughDataForAnalysis(false)

      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete("product_id")
      window.history.pushState({}, "", newUrl)
    }
  }, [reset, hasUnsavedChanges])

  // تحميل المنتج الأولي
  useEffect(() => {
    if (initialProductId && !selectedProduct) {
      handleProductSelected(initialProductId).catch((err) => {
        console.error("Error loading initial product:", err)
        setError("حدث خطأ أثناء تحميل المنتج")
        setIsProductSelectorVisible(true)
      })
    }
  }, [initialProductId, selectedProduct, handleProductSelected])

  // تنبيه عند محاولة الخروج من الصفحة مع وجود تغييرات غير محفوظة
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = "لديك تغييرات غير محفوظة. هل أنت متأكد من أنك تريد المغادرة؟"
        return e.returnValue
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [hasUnsavedChanges])

  // معالجة الإغلاق
  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      setExitAction(() => () => {
        if (onClose) onClose()
      })
      setShowExitPrompt(true)
    } else {
      if (onClose) onClose()
    }
  }, [onClose, hasUnsavedChanges])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => setError(null)}>حاول مرة أخرى</Button>
      </div>
    )
  }

  if (isProductTypeVisible) {
    return <ProductTypeSelector onSelect={handleProductTypeSelected} defaultType={productType} />
  }

  if (isProductSelectorVisible) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">اختر عباية للتسعير</h2>
          <Button variant="outline" size="sm" onClick={handleChangeProductType}>
            العودة لاختيار النوع
          </Button>
        </div>
        <ProductSelectorStep onProductSelected={handleProductSelected} onClose={handleClose} />
      </div>
    )
  }

  if (isInitialLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-indigo-600 border-indigo-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل بيانات المنتج...</p>
        </div>
      </div>
    )
  }

  // حساب البيانات للكرتات الذكية من البيانات المدخلة حالياً
  const totalCosts = costs.directCosts + costs.fixedCosts + costs.marketingCost

  return (
    <>
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
        {/* النموذج الرئيسي - يظهر أولاً في الجوال */}
        <div className="order-1 lg:col-span-2 space-y-6">
          <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* معلومات المنتج */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-l from-indigo-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">معلومات العباية</h2>
                    <p className="text-sm text-gray-500 mt-1">معلومات العباية التي تقوم بتسعيرها</p>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-2">
                    <Package className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                {selectedProduct && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center">
                          <Package className="h-5 w-5 text-slate-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 flex flex-wrap items-center gap-2">
                            {selectedProduct.name}
                            {selectedProduct.category && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                {selectedProduct.category}
                              </Badge>
                            )}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>SKU: {selectedProduct.sku || "غير محدد"}</span>
                            <Badge variant="outline" className="text-xs">
                              عباية
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleChangeProductType}>
                          تغيير النوع
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleChangeProduct}>
                          تغيير المنتج
                        </Button>
                      </div>
                    </div>
                    {selectedProduct.has_pricing && (
                      <Alert className="bg-green-50 text-green-800 border-green-200">
                        <Check className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          هذه العباية تم تسعيرها مسبقاً وأنت تقوم بتعديل التسعير الحالي.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* حقول الإدخال - نموذج العبايات فقط */}
            {selectedProduct && (
              <AbayaProductForm watchedValues={watchedValues} setValue={setValue} errors={errors} register={register} />
            )}

            {/* زر حساب وحفظ السعر */}
            {selectedProduct && (
              <div className="flex items-center justify-center gap-4 sticky bottom-0 py-4 bg-white/95 backdrop-blur-sm border-t lg:static lg:bg-transparent lg:border-0 lg:backdrop-blur-none">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full max-w-md bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  disabled={isSubmitting || !isPricingComplete || isCalculating}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 me-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      جاري الحفظ...
                    </>
                  ) : isCalculating ? (
                    <>
                      <div className="w-4 h-4 me-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      جاري الحساب...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 ml-2" />
                      حساب وحفظ السعر
                    </>
                  )}
                </Button>
              </div>
            )}
          </form>
        </div>

        {/* كروت التحليل والنتائج - تظهر أخيراً في الجوال */}
        {selectedProduct && (
          <div className="order-2 lg:order-2 lg:col-span-1 space-y-6">
            {/* كرت ملخص التسعير المحسن */}
            <CostSummaryCard
              productName={selectedProduct?.name || "منتج غير محدد"}
              fabricMainCost={watchedValues.fabric_main_cost || 0}
              fabricSecondaryCost={watchedValues.has_secondary_fabric ? watchedValues.fabric_secondary_cost : 0}
              turhaMainCost={watchedValues.has_turha ? watchedValues.turha_main_cost : 0}
              turhaSecondaryCost={
                watchedValues.has_turha && watchedValues.has_secondary_turha ? watchedValues.turha_secondary_cost : 0
              }
              tailoringCost={watchedValues.tailoring_cost || 0}
              embroideryDetails={{
                hasEmbroidery: false,
                embroideryCost: 0,
              }}
              packagingCost={watchedValues.packaging_cost || 0}
              deliveryCost={watchedValues.delivery_cost || 0}
              extraExpenses={watchedValues.extra_expenses || 0}
              fixedCosts={watchedValues.fixed_costs || 0}
              marketingCost={costs.marketingCost || 0}
              profitMargin={watchedValues.profit_margin || 30}
            />

            {/* كرت تحليل تكلفة الاستحواذ - يظهر فقط عند وجود بيانات كافية */}
            {hasEnoughDataForAnalysis ? (
              <CustomerAcquisitionAnalysis
                profitAmount={costs.profitAmount}
                finalPrice={costs.finalPrice}
                totalCosts={totalCosts}
                marketingCost={costs.marketingCost}
              />
            ) : (
              <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <div className="p-6 text-center">
                  <div className="bg-blue-50 rounded-full p-3 w-12 h-12 mx-auto mb-3">
                    <Loader2 className="h-6 w-6 text-blue-600 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">تحليل تكلفة الاستحواذ</h3>
                  <p className="text-gray-600 mb-4">
                    أدخل بيانات التسعير واحفظها لعرض تحليل تكلفة الاستحواذ على العملاء
                  </p>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* مربع حوار تأكيد الخروج مع وجود تغييرات غير محفوظة */}
      <AlertDialog open={showExitPrompt} onOpenChange={setShowExitPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تغييرات غير محفوظة</AlertDialogTitle>
            <AlertDialogDescription>
              لديك تغييرات غير محفوظة. هل أنت متأكد من أنك تريد المغادرة دون حفظ التغييرات؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                exitAction()
                setShowExitPrompt(false)
              }}
            >
              نعم، المغادرة دون حفظ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
