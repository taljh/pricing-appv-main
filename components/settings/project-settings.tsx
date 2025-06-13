"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Percent, Building2, Loader2 } from "lucide-react";
import { PaymentMethods } from "@/components/settings/payment-methods";
import { motion } from "framer-motion";

interface ProjectSettingsProps {
  userId: string;
}

interface ProjectSettings {
  id?: string;
  user_id: string;
  project_name: string;
  target_category: "economic" | "medium" | "luxury";
  target_profit: number;
  expected_monthly_sales: number;
  currency: string;
  created_at?: string;
  updated_at?: string;
}

export function ProjectSettings({ userId }: ProjectSettingsProps) {
  const supabase = createClientComponentClient();
  const { toast } = useToast();
  const [settings, setSettings] = useState<ProjectSettings>({
    user_id: userId,
    project_name: "نظام تسعير المنتجات المتقدم",
    target_category: "medium",
    target_profit: 30,
    expected_monthly_sales: 30,
    currency: "SAR",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryLabels] = useState({
    economic: "اقتصادي",
    medium: "متوسط",
    luxury: "فاخر",
  });

  useEffect(() => {
    if (userId) {
      fetchSettings();
    }
  }, [userId]);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("project_settings")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error("Error fetching project settings:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل إعدادات المشروع"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const settingsData = {
        ...settings,
        user_id: userId,
      };

      let response;

      if (settings.id) {
        response = await supabase
          .from("project_settings")
          .update(settingsData)
          .eq("id", settings.id);
      } else {
        response = await supabase
          .from("project_settings")
          .insert([settingsData]);
      }

      if (response.error) throw response.error;

      toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات المشروع بنجاح",
      });

      fetchSettings();
    } catch (error) {
      console.error("Error saving project settings:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ الإعدادات"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card dir="rtl" className="settings-card">
        <CardHeader className="settings-header">
          <CardTitle className="flex items-center gap-2 justify-start">
            <Building2 className="h-5 w-5 text-muted-foreground ml-2" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          </CardTitle>
          <CardDescription>
            <div className="h-3 w-48 bg-muted animate-pulse rounded mr-7" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-24 bg-muted animate-pulse rounded text-right" />
              <div className="h-9 w-full bg-muted animate-pulse rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="grid gap-6"
      dir="rtl"
    >
      <Card className="settings-card">
        <CardHeader className="settings-header">
          <CardTitle className="flex items-center gap-2 justify-start">
            <Building2 className="h-5 w-5 text-primary ml-2" />
            إعدادات المشروع
          </CardTitle>
          <CardDescription className="mr-7">
            قم بتخصيص إعدادات مشروعك وتحديد أهدافك التجارية
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="settings-form space-y-6">
            <div className="grid gap-6 sm:grid-cols-2 grid-settings">
              <div className="form-group space-y-2">
                <Label htmlFor="project_name" className="form-label">اسم المشروع</Label>
                <Input
                  id="project_name"
                  value={settings.project_name}
                  onChange={(e) => setSettings({ ...settings, project_name: e.target.value })}
                  placeholder="أدخل اسم المشروع"
                  className="form-input"
                  dir="rtl"
                />
              </div>
              
              <div className="form-group space-y-2">
                <Label htmlFor="currency" className="form-label">العملة</Label>
                <Input
                  id="currency"
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  placeholder="SAR"
                  className="form-input"
                  dir="rtl"
                />
              </div>

              <div className="form-group space-y-2">
                <Label htmlFor="target_category" className="form-label">الفئة المستهدفة</Label>
                <div className="select-wrapper">
                  <Select
                    value={settings.target_category}
                    onValueChange={(value: "economic" | "medium" | "luxury") =>
                      setSettings({ ...settings, target_category: value })
                    }
                  >
                    <SelectTrigger id="target_category" className="select-trigger" dir="rtl">
                      <SelectValue placeholder="اختر الفئة المستهدفة" />
                    </SelectTrigger>
                    <SelectContent className="rtl-dropdown" align="end">
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value} className="text-right">
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="form-group space-y-2">
                <Label htmlFor="target_profit" className="form-label">هامش الربح المستهدف (%)</Label>
                <div className="input-group relative">
                  <Input
                    id="target_profit"
                    type="number"
                    value={settings.target_profit}
                    onChange={(e) =>
                      setSettings({ ...settings, target_profit: parseFloat(e.target.value) || 0 })
                    }
                    className="form-input form-icon-left"
                    dir="rtl"
                    min={0}
                    max={100}
                  />
                  <Percent className="form-icon-left absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="form-group space-y-2">
                <Label htmlFor="expected_monthly_sales" className="form-label">المبيعات الشهرية المتوقعة</Label>
                <div className="input-group relative">
                  <Input
                    id="expected_monthly_sales"
                    type="number"
                    value={settings.expected_monthly_sales}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        expected_monthly_sales: parseInt(e.target.value) || 0,
                      })
                    }
                    className="form-input form-icon-left"
                    dir="rtl"
                    min={0}
                  />
                  <TrendingUp className="form-icon-left absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="rtl-btn-container flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rtl-btn min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    جاري الحفظ...
                    <Loader2 className="rtl-btn-icon mr-2 h-4 w-4 animate-spin" />
                  </>
                ) : (
                  "حفظ التغييرات"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <PaymentMethods projectSettingsId={settings.id!} />
    </motion.div>
  );
}
