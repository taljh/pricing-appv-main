"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAuth } from "@/lib/auth-context"

interface Product {
  id: string
  name: string
  cost_price: number | null
  selling_price: number | null
  has_pricing: boolean
}

interface LowProfitProduct {
  name: string
  profitMargin: number
}

interface SeasonalRecommendation {
  season: string
  seasonColor: string
  recommendedDiscount: {
    min: number
    max: number
  }
  minProfitMargin: number
}

interface ProductsAnalytics {
  totalProducts: number
  maxCAC: number
  safeCAC: number
  maxSafeDiscount: number
  averageProfitMargin: number
  lowProfitProducts: LowProfitProduct[]
  seasonalRecommendation: SeasonalRecommendation
}

export function useProductsAnalytics() {
  const [analytics, setAnalytics] = useState<ProductsAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClientComponentClient()

  const getCurrentSeason = (): SeasonalRecommendation => {
    const month = new Date().getMonth() + 1 // 1-12

    if (month >= 3 && month <= 5) {
      return {
        season: "الربيع",
        seasonColor: "emerald",
        recommendedDiscount: { min: 10, max: 20 },
        minProfitMargin: 10,
      }
    } else if (month >= 6 && month <= 8) {
      return {
        season: "الصيف",
        seasonColor: "amber",
        recommendedDiscount: { min: 15, max: 25 },
        minProfitMargin: 10,
      }
    } else if (month >= 9 && month <= 11) {
      return {
        season: "الخريف",
        seasonColor: "orange",
        recommendedDiscount: { min: 5, max: 15 },
        minProfitMargin: 12,
      }
    } else {
      return {
        season: "الشتاء",
        seasonColor: "blue",
        recommendedDiscount: { min: 8, max: 18 },
        minProfitMargin: 10,
      }
    }
  }

  const calculateAnalytics = (products: Product[]): ProductsAnalytics => {
    // فلترة المنتجات التي لها أسعار صحيحة
    const validProducts = products.filter(
      (p) => p.cost_price && p.selling_price && p.cost_price > 0 && p.selling_price > 0,
    )

    if (validProducts.length === 0) {
      return {
        totalProducts: products.length,
        maxCAC: 0,
        safeCAC: 0,
        maxSafeDiscount: 0,
        averageProfitMargin: 0,
        lowProfitProducts: [],
        seasonalRecommendation: getCurrentSeason(),
      }
    }

    // حساب هوامش الربح لكل منتج
    const profitMargins = validProducts.map((p) => {
      const profit = p.selling_price! - p.cost_price!
      const margin = (profit / p.selling_price!) * 100
      return {
        product: p,
        profit,
        margin,
      }
    })

    // حساب أقصى تكلفة استحواذ (أقل ربح)
    const minProfit = Math.min(...profitMargins.map((p) => p.profit))
    const maxCAC = Math.max(0, minProfit)
    const safeCAC = Math.max(0, maxCAC - 15) // هامش أمان 15 ريال

    // حساب أقصى خصم آمن (أقل هامش ربح)
    const minMargin = Math.min(...profitMargins.map((p) => p.margin))
    const maxSafeDiscount = Math.max(0, minMargin - 5) // هامش أمان 5%

    // حساب متوسط هامش الربح
    const averageProfitMargin = profitMargins.reduce((sum, p) => sum + p.margin, 0) / profitMargins.length

    // العثور على المنتجات ذات هامش ربح ضعيف (أقل من 10%)
    const lowProfitProducts: LowProfitProduct[] = profitMargins
      .filter((p) => p.margin < 10)
      .map((p) => ({
        name: p.product.name,
        profitMargin: Math.round(p.margin * 10) / 10,
      }))
      .slice(0, 5) // أول 5 منتجات فقط

    return {
      totalProducts: products.length,
      maxCAC: Math.round(maxCAC),
      safeCAC: Math.round(safeCAC),
      maxSafeDiscount: Math.round(maxSafeDiscount * 10) / 10,
      averageProfitMargin: Math.round(averageProfitMargin * 10) / 10,
      lowProfitProducts,
      seasonalRecommendation: getCurrentSeason(),
    }
  }

  const fetchAnalytics = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data: products, error: fetchError } = await supabase
        .from("products")
        .select("id, name, cost_price, selling_price, has_pricing")
        .eq("user_id", user.id)

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      if (!products || products.length === 0) {
        setAnalytics(null)
        return
      }

      const analyticsData = calculateAnalytics(products)
      setAnalytics(analyticsData)
    } catch (err) {
      console.error("Error fetching analytics:", err)
      setError(err instanceof Error ? err.message : "حدث خطأ في تحليل البيانات")
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    fetchAnalytics()
  }

  useEffect(() => {
    fetchAnalytics()
  }, [user])

  return {
    analytics,
    loading,
    error,
    refetch,
  }
}
