"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Package, Search, Loader2 } from "lucide-react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  sku: string
  category: string
  status: string
  has_pricing: boolean
  price?: number
  cost?: number
}

interface ProductSelectorProps {
  isOpen: boolean
  onClose: () => void
  onProductSelected: (productId: string) => void
}

export default function ProductSelector({ isOpen, onClose, onProductSelected }: ProductSelectorProps) {
  const supabase = createClientComponentClient()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadProducts()
    }
  }, [isOpen])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('يجب تسجيل الدخول لعرض المنتجات')
      }

      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setProducts(data || [])
    } catch (err) {
      console.error('Error loading products:', err)
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل المنتجات')
      toast.error(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل المنتجات')
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleProductSelect = (productId: string) => {
    setSelectedProduct(productId)
  }

  const handleConfirm = () => {
    if (selectedProduct) {
      onProductSelected(selectedProduct)
      onClose()
    } else {
      toast.error('الرجاء اختيار منتج')
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'economic':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-blue-100 text-blue-800'
      case 'luxury':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>اختر منتجاً</DialogTitle>
          <DialogDescription>
            اختر منتجاً من القائمة أدناه أو ابحث عن منتج محدد
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن منتج..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <ScrollArea className="h-[300px] pr-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              لا توجد منتجات متاحة
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedProduct === product.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => handleProductSelect(product.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{product.name}</h4>
                      {product.sku && (
                        <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {product.category && (
                        <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(product.category)}`}>
                          {product.category}
                        </span>
                      )}
                      {product.has_pricing && (
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          مسعر
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedProduct}>
            تأكيد
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
