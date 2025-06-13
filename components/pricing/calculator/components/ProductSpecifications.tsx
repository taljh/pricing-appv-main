"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { PlusCircle, MinusCircle, RotateCw, Ruler, Info, Scissors } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ProductSize {
  id: string
  name: string
  lengthCm: number
  widthCm: number
  fabricConsumption: number
}

interface ProductSpecificationsProps {
  onFabricChange: (fabricAmount: number) => void
  initialValues?: {
    size?: string
    length?: number
    width?: number
    fabricQuantity?: number
  }
}

const defaultSizes: ProductSize[] = [
  { id: "s", name: "صغير (S)", lengthCm: 140, widthCm: 120, fabricConsumption: 3.5 },
  { id: "m", name: "وسط (M)", lengthCm: 150, widthCm: 130, fabricConsumption: 4 },
  { id: "l", name: "كبير (L)", lengthCm: 160, widthCm: 140, fabricConsumption: 4.5 },
  { id: "xl", name: "كبير جداً (XL)", lengthCm: 170, widthCm: 150, fabricConsumption: 5 },
  { id: "xxl", name: "كبير جداً جداً (XXL)", lengthCm: 180, widthCm: 160, fabricConsumption: 5.5 },
]

export default function ProductSpecifications({ onFabricChange, initialValues = {} }: ProductSpecificationsProps) {
  const [selectedSize, setSelectedSize] = useState(initialValues.size || "")
  const [length, setLength] = useState(initialValues.length || 0)
  const [width, setWidth] = useState(initialValues.width || 0)
  const [fabricQuantity, setFabricQuantity] = useState(initialValues.fabricQuantity || 0)
  const [customSize, setCustomSize] = useState(false)
  const [isChanged, setIsChanged] = useState(false)

  useEffect(() => {
    // إذا تم اختيار مقاس موجود مسبقًا
    if (selectedSize && !customSize && selectedSize !== "none") {
      const size = defaultSizes.find((s) => s.id === selectedSize)
      if (size) {
        setLength(size.lengthCm)
        setWidth(size.widthCm)
        setFabricQuantity(size.fabricConsumption)
        onFabricChange(size.fabricConsumption)
        setIsChanged(true)
      }
    }
  }, [selectedSize, customSize, onFabricChange])

  // حساب كمية القماش المطلوبة عندما تتغير الأبعاد المخصصة
  useEffect(() => {
    if (customSize && length > 0 && width > 0) {
      // معادلة تقريبية لحساب كمية القماش (يمكن تعديلها حسب احتياجات العمل)
      const estimatedFabric = ((length * width) / 10000) * 2.5
      const roundedFabric = Number.parseFloat(estimatedFabric.toFixed(1))
      setFabricQuantity(roundedFabric)
      onFabricChange(roundedFabric)
      setIsChanged(true)
    }
  }, [length, width, customSize, onFabricChange])

  const handleReset = () => {
    setCustomSize(false)
    setSelectedSize("")
    setLength(0)
    setWidth(0)
    setFabricQuantity(0)
    onFabricChange(0)
    setIsChanged(false)
  }

  return (
    <TooltipProvider>
      <motion.div
        dir="rtl"
        className="space-y-4"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-100 p-1 rounded-md">
              <Ruler className="h-4 w-4 text-indigo-600" />
            </div>
            <h3 className="text-sm font-medium text-slate-700">مواصفات وأبعاد المنتج</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-gray-400 hover:text-gray-700 transition-colors cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">تحديد المقاس سيساعد في حساب كمية القماش المطلوبة تلقائيًا</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs flex items-center gap-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            onClick={handleReset}
            disabled={!isChanged}
          >
            <RotateCw className="h-3 w-3" />
            إعادة ضبط
          </Button>
        </div>

        <Card className="bg-white border-indigo-100/40">
          <div className="divide-y divide-gray-100">
            {/* اختيار المقاس */}
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="size-select" className="text-xs flex items-center gap-1.5">
                    <Scissors className="h-3.5 w-3.5 text-indigo-500" />
                    اختر المقاس
                  </Label>
                  <Select
                    value={selectedSize}
                    onValueChange={(value) => {
                      setSelectedSize(value)
                      setCustomSize(false)
                    }}
                    disabled={customSize}
                  >
                    <SelectTrigger
                      id="size-select"
                      className={`${selectedSize ? "" : "text-muted-foreground"} bg-white`}
                    >
                      <SelectValue placeholder="اختر المقاس" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">حدد المقاس</SelectItem>
                      {defaultSizes.map((size) => (
                        <SelectItem key={size.id} value={size.id}>
                          {size.name}
                          <span className="text-gray-500 text-xs mr-1.5">
                            ({size.lengthCm}×{size.widthCm} سم)
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10 text-xs flex items-center gap-1.5 transition-all duration-300"
                    onClick={() => {
                      setCustomSize(!customSize)
                      if (!customSize) {
                        setSelectedSize("")
                      } else if (length === 0 && width === 0) {
                        setFabricQuantity(0)
                        onFabricChange(0)
                      }
                    }}
                  >
                    {customSize ? (
                      <>
                        <MinusCircle className="h-3.5 w-3.5 text-red-500" />
                        إلغاء المقاس المخصص
                      </>
                    ) : (
                      <>
                        <PlusCircle className="h-3.5 w-3.5 text-indigo-500" />
                        إضافة مقاس مخصص
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* الأبعاد وكمية القماش */}
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="length" className="text-xs flex items-center gap-1.5">
                    <Ruler className="h-3.5 w-3.5 text-indigo-500 rotate-90" />
                    الطول (سم)
                  </Label>
                  <div className="relative">
                    <Input
                      id="length"
                      type="number"
                      value={length || ""}
                      onChange={(e) => setLength(Number(e.target.value))}
                      disabled={!customSize && selectedSize !== ""}
                      className="text-left transition-all duration-300 bg-white"
                      dir="ltr"
                      placeholder="0"
                    />
                    {!customSize && selectedSize !== "" && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200">
                          {length} سم
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="width" className="text-xs flex items-center gap-1.5">
                    <Ruler className="h-3.5 w-3.5 text-indigo-500" />
                    العرض (سم)
                  </Label>
                  <div className="relative">
                    <Input
                      id="width"
                      type="number"
                      value={width || ""}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      disabled={!customSize && selectedSize !== ""}
                      className="text-left transition-all duration-300 bg-white"
                      dir="ltr"
                      placeholder="0"
                    />
                    {!customSize && selectedSize !== "" && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200">
                          {width} سم
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="fabric" className="text-xs flex items-center gap-1.5">
                    <Scissors className="h-3.5 w-3.5 text-indigo-500" />
                    كمية القماش (متر)
                  </Label>
                  <div className="relative">
                    <Input
                      id="fabric"
                      type="number"
                      step="0.5"
                      value={fabricQuantity || ""}
                      onChange={(e) => {
                        const newValue = Number(e.target.value)
                        setFabricQuantity(newValue)
                        onFabricChange(newValue)
                        setIsChanged(true)
                      }}
                      disabled={!customSize}
                      className="text-left transition-all duration-300 bg-white"
                      dir="ltr"
                      placeholder="0"
                    />
                    {!customSize && selectedSize !== "" && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200">
                          {fabricQuantity} متر
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* معاينة الآثار المترتبة على القماش */}
              <AnimatePresence>
                {fabricQuantity > 0 && (
                  <motion.div
                    className="mt-4 pt-3 border-t border-dashed border-gray-200"
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-xs text-gray-500 flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <Info className="h-3.5 w-3.5 text-indigo-500" />
                        <span>كمية القماش المقدرة:</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge className="bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 text-indigo-700 border-indigo-200">
                          {fabricQuantity} متر
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-gray-400 flex items-center gap-1.5">
                      <Info className="h-3 w-3" />
                      <span>
                        {customSize
                          ? "تم تقدير الكمية بناءً على الأبعاد المدخلة"
                          : "تم تحديد الكمية بناءً على المقاس المختار"}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Card>
      </motion.div>
    </TooltipProvider>
  )
}
