"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  AlertCircle,
  Package,
  PlusCircle,
  Search,
  Check,
  Clock,
  Edit,
  ExternalLink,
  Filter,
  TrendingUp,
  RotateCcw,
  BadgeDollarSign,
  SlidersHorizontal,
  Table2,
  Grid3X3,
  Trash2,
  ChevronDown,
} from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"
import AddProductModal from "./AddProductModal"
import { Skeleton } from "@/components/ui/skeleton"
import { useScreenInfo } from "@/hooks/use-mobile"
import { useRTL } from "@/lib/rtl-context"
import { toast } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type Product = {
  id: string
  created_at: string
  updated_at: string
  name: string
  description: string | null
  cost: number
  price: number
  user_id: string
  has_pricing: boolean
  sku?: string
  initial_price?: number
  category?: string
  url?: string
  image_url?: string
  is_available?: boolean
}

interface ProductsListProps {
  initialProducts: Product[]
}

export default function ProductsList({ initialProducts }: ProductsListProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [filter, setFilter] = useState<"all" | "priced" | "not-priced">("all")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [sortOption, setSortOption] = useState<string>("recent")
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [productToEdit, setProductToEdit] = useState<Product | null>(null)

  const { isMobile, isTablet } = useScreenInfo()
  const { isRTL, flipIcon } = useRTL()
  const supabase = createClientComponentClient<Database>()

  // تحديث قائمة المنتجات من قاعدة البيانات الجديدة
  const refreshProducts = async () => {
    try {
      setIsRefreshing(true)

      // التحقق من المستخدم الحالي
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // جلب المنتجات من قاعدة البيانات الجديدة
      const { data: productsList, error } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      setProducts(productsList || [])
      applyFilters(productsList || [], searchTerm, filter, sortOption)
      setSelectedProducts([])
    } catch (error) {
      console.error("خطأ في تحديث المنتجات:", error)
      toast.error("حدث خطأ أثناء تحديث المنتجات")
    } finally {
      setIsRefreshing(false)
      setIsLoading(false)
    }
  }

  // تطبيق الفلاتر على المنتجات
  const applyFilters = useCallback((productsList: Product[], term: string, filterType: string, sort: string) => {
    let filtered = [...productsList]

    // البحث بالاسم أو الرمز أو الفئة
    if (term) {
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(term.toLowerCase()) ||
          p.sku?.toLowerCase().includes(term.toLowerCase()) ||
          p.category?.toLowerCase().includes(term.toLowerCase()) ||
          p.description?.toLowerCase().includes(term.toLowerCase()),
      )
    }

    // فلترة حسب التسعير
    if (filterType === "priced") {
      filtered = filtered.filter((p) => p.has_pricing)
    } else if (filterType === "not-priced") {
      filtered = filtered.filter((p) => !p.has_pricing)
    }

    // ترتيب المنتجات
    switch (sort) {
      case "name":
        filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""))
        break
      case "price-high":
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case "price-low":
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case "profit":
        filtered.sort((a, b) => {
          const marginA = calculateProfitMargin(a) || 0
          const marginB = calculateProfitMargin(b) || 0
          return marginB - marginA
        })
        break
      case "recent":
      default:
        break
    }

    setFilteredProducts(filtered)
  }, [])

  // تحديث الفلاتر عند تغيير أي من المعايير
  useEffect(() => {
    applyFilters(products, searchTerm, filter, sortOption)
  }, [searchTerm, filter, sortOption, applyFilters, products])

  // التعامل مع تغييرات البحث
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)
  }

  // التعامل مع تغييرات الفلتر
  const handleFilterChange = (filterType: "all" | "priced" | "not-priced") => {
    setFilter(filterType)
  }

  // حساب هامش الربح للمنتج
  const calculateProfitMargin = (product: Product) => {
    if (product.price && product.cost && product.cost > 0) {
      const profitMargin = ((product.price - product.cost) / product.price) * 100
      return Math.round(profitMargin)
    }
    return null
  }

  // التحقق إذا كانت المنتج محدد
  const isProductSelected = (productId: string) => {
    return selectedProducts.includes(productId)
  }

  // تبديل حالة تحديد المنتج
  const toggleProductSelection = (productId: string) => {
    if (isProductSelected(productId)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId))
    } else {
      setSelectedProducts([...selectedProducts, productId])
    }
  }

  // تحديد/إلغاء تحديد كل المنتجات
  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredProducts.map((p) => p.id))
    }
  }

  // حذف المنتجات المحددة من قاعدة البيانات الجديدة
  const deleteSelectedProducts = async () => {
    try {
      setIsLoading(true)

      const { error } = await supabase.from("products").delete().in("id", selectedProducts)

      if (error) throw error

      toast.success(`تم حذف ${selectedProducts.length} منتج بنجاح`)
      refreshProducts()
    } catch (error) {
      console.error("خطأ في حذف المنتجات:", error)
      toast.error("حدث خطأ أثناء حذف المنتجات")
    } finally {
      setIsDeleteModalOpen(false)
      setSelectedProducts([])
    }
  }

  // إنشاء منتج جديد
  const handleProductCreated = (productId: string) => {
    refreshProducts()
    setAddModalOpen(false)
    toast.success("تم إنشاء المنتج بنجاح")
  }

  // تنسيق السعر والأرقام بالريال السعودي
  const formatPrice = (price: number | undefined | null) => {
    if (price === undefined || price === null) return "—"

    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
      currencyDisplay: "narrowSymbol",
    }).format(price)
  }

  // إدارة المنتج
  const handleManageProduct = (productId: string, action: "edit" | "delete") => {
    if (action === "edit") {
      const product = products.find((p) => p.id === productId)
      if (product) {
        setProductToEdit(product)
        setAddModalOpen(true)
      }
    } else if (action === "delete") {
      setSelectedProducts([productId])
      setIsDeleteModalOpen(true)
    }
  }

  // تلوين هامش الربح استناداً على النسبة
  const getProfitMarginColor = (margin: number | null) => {
    if (margin === null) return "bg-gray-200"
    if (margin < 15) return "bg-red-500"
    if (margin < 30) return "bg-amber-500"
    return "bg-green-500"
  }

  // الحصول على فئات المنتجات الفريدة
  const categories = [...new Set(products.filter((p) => p.category).map((p) => p.category))] as string[]

  // الحصول على اسم مختصر
  const truncateText = (text: string, length: number) => {
    if (!text) return ""
    return text.length > length ? `${text.substring(0, length)}...` : text
  }

  return (
    <section className="space-y-6">
      {/* رأس القائمة */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className={`${isRTL ? "order-2 sm:order-1" : ""} w-full sm:w-auto`}>
              <h2 className="text-xl font-bold text-gray-900">قائمة المنتجات</h2>
              <p className="text-muted-foreground text-sm mt-1">
                {filteredProducts.length} منتج • {products.filter((p) => p.has_pricing).length} مسعّر •{" "}
                {products.filter((p) => !p.has_pricing).length} بانتظار التسعير
              </p>
            </div>
            <div
              className={`flex ${isRTL ? "justify-end order-1 sm:order-2" : "justify-start"} gap-2 w-full sm:w-auto`}
            >
              <Button
                className={`gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 flex-1 sm:flex-none ${isRTL ? "flex-row-reverse" : ""}`}
                onClick={() => {
                  setProductToEdit(null)
                  setAddModalOpen(true)
                }}
              >
                <PlusCircle className={`h-4 w-4 ${isRTL ? "mr-0 ml-1" : "ml-0 mr-1"}`} />
                <span>{isMobile ? "إضافة" : "إضافة منتج جديد"}</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="w-10 h-10 border-gray-200"
                onClick={refreshProducts}
                disabled={isRefreshing}
              >
                <RotateCcw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          {/* شريط البحث والفلترة */}
          <div className={`flex flex-col ${isMobile ? "" : "sm:flex-row"} gap-3 items-stretch sm:items-center`}>
            <div className={`relative flex-1 ${isRTL ? "rtl" : "ltr"}`}>
              <Search
                className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400`}
              />
              <Input
                placeholder="ابحث عن منتج حسب الاسم أو الرمز..."
                value={searchTerm}
                onChange={handleSearchChange}
                className={`${isRTL ? "pl-4 pr-10 text-right" : "pl-10 pr-4 text-left"} border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50`}
              />
            </div>

            <div
              className={`flex ${isMobile && isRTL ? "flex-row-reverse justify-end" : "justify-start"} gap-2 overflow-x-auto pb-2 sm:pb-0`}
            >
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange("all")}
                className={`whitespace-nowrap ${filter === "all" ? "bg-indigo-600 hover:bg-indigo-700" : ""} ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <Filter className={`h-4 w-4 ${isRTL ? "ml-1 mr-0" : "mr-1 ml-0"}`} />
                الكل
              </Button>
              <Button
                variant={filter === "priced" ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange("priced")}
                className={`whitespace-nowrap ${filter === "priced" ? "bg-green-600 hover:bg-green-700" : ""} ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <Check className={`h-4 w-4 ${isRTL ? "ml-1 mr-0" : "mr-1 ml-0"}`} />
                مسعّر
              </Button>
              <Button
                variant={filter === "not-priced" ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange("not-priced")}
                className={`whitespace-nowrap ${filter === "not-priced" ? "bg-amber-600 hover:bg-amber-700" : ""} ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <Clock className={`h-4 w-4 ${isRTL ? "ml-1 mr-0" : "mr-1 ml-0"}`} />
                غير مسعّر
              </Button>

              {/* زر طريقة العرض */}
              <Button
                variant="outline"
                size="icon"
                className="border-gray-200 h-9 w-9"
                onClick={() => setViewMode(viewMode === "grid" ? "table" : "grid")}
                title={viewMode === "grid" ? "عرض جدولي" : "عرض شبكي"}
              >
                {viewMode === "grid" ? <Table2 className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
              </Button>

              {/* قائمة الترتيب */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`border-gray-200 gap-1 ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">ترتيب</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align={isRTL ? "start" : "end"} className="p-2 w-48">
                  <div className="grid gap-1">
                    <Button
                      variant="ghost"
                      className={`justify-start text-sm h-8 px-2 ${sortOption === "recent" ? "bg-indigo-50 text-indigo-700" : ""} ${isRTL ? "text-right" : "text-left"}`}
                      onClick={() => setSortOption("recent")}
                    >
                      الأحدث
                    </Button>
                    <Button
                      variant="ghost"
                      className={`justify-start text-sm h-8 px-2 ${sortOption === "name" ? "bg-indigo-50 text-indigo-700" : ""} ${isRTL ? "text-right" : "text-left"}`}
                      onClick={() => setSortOption("name")}
                    >
                      الاسم (أ-ي)
                    </Button>
                    <Button
                      variant="ghost"
                      className={`justify-start text-sm h-8 px-2 ${sortOption === "price-high" ? "bg-indigo-50 text-indigo-700" : ""} ${isRTL ? "text-right" : "text-left"}`}
                      onClick={() => setSortOption("price-high")}
                    >
                      السعر (الأعلى أولاً)
                    </Button>
                    <Button
                      variant="ghost"
                      className={`justify-start text-sm h-8 px-2 ${sortOption === "price-low" ? "bg-indigo-50 text-indigo-700" : ""} ${isRTL ? "text-right" : "text-left"}`}
                      onClick={() => setSortOption("price-low")}
                    >
                      السعر (الأقل أولاً)
                    </Button>
                    <Button
                      variant="ghost"
                      className={`justify-start text-sm h-8 px-2 ${sortOption === "profit" ? "bg-indigo-50 text-indigo-700" : ""} ${isRTL ? "text-right" : "text-left"}`}
                      onClick={() => setSortOption("profit")}
                    >
                      هامش الربح (الأعلى أولاً)
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {selectedProducts.length > 0 && (
            <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-md p-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Input
                  type="checkbox"
                  checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4"
                />
                <span className="text-sm text-indigo-700">
                  {selectedProducts.length} منتج محدد من أصل {filteredProducts.length}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedProducts([])}
                className="text-xs h-8 border-indigo-200 text-indigo-700"
              >
                إلغاء التحديد
              </Button>
            </div>
          )}
        </div>

        {/* قسم حالة التحميل */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="border-gray-100 shadow-sm">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-14 w-14 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-8 w-full rounded" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 flex-1 rounded" />
                      <Skeleton className="h-8 flex-1 rounded" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* حالة عدم وجود منتجات */}
        {!isLoading && filteredProducts.length === 0 && (
          <div className="p-4 sm:p-6">
            <Card className="border-gray-100 shadow-sm">
              <CardContent className="p-8 text-center">
                <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center bg-slate-50 mb-4">
                  <Package className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  {searchTerm || filter !== "all" ? "لا توجد منتجات تطابق البحث" : "لا توجد منتجات"}
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {searchTerm || filter !== "all"
                    ? "قم بتغيير معايير البحث للعثور على المنتجات"
                    : "قم بإضافة منتجك الأول للبدء في إدارة منتجاتك وتسعيرها"}
                </p>
                {!searchTerm && filter === "all" && (
                  <Button
                    onClick={() => setAddModalOpen(true)}
                    className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>إضافة منتج جديد</span>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* قائمة المنتجات - عرض شبكي */}
        {!isLoading && filteredProducts.length > 0 && viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-6">
            <AnimatePresence>
              {filteredProducts.map((product) => {
                const profitMargin = calculateProfitMargin(product)
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    layout
                    className="relative group"
                  >
                    <div
                      className={`absolute top-2 ${isRTL ? "left-2" : "right-2"} z-10 ${isProductSelected(product.id) ? "visible" : "invisible group-hover:visible"}`}
                    >
                      <input
                        type="checkbox"
                        checked={isProductSelected(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>
                    <Card
                      className={`h-full border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden ${isProductSelected(product.id) ? "border-2 border-indigo-500" : ""}`}
                    >
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center gap-4 flex-row-reverse text-right">
                          <div className="h-14 w-14 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                            {product.image_url ? (
                              <Image
                                src={product.image_url || "/placeholder.svg"}
                                alt={product.name}
                                width={56}
                                height={56}
                                className="object-cover"
                              />
                            ) : (
                              <Package className="h-6 w-6 text-gray-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-row-reverse">
                              <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                              {product.category && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  {product.category}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 text-right">{product.sku || "—"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex justify-between items-center text-sm mb-4 flex-row-reverse">
                          <span className="text-gray-500">السعر:</span>
                          <span className={`font-medium ${product.has_pricing ? "text-green-700" : "text-gray-700"}`}>
                            {product.price ? formatPrice(product.price) : "غير محدد"}
                          </span>
                        </div>

                        {product.cost > 0 && (
                          <div className="flex justify-between items-center text-sm mb-4 flex-row-reverse">
                            <span className="text-gray-500">التكلفة:</span>
                            <span className="font-medium text-gray-700">{formatPrice(product.cost)}</span>
                          </div>
                        )}

                        {profitMargin !== null && (
                          <div className="mb-4">
                            <div className="flex justify-between items-center text-xs mb-1 flex-row-reverse">
                              <span className="text-gray-500">هامش الربح:</span>
                              <div className="flex items-center gap-1 text-indigo-700 flex-row-reverse">
                                <TrendingUp className="h-3 w-3" />
                                <span>{profitMargin}%</span>
                              </div>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${getProfitMarginColor(profitMargin)}`}
                                style={{ width: `${Math.min(profitMargin, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        <Separator className="my-4" />

                        <div className="flex flex-col gap-3">
                          <Link href={`/pricing/calculator?product_id=${product.id}`} className="w-full">
                            <Button
                              className="w-full gap-2 flex-row-reverse bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                              size="sm"
                            >
                              {product.has_pricing ? (
                                <>
                                  <Edit className="h-4 w-4 ml-1 mr-0" />
                                  تعديل التسعير
                                </>
                              ) : (
                                <>
                                  <BadgeDollarSign className="h-4 w-4 ml-1 mr-0" />
                                  تسعير المنتج
                                </>
                              )}
                            </Button>
                          </Link>

                          <div className="flex gap-2 w-full flex-row-reverse">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-gray-700 flex-row-reverse"
                              onClick={() => handleManageProduct(product.id, "edit")}
                            >
                              <Edit className="h-4 w-4 ml-1 mr-0" />
                              {isMobile ? "" : "تعديل"}
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="flex-1 text-gray-700 flex-row-reverse">
                                  <span className={isMobile ? "" : "ml-1"}>{isMobile ? "" : "المزيد"}</span>
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-48">
                                {product.url && (
                                  <DropdownMenuItem onClick={() => window.open(product.url, "_blank")}>
                                    <ExternalLink className="h-4 w-4 ml-2" />
                                    <span>عرض في المتجر</span>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleManageProduct(product.id, "edit")}>
                                  <Edit className="h-4 w-4 ml-2" />
                                  <span>تعديل المنتج</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toggleProductSelection(product.id)}>
                                  <Check className="h-4 w-4 ml-2" />
                                  <span>{isProductSelected(product.id) ? "إلغاء التحديد" : "تحديد"}</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600"
                                  onClick={() => handleManageProduct(product.id, "delete")}
                                >
                                  <Trash2 className="h-4 w-4 ml-2" />
                                  <span>حذف</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        {/* عرض جدولي للمنتجات */}
        {!isLoading && filteredProducts.length > 0 && viewMode === "table" && (
          <div className="overflow-x-auto p-4 sm:p-6">
            <table className="min-w-full bg-white divide-y divide-gray-200 rounded-lg border border-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="p-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4"
                    />
                  </th>
                  <th scope="col" className="p-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المنتج
                  </th>
                  <th scope="col" className="p-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الرمز
                  </th>
                  <th scope="col" className="p-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الفئة
                  </th>
                  <th scope="col" className="p-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    السعر
                  </th>
                  <th scope="col" className="p-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التكلفة
                  </th>
                  <th scope="col" className="p-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    هامش الربح
                  </th>
                  <th
                    scope="col"
                    className="p-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const profitMargin = calculateProfitMargin(product)
                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-gray-50 ${isProductSelected(product.id) ? "bg-indigo-50" : ""}`}
                    >
                      <td className="p-4">
                        <Input
                          type="checkbox"
                          checked={isProductSelected(product.id)}
                          onChange={() => toggleProductSelection(product.id)}
                          className="w-4 h-4"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center mr-3">
                            {product.image_url ? (
                              <Image
                                src={product.image_url || "/placeholder.svg"}
                                alt={product.name}
                                width={30}
                                height={30}
                                className="object-cover"
                              />
                            ) : (
                              <Package className="h-4 w-4 text-gray-300" />
                            )}
                          </div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-500">{product.sku || "—"}</td>
                      <td className="p-4">
                        {product.category ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {product.category}
                          </Badge>
                        ) : (
                          <span className="text-sm text-gray-500">—</span>
                        )}
                      </td>
                      <td className="p-4 text-sm font-medium text-gray-900">{formatPrice(product.price)}</td>
                      <td className="p-4 text-sm text-gray-600">{formatPrice(product.cost)}</td>
                      <td className="p-4">
                        <div className="flex items-center">
                          {profitMargin !== null ? (
                            <>
                              <div className="h-2 w-12 bg-gray-100 rounded-full overflow-hidden mr-2">
                                <div
                                  className={`h-full rounded-full ${getProfitMarginColor(profitMargin)}`}
                                  style={{ width: `${Math.min(profitMargin, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{profitMargin}%</span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-500">—</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <Link href={`/pricing/calculator?product_id=${product.id}`}>
                            <Button
                              size="sm"
                              variant={product.has_pricing ? "outline" : "default"}
                              className={product.has_pricing ? "border-indigo-200 text-indigo-700" : ""}
                            >
                              {product.has_pricing ? (
                                <Edit className="h-4 w-4" />
                              ) : (
                                <BadgeDollarSign className="h-4 w-4" />
                              )}
                            </Button>
                          </Link>
                          <Button size="sm" variant="outline" onClick={() => handleManageProduct(product.id, "edit")}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleManageProduct(product.id, "delete")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* تذييل القائمة */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50 text-sm text-gray-500 text-center">
          {`تم عرض ${filteredProducts.length} منتج من أصل ${products.length}`}
        </div>
      </div>

      {/* مودال إضافة/تعديل منتج جديد */}
      <AddProductModal
        isOpen={addModalOpen}
        onClose={() => {
          setAddModalOpen(false)
          setProductToEdit(null)
        }}
        onProductCreated={handleProductCreated}
        productToEdit={productToEdit}
      />

      {/* مودال تأكيد الحذف */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>تأكيد الحذف</CardTitle>
              <CardDescription>
                هل أنت متأكد من أنك تريد حذف {selectedProducts.length} منتج؟ لا يمكن التراجع عن هذا الإجراء.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="bg-red-50 text-red-800 border border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>سيتم حذف هذه المنتجات بشكل نهائي من قاعدة البيانات.</AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                إلغاء
              </Button>
              <Button variant="destructive" onClick={deleteSelectedProducts} disabled={isLoading}>
                {isLoading ? "جاري الحذف..." : "تأكيد الحذف"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </section>
  )
}
