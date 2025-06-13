"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { ToggleButton } from "@/components/ui/toggle-button"
import type { Database } from "@/types/supabase"
import {
  Loader2,
  CreditCard,
  Wallet,
  Banknote,
  Percent,
  Calculator,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion } from "framer-motion"

interface PaymentMethodsProps {
  projectSettingsId: string
}

interface PaymentMethod {
  id: string
  name: string
  code: string
  percentage_fee: number
  fixed_fee: number
  tax_rate: number
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface ProjectPaymentMethod {
  id: string
  project_settings_id: string
  payment_method_code: string
  is_enabled: boolean
  created_at: string
  updated_at: string
}

const getPaymentMethodIcon = (code: string) => {
  switch (code.toLowerCase()) {
    case "tabby":
    case "tamara":
      return <CreditCard className="h-5 w-5 text-purple-600" />
    case "mada":
      return <CreditCard className="h-5 w-5 text-green-600" />
    case "visa_master":
      return <CreditCard className="h-5 w-5 text-blue-600" />
    case "stc_pay":
      return <Wallet className="h-5 w-5 text-indigo-600" />
    default:
      return <Banknote className="h-5 w-5" />
  }
}

const getPaymentMethodColor = (code: string) => {
  switch (code.toLowerCase()) {
    case "tabby":
      return "bg-purple-50 border-purple-200 text-purple-800"
    case "tamara":
      return "bg-pink-50 border-pink-200 text-pink-800"
    case "mada":
      return "bg-green-50 border-green-200 text-green-800"
    case "visa_master":
      return "bg-blue-50 border-blue-200 text-blue-800"
    case "stc_pay":
      return "bg-indigo-50 border-indigo-200 text-indigo-800"
    default:
      return "bg-gray-50 border-gray-200 text-gray-800"
  }
}

const calculateTotalFee = (amount: number, method: PaymentMethod) => {
  const percentageFee = amount * method.percentage_fee
  const totalBeforeTax = percentageFee + method.fixed_fee
  const tax = totalBeforeTax * method.tax_rate
  return totalBeforeTax + tax
}

const formatPercent = (value: number) => {
  return (value * 100).toFixed(1);
};

export function PaymentMethods({ projectSettingsId }: PaymentMethodsProps) {
  const [supabase] = useState(() => createClientComponentClient<Database>())
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [projectMethods, setProjectMethods] = useState<ProjectPaymentMethod[]>([])

  useEffect(() => {
    if (projectSettingsId) {
      fetchPaymentMethods()
    }
  }, [projectSettingsId])

  const fetchPaymentMethods = async () => {
    try {
      setIsLoading(true)
      const { data: methods, error: methodsError } = await supabase.from("payment_methods").select("*")
      if (methodsError) throw methodsError

      const { data: projectPaymentMethods, error: projectError } = await supabase
        .from("project_payment_methods")
        .select("*")
        .eq("project_settings_id", projectSettingsId)

      if (projectError) throw projectError

      setPaymentMethods(methods || [])
      setProjectMethods(projectPaymentMethods || [])
    } catch (error) {
      console.error("Error fetching payment methods:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل طرق الدفع"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleMethod = async (methodCode: string, isEnabled: boolean) => {
    try {
      setIsSaving(true)
      const method = projectMethods.find((m) => m.payment_method_code === methodCode)

      if (method) {
        // تحديث حالة طريقة الدفع
        const { error } = await supabase
          .from("project_payment_methods")
          .update({ is_enabled: isEnabled })
          .eq("id", method.id)

        if (error) throw error

        setProjectMethods((prev) =>
          prev.map((m) => (m.payment_method_code === methodCode ? { ...m, is_enabled: isEnabled } : m)),
        )
      } else {
        // إضافة طريقة دفع جديدة
        const { error } = await supabase.from("project_payment_methods").insert([
          {
            project_settings_id: projectSettingsId,
            payment_method_code: methodCode,
            is_enabled: isEnabled,
          },
        ])

        if (error) throw error

        setProjectMethods((prev) => [
          ...prev,
          {
            id: Date.now().toString(), // مؤقت حتى يتم تحديث الصفحة
            project_settings_id: projectSettingsId,
            payment_method_code: methodCode,
            is_enabled: isEnabled,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
      }

      toast({
        title: "تم التحديث",
        description: isEnabled ? "تم تفعيل طريقة الدفع" : "تم تعطيل طريقة الدفع",
      })
    } catch (error) {
      console.error("Error toggling payment method:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث طريقة الدفع",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          </CardTitle>
          <CardDescription>
            <div className="h-3 w-48 bg-muted animate-pulse rounded" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 border rounded-lg animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-3 w-32 bg-muted rounded" />
                </div>
              </div>
              <div className="h-6 w-12 bg-muted rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  const getPaymentMethodDetails = (code: string) => {
    const method = paymentMethods.find((m) => m.code === code)
    const projectMethod = projectMethods.find((m) => m.payment_method_code === code)
    return {
      ...method,
      isEnabled: projectMethod?.is_enabled || false,
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            طرق الدفع
          </CardTitle>
          <CardDescription>إدارة طرق الدفع المتاحة في متجرك</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {paymentMethods.map((method) => {
              const details = getPaymentMethodDetails(method.code)
              return (
                <motion.div
                  key={method.code}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3 mb-4 sm:mb-0">
                    <div className="rounded-lg p-2 bg-primary/10">
                      {getPaymentMethodIcon(method.code)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{method.name}</h4>
                        <Badge variant="outline" className="h-5 px-1.5">
                          {formatPercent(method.percentage_fee)}٪
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground max-w-md">
                        {method.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-muted-foreground">رسوم ثابتة</span>
                      <span className="font-medium">{method.fixed_fee} ريال</span>
                    </div>
                    <Separator orientation="vertical" className="h-8 hidden sm:block" />
                    <ToggleButton
                      checked={details.isEnabled}
                      onCheckedChange={(checked: boolean) => handleToggleMethod(method.code, checked)}
                      disabled={isSaving}
                      size="lg"
                      className="min-w-[100px]"
                    >
                      {details.isEnabled ? "مفعل" : "معطل"}
                    </ToggleButton>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {paymentMethods.length === 0 && (
            <Alert>
              <AlertDescription>لا توجد طرق دفع متاحة حالياً</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
