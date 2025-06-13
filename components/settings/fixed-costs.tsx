"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  CreditCard,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  AlertCircle,
  Calculator,
  TrendingUp,
  Store,
  Receipt,
  Building,
  Building2,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface FixedCostsProps {
  userId: string;
}

interface FixedCost {
  id: string;
  name: string;
  amount: number;
  period: "monthly" | "yearly" | "once";
  created_at: string;
  updated_at: string;
}

interface FixedCostsSummary {
  total_monthly: number
  total_yearly: number
  cost_per_product: number
  expected_sales: number
}

const periods = [
  { value: "monthly", label: "شهري", description: "تكلفة متكررة كل شهر", icon: "📅" },
  { value: "yearly", label: "سنوي", description: "تكلفة متكررة كل سنة", icon: "🗓️" },
  { value: "once", label: "مرة واحدة", description: "تكلفة لمرة واحدة فقط", icon: "⚡" },
]

const getIconForCost = (name: string) => {
  if (name.includes("متجر") || name.includes("اشتراك")) return <Store className="h-5 w-5" />
  if (name.includes("إيجار") || name.includes("مكتب")) return <Building className="h-5 w-5" />
  if (name.includes("راتب") || name.includes("موظف")) return <Receipt className="h-5 w-5" />
  return <CreditCard className="h-5 w-5" />
}

export function FixedCosts({ userId }: FixedCostsProps) {
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [costs, setCosts] = useState<FixedCost[]>([])
  const [editingCost, setEditingCost] = useState<FixedCost | null>(null)
  const [isAddingCost, setIsAddingCost] = useState(false)
  const [newCost, setNewCost] = useState<Partial<FixedCost>>({
    name: "",
    amount: 0,
    period: "monthly",
  });

  useEffect(() => {
    if (userId) {
      fetchCosts()
    }
  }, [userId])

  const fetchCosts = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("fixed_costs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error

      setCosts(data || [])
    } catch (error) {
      console.error("Error fetching fixed costs:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل التكاليف الثابتة",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCost = async () => {
    try {
      setIsSaving(true);

      const { error } = await supabase.from("fixed_costs").insert([
        {
          user_id: userId,
          name: newCost.name,
          amount: newCost.amount,
          period: newCost.period,
        },
      ]);

      if (error) throw error;

      toast({
        title: "تم الإضافة",
        description: "تم إضافة التكلفة الثابتة بنجاح"
      });

      setNewCost({
        name: "",
        amount: 0,
        period: "monthly",
      });
      setIsAddingCost(false);
      fetchCosts();
    } catch (error) {
      console.error("Error adding fixed cost:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة التكلفة الثابتة"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateCost = async (cost: FixedCost) => {
    try {
      setIsSaving(true);

      const { error } = await supabase
        .from("fixed_costs")
        .update({
          name: cost.name,
          amount: cost.amount,
          period: cost.period,
        })
        .eq("id", cost.id);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: "تم تحديث التكلفة الثابتة بنجاح"
      });

      setEditingCost(null);
      fetchCosts();
    } catch (error) {
      console.error("Error updating fixed cost:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث التكلفة الثابتة"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCost = async (id: string) => {
    try {
      setIsSaving(true)

      const { error } = await supabase.from("fixed_costs").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "تم الحذف",
        description: "تم حذف التكلفة الثابتة بنجاح",
      })

      fetchCosts()
    } catch (error) {
      console.error("Error deleting fixed cost:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف التكلفة الثابتة",
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
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          </CardTitle>
          <CardDescription>
            <div className="h-3 w-48 bg-muted animate-pulse rounded" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                التكاليف الثابتة
              </CardTitle>
              <CardDescription>
                إدارة التكاليف الثابتة الشهرية والسنوية لمشروعك
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsAddingCost(true)}
              variant="outline"
              size="sm"
              className="hidden sm:flex"
            >
              إضافة تكلفة جديدة
            </Button>
          </div>
          <Button
            onClick={() => setIsAddingCost(true)}
            variant="outline"
            className="w-full mt-4 sm:hidden"
          >
            إضافة تكلفة جديدة
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isAddingCost && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border rounded-lg p-4 bg-muted/50"
              >
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="new-cost-name">اسم التكلفة</Label>
                      <Input
                        id="new-cost-name"
                        value={newCost.name}
                        onChange={(e) => setNewCost({ ...newCost, name: e.target.value })}
                        placeholder="مثال: إيجار المكتب"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-cost-amount">المبلغ</Label>
                      <Input
                        id="new-cost-amount"
                        type="number"
                        value={newCost.amount}
                        onChange={(e) =>
                          setNewCost({ ...newCost, amount: parseFloat(e.target.value) || 0 })
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-cost-frequency">التكرار</Label>
                    <Select
                      value={newCost.period}
                      onValueChange={(value: "monthly" | "yearly") =>
                        setNewCost({ ...newCost, period: value })
                      }
                    >
                      <SelectTrigger id="new-cost-frequency">
                        <SelectValue placeholder="اختر تكرار التكلفة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">شهري</SelectItem>
                        <SelectItem value="yearly">سنوي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddingCost(false)
                        setNewCost({
                          name: "",
                          amount: 0,
                          period: "monthly",
                        })
                      }}
                    >
                      إلغاء
                    </Button>
                    <Button onClick={handleAddCost} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          جاري الإضافة...
                        </>
                      ) : (
                        "إضافة"
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {costs.length === 0 && !isAddingCost ? (
              <Alert>
                <AlertDescription>
                  لم يتم إضافة أي تكاليف ثابتة بعد. أضف تكاليفك الثابتة للحصول على حسابات أكثر دقة.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid gap-4">
                {costs.map((cost) =>
                  editingCost?.id === cost.id ? (
                    <motion.div
                      key={cost.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border rounded-lg p-4"
                    >
                      <div className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="edit-cost-name">اسم التكلفة</Label>
                            <Input
                              id="edit-cost-name"
                              value={editingCost.name}
                              onChange={(e) =>
                                setEditingCost({ ...editingCost, name: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-cost-amount">المبلغ</Label>
                            <Input
                              id="edit-cost-amount"
                              type="number"
                              value={editingCost.amount}
                              onChange={(e) =>
                                setEditingCost({
                                  ...editingCost,
                                  amount: parseFloat(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-cost-frequency">التكرار</Label>
                          <Select
                            value={editingCost.period}
                            onValueChange={(value: "monthly" | "yearly") =>
                              setEditingCost({ ...editingCost, period: value })
                            }
                          >
                            <SelectTrigger id="edit-cost-frequency">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">شهري</SelectItem>
                              <SelectItem value="yearly">سنوي</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setEditingCost(null)}
                          >
                            إلغاء
                          </Button>
                          <Button
                            onClick={() => handleUpdateCost(editingCost)}
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <>
                                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                جاري الحفظ...
                              </>
                            ) : (
                              "حفظ"
                            )}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={cost.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-4 sm:mb-0">
                        <div className="rounded-lg p-2 bg-primary/10">
                          {getIconForCost(cost.name)}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-medium">{cost.name}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {cost.period === "monthly" ? "شهري" : "سنوي"}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {cost.amount} ريال
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCost(cost)}
                        >
                          تعديل
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteCost(cost.id)}
                        >
                          حذف
                        </Button>
                      </div>
                    </motion.div>
                  )
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
