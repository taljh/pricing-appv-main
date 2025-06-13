"use client"

import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Scissors, CircleDollarSign, PlusCircle } from "lucide-react"
import NumberInput from "./components/NumberInput"
import { useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface AbayaProductFormProps {
  watchedValues: any
  setValue: any
  errors: any
  register: any
}

// مكون مبسط للأزرار
interface SimpleAddButtonProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function SimpleAddButton({ label, checked, onChange }: SimpleAddButtonProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 px-4 rounded-lg cursor-pointer",
        checked
          ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-300"
          : "bg-white border border-gray-200 hover:bg-gray-50"
      )}
      onClick={() => onChange(!checked)}
    >
      <PlusCircle className={cn("h-4 w-4", checked ? "text-indigo-600" : "text-gray-400")} />
      <span className="font-medium text-sm">{label}</span>
      {checked && (
        <Badge variant="secondary" className="mr-auto bg-indigo-50 text-indigo-700 text-[10px]">
          مفعّل
        </Badge>
      )}
    </div>
  )
}

export default function AbayaProductForm({ watchedValues, setValue, errors, register }: AbayaProductFormProps) {
  // دوال معالجة التغييرات مع منع الحلقات اللا نهائية
  const handleSecondaryFabricChange = useCallback(
    (checked: boolean) => {
      setValue("has_secondary_fabric", checked, { shouldDirty: true })
      if (!checked) {
        setValue("fabric_secondary_cost", 0, { shouldDirty: true })
      }
    },
    [setValue],
  )

  const handleTurhaChange = useCallback(
    (checked: boolean) => {
      setValue("has_turha", checked, { shouldDirty: true })
      if (!checked) {
        setValue("turha_main_cost", 0, { shouldDirty: true })
        setValue("has_secondary_turha", false, { shouldDirty: true })
        setValue("turha_secondary_cost", 0, { shouldDirty: true })
      }
    },
    [setValue],
  )

  const handleSecondaryTurhaChange = useCallback(
    (checked: boolean) => {
      setValue("has_secondary_turha", checked, { shouldDirty: true })
      if (!checked) {
        setValue("turha_secondary_cost", 0, { shouldDirty: true })
      }
    },
    [setValue],
  )

  const handleMarketingTypeChange = useCallback(
    (value: "fixed" | "percentage") => {
      setValue("marketing_type", value, { shouldDirty: true })
    },
    [setValue],
  )

  const handleProfitMarginChange = useCallback(
    (value: number) => {
      setValue("profit_margin", value, { shouldDirty: true })
    },
    [setValue],
  )

  return (
    <>
      {/* التكاليف الأساسية */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-indigo-50 p-2 rounded-lg">
            <Scissors className="h-5 w-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold">التكاليف الأساسية للعباية</h3>
        </div>
        <div className="space-y-4">
          {/* كرت تكاليف القماش */}
          <Card className="p-4 bg-muted/30">
            <div className="space-y-4">
              <h4 className="font-medium border-b pb-2">تكاليف القماش</h4>
              <NumberInput
                label="تكلفة القماش الرئيسي"
                value={watchedValues.fabric_main_cost || 0}
                onChange={(value) => setValue("fabric_main_cost", value, { shouldDirty: true })}
                required
              />

              <div className="border-t pt-4 mt-4">
                <SimpleAddButton
                  label="إضافة قماش ثانوي"
                  checked={watchedValues.has_secondary_fabric || false}
                  onChange={handleSecondaryFabricChange}
                />

                <AnimatePresence>
                  {watchedValues.has_secondary_fabric && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="pt-3 overflow-hidden"
                    >
                      <NumberInput
                        label="تكلفة القماش الثانوي"
                        value={watchedValues.fabric_secondary_cost || 0}
                        onChange={(value) => setValue("fabric_secondary_cost", value, { shouldDirty: true })}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </Card>

          {/* كرت تكاليف الطرحة */}
          <Card className="p-4 bg-muted/30">
            <div className="space-y-4">
              <h4 className="font-medium border-b pb-2">تكاليف الطرحة</h4>

              <SimpleAddButton
                label="إضافة طرحة"
                checked={watchedValues.has_turha || false}
                onChange={handleTurhaChange}
              />

              <AnimatePresence>
                {watchedValues.has_turha && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4 pt-3 overflow-hidden"
                  >
                    <NumberInput
                      label="تكلفة الطرحه الرئيسية"
                      value={watchedValues.turha_main_cost || 0}
                      onChange={(value) => setValue("turha_main_cost", value, { shouldDirty: true })}
                    />

                    <div className="border-t pt-4">
                      <SimpleAddButton
                        label="إضافة طرحة ثانوية"
                        checked={watchedValues.has_secondary_turha || false}
                        onChange={handleSecondaryTurhaChange}
                      />

                      <AnimatePresence>
                        {watchedValues.has_secondary_turha && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="pt-3 overflow-hidden"
                          >
                            <NumberInput
                              label="تكلفة الطرحة الثانوية"
                              value={watchedValues.turha_secondary_cost || 0}
                              onChange={(value) => setValue("turha_secondary_cost", value, { shouldDirty: true })}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>

          {/* كرت تكاليف الخياطة */}
          <Card className="p-4 bg-muted/30">
            <div className="space-y-4">
              <h4 className="font-medium border-b pb-2">تكاليف الخياطة</h4>
              <NumberInput
                label="تكلفة الخياطة"
                value={watchedValues.tailoring_cost || 0}
                onChange={(value) => setValue("tailoring_cost", value, { shouldDirty: true })}
                required
              />
            </div>
          </Card>

          {/* تكاليف التغليف والتوصيل */}
          <Card className="p-4 bg-muted/30">
            <div className="space-y-4">
              <h4 className="font-medium border-b pb-2">تكاليف التغليف والتوصيل</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NumberInput
                  label="تكلفة التغليف"
                  value={watchedValues.packaging_cost || 0}
                  onChange={(value) => setValue("packaging_cost", value, { shouldDirty: true })}
                />

                <NumberInput
                  label="تكلفة التوصيل"
                  value={watchedValues.delivery_cost || 0}
                  onChange={(value) => setValue("delivery_cost", value, { shouldDirty: true })}
                />
              </div>
            </div>
          </Card>

          {/* تكاليف إضافية */}
          <Card className="p-4 bg-muted/30">
            <div className="space-y-4">
              <h4 className="font-medium border-b pb-2">تكاليف إضافية</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NumberInput
                  label="مصاريف إضافية أخرى"
                  value={watchedValues.extra_expenses || 0}
                  onChange={(value) => setValue("extra_expenses", value, { shouldDirty: true })}
                />

                <NumberInput
                  label="التكاليف الثابتة (محسوبة تلقائياً)"
                  value={watchedValues.fixed_costs || 0}
                  onChange={(value) => setValue("fixed_costs", value, { shouldDirty: true })}
                  disabled
                  description="محسوبة من التكاليف الثابتة مقسومة على عدد المبيعات المتوقعة شهرياً"
                />
              </div>
            </div>
          </Card>
        </div>
      </Card>

      {/* هامش الربح والتسويق */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-indigo-50 p-2 rounded-lg">
            <CircleDollarSign className="h-5 w-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold">الربحية والتسويق</h3>
        </div>
        
        <div className="space-y-6">
          {/* كرت هامش الربح المُحسّن */}
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-4 border border-emerald-100">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full mr-2 text-xs font-bold">1</span>
              هامش الربح
              <Badge className="mr-auto bg-emerald-100 text-emerald-700 border-0">مطلوب</Badge>
            </h4>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-600 mb-1.5 block">حدد نسبة هامش الربح المطلوبة</Label>
                <div className="flex flex-wrap gap-2">
                  {[10, 20, 30, 40, 50].map((percentage) => (
                    <Button
                      key={percentage}
                      type="button"
                      variant={watchedValues.profit_margin === percentage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleProfitMarginChange(percentage)}
                      className={cn(
                        "min-w-[60px]",
                        watchedValues.profit_margin === percentage 
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                          : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      )}
                    >
                      {percentage}%
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-sm text-gray-600 mb-1.5 block">أو أدخل نسبة مخصصة</Label>
                <div className="flex items-center mt-1">
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    {...register("profit_margin", {
                      valueAsNumber: true,
                      required: "نسبة هامش الربح مطلوبة",
                      min: { value: 0, message: "النسبة يجب أن تكون أكبر من أو تساوي صفر" },
                      max: { value: 100, message: "النسبة يجب أن تكون أقل من أو تساوي 100" },
                    })}
                    className="text-center max-w-[120px] border-emerald-200 focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                    placeholder="30"
                    style={{ textAlign: 'right' }}
                  />
                  <span className="text-gray-500 mr-2">%</span>
                </div>
                {errors.profit_margin && (
                  <p className="text-red-500 text-xs mt-1">{errors.profit_margin.message}</p>
                )}
              </div>
            </div>
            
            {watchedValues.profit_margin > 0 && (
              <div className="mt-3 text-xs text-gray-500 bg-white border border-gray-100 rounded p-2">
                <span className="font-medium text-emerald-700">معلومة:</span> هامش ربح {watchedValues.profit_margin}% 
                يعني أن ربحك سيكون {watchedValues.profit_margin} ريال من كل 100 ريال من التكاليف.
              </div>
            )}
          </div>

          {/* كرت تكاليف التسويق المُحسّن */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-indigo-100">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full mr-2 text-xs font-bold">2</span>
              تكاليف التسويق
            </h4>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-600 mb-1.5 block">نوع تكلفة التسويق</Label>
                <Select 
                  value={watchedValues.marketing_type || "fixed"} 
                  onValueChange={handleMarketingTypeChange}
                >
                  <SelectTrigger className="border-indigo-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                    <SelectValue placeholder="اختر نوع التكلفة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">مبلغ ثابت (ريال)</SelectItem>
                    <SelectItem value="percentage">نسبة من التكاليف (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <NumberInput
                  label={
                    watchedValues.marketing_type === "percentage" ? "نسبة تكلفة التسويق" : "تكلفة التسويق"
                  }
                  value={watchedValues.marketing_costs || 0}
                  onChange={(value) => setValue("marketing_costs", value, { shouldDirty: true })}
                  max={watchedValues.marketing_type === "percentage" ? 100 : undefined}
                  description={
                    watchedValues.marketing_type === "percentage"
                      ? "النسبة من إجمالي التكاليف المباشرة"
                      : "قيمة ثابتة بالريال"
                  }
                />
              </div>
            </div>
            
            <div className="mt-3 text-xs bg-white border border-gray-100 rounded p-2">
              <p className="text-gray-500">
                <span className="font-medium text-indigo-700">نصيحة:</span>{" "}
                {watchedValues.marketing_type === "percentage"
                  ? "استخدم النسبة المئوية لتعديل تكلفة التسويق تلقائياً عند تغير التكاليف."
                  : "استخدم المبلغ الثابت إذا كانت ميزانية التسويق محددة مسبقاً."}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </>
  )
}
