"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, MinusCircle, BarChart3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface CompetitivePricingProps {
  calculatedPrice: number;
  onCompetitorsUpdate: (avgPrice: number) => void;
}

export default function CompetitivePricing({ calculatedPrice, onCompetitorsUpdate }: CompetitivePricingProps) {
  const [competitorPrices, setCompetitorPrices] = useState<number[]>([])
  const [newPrice, setNewPrice] = useState("")

  const addCompetitorPrice = () => {
    const price = parseFloat(newPrice)
    if (!isNaN(price) && price > 0) {
      const updatedPrices = [...competitorPrices, price]
      setCompetitorPrices(updatedPrices)
      setNewPrice("")
      
      // حساب وتحديث متوسط السعر
      const avgPrice = updatedPrices.reduce((sum, price) => sum + price, 0) / updatedPrices.length
      onCompetitorsUpdate(avgPrice)
    }
  }

  const removeCompetitorPrice = (index: number) => {
    const updatedPrices = competitorPrices.filter((_, i) => i !== index)
    setCompetitorPrices(updatedPrices)
    
    // تحديث متوسط السعر بعد الحذف
    if (updatedPrices.length > 0) {
      const avgPrice = updatedPrices.reduce((sum, price) => sum + price, 0) / updatedPrices.length
      onCompetitorsUpdate(avgPrice)
    } else {
      onCompetitorsUpdate(0)
    }
  }

  const avgCompetitorPrice = competitorPrices.length > 0 
    ? competitorPrices.reduce((sum, price) => sum + price, 0) / competitorPrices.length 
    : 0

  const priceDifference = calculatedPrice - avgCompetitorPrice
  const priceDifferencePercentage = avgCompetitorPrice > 0 
    ? Math.abs((priceDifference / avgCompetitorPrice) * 100) 
    : 0

  return (
    <div className="space-y-4">
      {/* إضافة سعر منافس جديد */}
      <div className="space-y-2">
        <Label htmlFor="new-price" className="text-sm font-medium text-right">
          إضافة سعر منافس
        </Label>
        <div className="flex gap-2">
          <Input
            id="new-price"
            type="number"
            min="0"
            placeholder="أدخل السعر بالريال"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            className="bg-white text-right"
            dir="rtl"
          />
          <Button 
            onClick={addCompetitorPrice}
            className="bg-indigo-600 hover:bg-indigo-700"
            disabled={!newPrice || parseFloat(newPrice) <= 0}
          >
            <Plus className="h-4 w-4 ml-1" />
            إضافة
          </Button>
        </div>
      </div>

      {/* قائمة أسعار المنافسين */}
      {competitorPrices.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-right">أسعار المنافسين</Label>
          <div className="space-y-2">
            {competitorPrices.map((price, index) => (
              <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCompetitorPrice(index)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
                <span className="font-medium">{price} ريال</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* تحليل الأسعار */}
      {competitorPrices.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            <h4 className="font-medium text-right">تحليل الأسعار</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded border">
              <div className="text-xs text-slate-500 mb-1">متوسط أسعار المنافسين</div>
              <div className="font-bold text-lg">{Math.round(avgCompetitorPrice)} ريال</div>
            </div>
            
            <div className="bg-slate-50 p-3 rounded border">
              <div className="text-xs text-slate-500 mb-1">سعرك المقترح</div>
              <div className="font-bold text-lg text-indigo-700">{Math.round(calculatedPrice)} ريال</div>
            </div>
          </div>

          <div className="bg-indigo-50 p-3 rounded border">
            <div className="flex items-center justify-between">
              <Badge className={
                priceDifference > 0 
                  ? "bg-amber-100 text-amber-800 hover:bg-amber-100" 
                  : priceDifference < 0 
                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                  : "bg-slate-100 text-slate-800 hover:bg-slate-100"
              }>
                {priceDifference > 0 
                  ? `أعلى بنسبة ${Math.round(priceDifferencePercentage)}%` 
                  : priceDifference < 0 
                  ? `أقل بنسبة ${Math.round(priceDifferencePercentage)}%`
                  : "مطابق لمتوسط السوق"}
              </Badge>
              <span className="text-sm text-slate-600">
                الفرق: {Math.abs(Math.round(priceDifference))} ريال
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
