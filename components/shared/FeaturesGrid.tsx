"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calculator, Package, Percent } from "lucide-react"
import Link from "next/link"
import { ReactNode } from "react"

// نموذج بيانات الميزات
export interface FeatureItem {
  title: string
  description: string
  icon: ReactNode
  href: string
  color: string
}

// بيانات الميزات الافتراضية
export const defaultFeatures: FeatureItem[] = [
  {
    title: "إدارة منتجات متكاملة",
    description: "إدارة المنتجات بسهولة مع إمكانية تتبع التكاليف والأسعار والمبيعات",
    icon: <Package className="h-8 w-8 text-indigo-600" />,
    href: "/products",
    color: "indigo"
  },
  {
    title: "حاسبة التسعير الذكية",
    description: "حساب السعر الأمثل بناءً على التكاليف وهامش الربح المستهدف",
    icon: <Calculator className="h-8 w-8 text-emerald-600" />,
    href: "/pricing/calculator",
    color: "emerald"
  },
  {
    title: "تحليل الربحية والخصومات",
    description: "تحليل تأثير الخصومات على هامش الربح وتحديد النسب المثالية للخصم",
    icon: <Percent className="h-8 w-8 text-amber-600" />,
    href: "/pricing",
    color: "amber"
  }
]

interface FeaturesGridProps {
  features?: FeatureItem[]
}

export default function FeaturesGrid({ features = defaultFeatures }: FeaturesGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <Link key={index} href={feature.href} className="block">
          <Card className={`border-2 border-${feature.color}-100 h-full hover:shadow-md transition-shadow`}>
            <CardHeader className="pb-2">
              <div className={`bg-${feature.color}-50 p-3 rounded-lg w-fit mb-2`}>
                {feature.icon}
              </div>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{feature.description}</p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="gap-2">
                <span>الانتقال إلى الميزة</span>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}

// Verify usage and remove if unused.
