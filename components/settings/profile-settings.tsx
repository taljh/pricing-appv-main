"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Database } from "@/types/supabase";
import { User, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useRTL } from "@/lib/rtl-context";

interface ProfileSettingsProps {
  userId: string;
}

interface Profile {
  id: string;
  username: string;
  email: string;
  created_at: string;
}

export function ProfileSettings({ userId }: ProfileSettingsProps) {
  const { isRTL } = useRTL?.() || { isRTL: true };
  const [supabase] = useState(() => createClientComponentClient<Database>());
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    username: "",
  });

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setFormData({
          username: data.username,
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل بيانات الملف الشخصي",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: formData.username,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: "تم تحديث بيانات الملف الشخصي بنجاح",
      });

      fetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث بيانات الملف الشخصي",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="rtl-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          </CardTitle>
          <CardDescription>
            <div className="h-3 w-48 bg-muted animate-pulse rounded" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
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
    >
      <Card className="rtl-card">
        <CardHeader className="text-right">
          <CardTitle className="flex items-center justify-start gap-2">
            <User className="h-5 w-5 text-primary ml-2" />
            الملف الشخصي
          </CardTitle>
          <CardDescription>
            تحديث معلومات ملفك الشخصي
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-right block">اسم المستخدم</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="أدخل اسم المستخدم"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-right block">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="bg-muted text-right"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="flex justify-start">
              <Button
                type="submit"
                disabled={isSaving}
                className="min-w-[120px]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  "حفظ التغييرات"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
