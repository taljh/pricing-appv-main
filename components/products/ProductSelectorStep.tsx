"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Package, 
  Search, 
  CheckCircle, 
  PlusCircle, 
  Clock, 
  ArrowLeft,
  Loader2,
  Star,
  Filter
} from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Database } from "@/types/supabase"
import AddProductModal from "@/components/products/AddProductModal"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"

export type Product = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string | null;
  cost: number;
  price: number;
  user_id: string;
  has_pricing: boolean; // Added property
  sku?: string; // Added property
  category?: string; // Added property
  initial_price?: number; // Added property
};

interface ProductSelectorStepProps {
  onProductSelected: (productId: string) => void
  onCreateNewClick?: () => void
  onClose?: () => void
}

export default function ProductSelectorStep({ 
  onProductSelected,
  onCreateNewClick,
  onClose
}: ProductSelectorStepProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<'all' | 'priced' | 'not-priced'>('all')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [recentProducts, setRecentProducts] = useState<Product[]>([])
  const [isContinuing, setIsContinuing] = useState(false)

  // فلترة المنتجات حسب البحث والفلاتر
  const filteredProducts = products.filter(product => {
    // تطبيق البحث
    const matchesSearch = !searchTerm || 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // تطبيق فلتر التسعير
    const matchesFilter = 
      filterType === 'all' || 
      (filterType === 'priced' && product.has_pricing) || 
      (filterType === 'not-priced' && !product.has_pricing);
    
    return matchesSearch && matchesFilter;
  });

  // إحضار المنتجات من قاعدة البيانات
  useEffect(() => {
    fetchProducts();
  }, []);

  // جلب بيانات المنتجات
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const supabase = createClientComponentClient<Database>();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("لم يتم العثور على المستخدم");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // حفظ جميع المنتجات
      setProducts(data || []);

      // تحديد المنتجات الأخيرة (5 منتجات)
      setRecentProducts((data || []).slice(0, 5));
      
    } catch (error) {
      console.error("خطأ في جلب المنتجات:", error);
      toast.error("حدث خطأ أثناء تحميل المنتجات");
    } finally {
      setIsLoading(false);
    }
  };

  // التعامل مع اختيار منتج
  const handleSelectProduct = (productId: string) => {
    setSelectedProduct(productId);
  };

  // التعامل مع المتابعة بالمنتج المحدد
  const handleContinue = () => {
    if (!selectedProduct) {
      toast.error("الرجاء اختيار منتج للمتابعة");
      return;
    }

    setIsContinuing(true);
    // تأخير بسيط لإظهار حالة التحميل
    setTimeout(() => {
      onProductSelected(selectedProduct);
    }, 500);
  };

  // التعامل مع إنشاء منتج جديد
  const handleProductCreated = (productId: string) => {
    setAddModalOpen(false);
    // تنفيذ الانتقال مباشرة للحاسبة
    onProductSelected(productId);
  };

  // تغيير البحث
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // تغيير فلتر التسعير
  const handleFilterChange = (type: 'all' | 'priced' | 'not-priced') => {
    setFilterType(type);
  };

  // تمثيل حالة فارغة عند عدم وجود منتجات
  const renderEmptyState = () => (
    <div className="text-center py-16 px-4">
      <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center bg-slate-50 mb-4">
        <Package className="h-10 w-10 text-slate-300" />
      </div>
      <h3 className="text-lg font-medium text-gray-800 mb-2">
        {searchTerm || filterType !== 'all' 
          ? "لا توجد منتجات تطابق البحث" 
          : "لا توجد منتجات"}
      </h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        {searchTerm || filterType !== 'all' 
          ? "قم بتغيير معايير البحث للعثور على المنتجات" 
          : "قم بإضافة منتجك الأول للبدء في تسعيره"}
      </p>
      {!searchTerm && filterType === 'all' && (
        <Button 
          onClick={() => setAddModalOpen(true)}
          className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
        >
          <PlusCircle className="h-4 w-4 ml-1" />
          <span>إضافة منتج جديد</span>
        </Button>
      )}
    </div>
  );

  // رندر منتج واحد
  const renderProduct = (product: Product) => (
    <Card
      key={product.id}
      className={`border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer h-full ${
        selectedProduct === product.id ? 'ring-2 ring-indigo-500 ring-opacity-60 shadow-md' : ''
      }`}
      onClick={() => handleSelectProduct(product.id)}
    >
      <CardContent className="p-4 flex flex-col">
        <div className="flex flex-row-reverse sm:flex-row items-center gap-3">
          <div className="h-12 w-12 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
            <Package className="h-5 w-5 text-gray-300" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
              <Badge 
                className={product.has_pricing 
                  ? "bg-green-50 text-green-700 border-green-200 flex gap-1 items-center" 
                  : "bg-amber-50 text-amber-700 border-amber-200 flex gap-1 items-center"}
              >
                {product.has_pricing ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    <span>مسعّر</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3" />
                    <span>غير مسعّر</span>
                  </>
                )}
              </Badge>
            </div>
            <div className="mt-1 flex justify-between">
              <div className="text-xs text-gray-500">
                {product.sku && <span className="font-mono">SKU: {product.sku}</span>}
              </div>
              <div className="text-sm font-medium text-indigo-700">
                {product.price ? `${product.price.toFixed(0)} ريال` : "—"}
              </div>
            </div>
          </div>
        </div>
        
        {selectedProduct === product.id && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">الفئة:</span>
              <span className="font-medium">{product.category || "غير محدد"}</span>
            </div>
            {product.has_pricing && (
              <div className="flex justify-between text-sm mt-1">
                <span className="font-medium">{product.initial_price ? `${product.initial_price.toFixed(0)} ريال` : "—"}</span>
                <span className="font-medium">{product.initial_price?.toFixed(0) || 0} ريال</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-4 max-w-5xl mx-auto rtl-enabled"
      >
        <div className="bg-gradient-to-l from-indigo-50 via-indigo-50/60 to-slate-50 border border-indigo-100/50 rounded-lg p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">اختيار منتج للتسعير</h2>
            <p className="text-gray-600 max-w-lg mx-auto">
              اختر منتجًا من القائمة أدناه أو قم بإنشاء منتج جديد للبدء في عملية التسعير
            </p>
          </div>
        </div>

        <Tabs defaultValue="recent" className="w-full">
          <div className="flex items-center justify-center mb-4">
            <TabsList className="mx-auto">
              <TabsTrigger value="recent" className="gap-2">
                <Star className="h-4 w-4 ml-1" />
                <span>المنتجات الأخيرة</span>
              </TabsTrigger>
              <TabsTrigger value="all" className="gap-2">
                <Package className="h-4 w-4 ml-1" />
                <span>كل المنتجات</span>
              </TabsTrigger>
              <TabsTrigger value="create" className="gap-2">
                <PlusCircle className="h-4 w-4 ml-1" />
                <span>إنشاء جديد</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="recent" className="space-y-4">
            {isLoading ? (
              <div className="py-10 text-center">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-500">جار تحميل المنتجات...</p>
              </div>
            ) : recentProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentProducts.map(renderProduct)}
              </div>
            ) : renderEmptyState()}
            
            <div className="flex flex-row-reverse justify-between items-center mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onClose && onClose()}
                className="order-1 sm:order-none"
              >
                إلغاء
              </Button>
              
              <Button
                onClick={handleContinue}
                disabled={!selectedProduct || isContinuing}
                className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 order-2 sm:order-none"
              >
                {isContinuing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ml-1" />
                    <span>جارِ التحميل...</span>
                  </>
                ) : (
                  <>
                    <span>متابعة مع المنتج المحدد</span>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ابحث عن منتج..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pr-4 pl-10 border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div className="flex gap-2 flex-wrap justify-end sm:justify-start sm:flex-nowrap">
                <Button 
                  variant={filterType === 'all' ? "default" : "outline"}
                  size="sm" 
                  onClick={() => handleFilterChange('all')}
                  className={filterType === 'all' ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                >
                  <Filter className="h-4 w-4 ml-1" />
                  الكل
                </Button>
                <Button 
                  variant={filterType === 'priced' ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleFilterChange('priced')}
                  className={filterType === 'priced' ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  <CheckCircle className="h-4 w-4 ml-1" />
                  مسعّر
                </Button>
                <Button 
                  variant={filterType === 'not-priced' ? "default" : "outline"}
                  size="sm" 
                  onClick={() => handleFilterChange('not-priced')}
                  className={filterType === 'not-priced' ? "bg-amber-600 hover:bg-amber-700" : ""}
                >
                  <Clock className="h-4 w-4 ml-1" />
                  غير مسعّر
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[400px] rounded-md border pl-4">
              {isLoading ? (
                <div className="py-10 text-center">
                  <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-500">جار تحميل المنتجات...</p>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                  {filteredProducts.map(renderProduct)}
                </div>
              ) : renderEmptyState()}
            </ScrollArea>
            
            <div className="flex flex-row-reverse justify-between items-center mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onClose && onClose()}
                className="order-1 sm:order-none"
              >
                إلغاء
              </Button>
              
              <Button
                onClick={handleContinue}
                disabled={!selectedProduct || isContinuing}
                className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 order-2 sm:order-none"
              >
                {isContinuing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ml-1" />
                    <span>جارِ التحميل...</span>
                  </>
                ) : (
                  <>
                    <span>متابعة مع المنتج المحدد</span>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-6 text-center">
              <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                <PlusCircle className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">إنشاء منتج جديد</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                قم بإنشاء منتج جديد لإضافته إلى قائمة منتجاتك وبدء عملية التسعير
              </p>
              <Button 
                onClick={() => setAddModalOpen(true)}
                className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
              >
                <PlusCircle className="h-4 w-4 ml-1" />
                <span>إنشاء منتج جديد</span>
              </Button>
            </div>
            
            <div className="flex justify-end items-center mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onClose && onClose()}
              >
                إلغاء
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* مودال إضافة منتج جديد */}
        <AddProductModal 
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onProductCreated={handleProductCreated}
        />
      </motion.div>
    </AnimatePresence>
  );
}
