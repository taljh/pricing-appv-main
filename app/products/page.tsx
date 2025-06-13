import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"
import type { Database } from "@/types/supabase"
import { AppShell } from "@/components/ui/app-shell"
import ProductsList from "@/components/products/ProductsList"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, Package, BarChart3, ChevronsUp, Calculator } from "lucide-react"
import Link from "next/link"

export default async function ProductsPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

  try {
    // التحقق من المستخدم الحالي
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Authentication error:", userError)
      redirect("/auth/login")
    }

    // جلب المنتجات من قاعدة البيانات الجديدة
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (productsError) {
      console.error("Error fetching products:", productsError)
      throw new Error("Failed to fetch products")
    }

    // استعلام للحصول على بيانات المستخدم من جدول profiles
    const { data: profileData } = await supabase
      .from("profiles")
      .select("username, full_name")
      .eq("id", user.id)
      .single()

    const username = profileData?.username || profileData?.full_name || user.email?.split("@")[0] || "المستخدم"

    // حساب إحصائيات المنتجات
    const productStats = {
      total: products?.length || 0,
      priced: products?.filter((p) => p.has_pricing).length || 0,
      notPriced: products?.filter((p) => !p.has_pricing).length || 0,
      avgProfit: calculateAverageProfit(products || []),
    }

    // حساب المنتجات الأكثر ربحية
    const mostProfitableProducts = [...(products || [])]
      .filter((p) => p.has_pricing && p.price && p.cost)
      .sort((a, b) => {
        const marginA = calculateProductProfitMargin(a)
        const marginB = calculateProductProfitMargin(b)
        return marginB - marginA
      })
      .slice(0, 3)

    // حساب عدد المنتجات المضافة حديثًا (خلال آخر 30 يوم)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentProducts = products?.filter((p) => new Date(p.created_at) > thirtyDaysAgo).length || 0

    return (
      <AppShell>
        <div className="space-y-6">
          {/* بطاقة الملخص الرئيسية */}
          <section className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50/70 to-blue-50 z-0"></div>
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5 z-0"></div>

            <div className="absolute top-10 left-10 w-48 h-48 bg-indigo-300/20 rounded-full blur-3xl z-0"></div>
            <div className="absolute bottom-5 right-10 w-32 h-32 bg-blue-300/20 rounded-full blur-2xl z-0"></div>

            <div className="relative z-10 p-6">
              <div className="flex flex-col items-center text-center gap-4">
                <Badge className="px-3 py-1 mb-2 bg-indigo-100 text-indigo-700 border-indigo-200">
                  <Package className="h-3.5 w-3.5 mr-1 text-indigo-500" />
                  <span>إدارة المنتجات</span>
                </Badge>

                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-700 to-indigo-900 bg-clip-text text-transparent">
                  منتجاتك ({productStats.total})
                </h1>

                <p className="text-lg text-gray-600 max-w-2xl">
                  يمكنك إدارة منتجاتك وتحليل تكاليفها وتحسين تسعيرها للحصول على أفضل هوامش ربح
                </p>

                <div className="mt-4">
                  <Link href="/pricing/calculator">
                    <Button className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 border-none shadow-md hover:shadow-lg transition-all duration-300 gap-2">
                      <Calculator className="h-5 w-5" />
                      <span>حاسبة التسعير الذكي</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* بطاقة المنتجات الأكثر ربحية */}
          {mostProfitableProducts.length > 0 && (
            <Card className="border-gray-100 shadow-sm overflow-hidden bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 text-green-600">
                      <ChevronsUp className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold">المنتجات الأكثر ربحية</h3>
                      <p className="text-sm text-gray-500">أعلى هوامش ربح في متجرك</p>
                    </div>
                  </div>
                  <Link href="/pricing/calculator">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200"
                    >
                      <span>تحليل المنتجات</span>
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {mostProfitableProducts.map((product, index) => {
                    const profitMargin = calculateProductProfitMargin(product)
                    return (
                      <div
                        key={product.id}
                        className="border border-gray-100 rounded-lg p-4 bg-white/80 hover:border-indigo-100 hover:shadow-sm transition-all duration-200"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-medium text-gray-800 truncate flex-1" title={product.name}>
                            {product.name}
                          </h3>
                          <Badge className="bg-green-50 text-green-700 border-green-100">{profitMargin}%</Badge>
                        </div>

                        <div className="mt-3 space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">السعر:</span>
                            <span className="font-medium text-indigo-700">{formatPrice(product.price)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">التكلفة:</span>
                            <span className="font-medium text-gray-700">{formatPrice(product.cost)}</span>
                          </div>
                          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-2">
                            <div
                              className="bg-green-500 h-full rounded-full"
                              style={{ width: `${Math.min(profitMargin, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <Link href={`/pricing/calculator?product_id=${product.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full border-green-200 hover:bg-green-50 text-green-700 text-xs h-8"
                            >
                              <BarChart3 className="h-3.5 w-3.5 mr-1" />
                              تحسين التسعير
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* قائمة المنتجات */}
          <div id="products-list">
            <ProductsList initialProducts={products || []} />
          </div>
        </div>
      </AppShell>
    )
  } catch (error) {
    console.error("Products page error:", error)
    redirect("/auth/login")
  }
}

// تنسيق السعر والأرقام بالريال السعودي
function formatPrice(price: number): string {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
    currencyDisplay: "narrowSymbol",
  }).format(price)
}

// حساب هامش الربح لمنتج
interface Product {
  id: string
  name: string
  price: number
  cost: number
  created_at: string
  has_pricing: boolean
}

function calculateProductProfitMargin(product: Product): number {
  if (product.price && product.cost && product.cost > 0) {
    const profitMargin = ((product.price - product.cost) / product.price) * 100
    return Math.round(profitMargin)
  }
  return 0
}

// حساب متوسط هامش الربح لجميع المنتجات المسعرة
function calculateAverageProfit(products: Product[]): number {
  const pricedProducts = products.filter((p) => p.has_pricing && p.price && p.cost && p.cost > 0)

  if (pricedProducts.length === 0) return 0

  const totalMargin = pricedProducts.reduce((sum, product) => {
    const margin = ((product.price - product.cost) / product.price) * 100
    return sum + margin
  }, 0)

  return Math.round(totalMargin / pricedProducts.length)
}
