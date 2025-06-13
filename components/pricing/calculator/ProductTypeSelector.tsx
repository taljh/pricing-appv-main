"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Scissors, Package, Clock } from "lucide-react"
import { motion } from "framer-motion"

export type ProductType = "abaya" | "regular"

interface ProductTypeSelectorProps {
  onSelect: (type: ProductType) => void
  defaultType?: ProductType
}

export default function ProductTypeSelector({ onSelect, defaultType = "abaya" }: ProductTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<ProductType | null>(null)

  const handleSelect = (type: ProductType) => {
    if (type === "regular") {
      // منع اختيار المنتج العادي مؤقتاً
      return
    }

    setSelectedType(type)
    setTimeout(() => {
      onSelect(type)
    }, 300)
  }

  const productTypes = [
    {
      id: "abaya" as ProductType,
      title: "تسعير العبايات",
      description: "نظام تسعير متخصص للعبايات مع إمكانية إضافة قماش ثانوي وطرحة",
      icon: Scissors,
      color: "indigo",
      features: ["قماش رئيسي وثانوي", "طرحة رئيسية وثانوية", "تكاليف الخياطة", "حساب دقيق للتكاليف"],
      available: true,
    },
    {
      id: "regular" as ProductType,
      title: "المنتجات العادية",
      description: "نظام تسعير للمنتجات العامة والسلع المختلفة",
      icon: Package,
      color: "gray",
      features: ["قريباً", "نظام شامل", "تسعير متقدم", "تحليل مفصل"],
      available: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">اختر نوع المنتج للتسعير</h1>
          <p className="text-gray-600">حدد نوع المنتج الذي تريد تسعيره للحصول على أفضل النتائج</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {productTypes.map((type) => {
            const Icon = type.icon
            const isSelected = selectedType === type.id
            const isAvailable = type.available

            return (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  className={`relative overflow-hidden transition-all duration-300 cursor-pointer border-2 ${
                    isSelected
                      ? "border-indigo-500 shadow-lg scale-105"
                      : isAvailable
                        ? "border-gray-200 hover:border-indigo-300 hover:shadow-md"
                        : "border-gray-100 opacity-75"
                  } ${!isAvailable ? "cursor-not-allowed" : ""}`}
                  onClick={() => isAvailable && handleSelect(type.id)}
                >
                  {!isAvailable && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                      <div className="text-center">
                        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <Badge variant="secondary" className="text-sm">
                          قريباً
                        </Badge>
                      </div>
                    </div>
                  )}

                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${type.color === "indigo" ? "bg-indigo-100" : "bg-gray-100"}`}>
                        <Icon className={`h-6 w-6 ${type.color === "indigo" ? "text-indigo-600" : "text-gray-600"}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{type.title}</h3>
                        <p className="text-gray-600 text-sm mb-4">{type.description}</p>
                        <div className="space-y-2">
                          {type.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div
                                className={`w-1.5 h-1.5 rounded-full ${
                                  type.color === "indigo" ? "bg-indigo-500" : "bg-gray-400"
                                }`}
                              />
                              <span className="text-sm text-gray-600">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {isAvailable && (
                      <div className="mt-6">
                        <Button
                          className={`w-full ${
                            type.color === "indigo"
                              ? "bg-indigo-600 hover:bg-indigo-700"
                              : "bg-gray-600 hover:bg-gray-700"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelect(type.id)
                          }}
                        >
                          {isSelected ? "جاري التحميل..." : "اختيار هذا النوع"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">سيتم إضافة المزيد من أنواع المنتجات قريباً لتوفير تجربة تسعير شاملة</p>
        </div>
      </div>
    </div>
  )
}
