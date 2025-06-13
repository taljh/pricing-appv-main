"use client"

import { Card, CardContent } from "@/components/ui/card"
import { BarChart3, Calculator, Percent, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { ReactNode } from "react"
import { motion } from "framer-motion"

// نموذج بيانات الإحصائيات
export interface QuickStat {
  label: string
  value: string
  trend: string
  isPositive: boolean
  icon?: ReactNode
}

// بيانات إحصائية افتراضية
export const defaultQuickStats: QuickStat[] = [
  { 
    label: "هامش الربح", 
    value: "32.4%", 
    trend: "+2.3%", 
    isPositive: true,
    icon: <Percent className="h-5 w-5 text-indigo-600" />
  },
  { 
    label: "متوسط السعر", 
    value: "468 ريال", 
    trend: "+3.7%", 
    isPositive: true,
    icon: <Calculator className="h-5 w-5 text-emerald-600" />
  },
  { 
    label: "معدل التحويل", 
    value: "3.2%", 
    trend: "-0.2%", 
    isPositive: false,
    icon: <TrendingUp className="h-5 w-5 text-amber-600" />
  },
  { 
    label: "إجمالي المبيعات", 
    value: "52,430 ريال", 
    trend: "+12.5%", 
    isPositive: true,
    icon: <BarChart3 className="h-5 w-5 text-rose-600" />
  }
]

interface QuickStatsProps {
  stats?: QuickStat[]
  compact?: boolean
}

export default function QuickStats({ stats = defaultQuickStats, compact = false }: QuickStatsProps) {
  return (
    <div className={compact ? "flex flex-wrap gap-3" : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"} dir="rtl">
      {stats.map((stat, index) => (
        <motion.div 
          key={index}
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className={compact ? "flex-1" : ""}
        >
          <Card className="border-indigo-100/40 hover:border-indigo-200 transition-all duration-300 shadow-sm hover:shadow overflow-hidden group">
            <CardContent className={compact ? "p-3" : "p-5"}>
              <div className="flex items-start justify-between">
                <div className={`rounded-full ${compact ? "p-1.5" : "p-2"} bg-gray-50 border border-indigo-100/50 mr-3 mb-3 group-hover:scale-110 transition-all duration-300`}>
                  {stat.icon}
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${stat.isPositive ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                  {stat.isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  <span>{stat.trend}</span>
                </div>
              </div>
              <div className="flex flex-col">
                <div className={compact ? "text-xl font-bold" : "text-2xl font-bold bg-gradient-to-r from-indigo-700 to-indigo-900 bg-clip-text text-transparent"}>
                  {stat.value}
                </div>
                <div className={`${compact ? "text-xs" : "text-sm"} text-gray-500 mt-1`}>
                  {stat.label}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
