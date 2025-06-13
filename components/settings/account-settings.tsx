"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  User,
  Mail,
  Lock,
  Bell,
  PencilLine,
  Upload,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserProfile {
  id: string;
  email: string;
  avatar_url?: string;
  display_name?: string;
  phone?: string;
}

interface AccountSettingsProps {
  userId: string;
  initialProfile: UserProfile;
}

export function AccountSettings({ userId, initialProfile }: AccountSettingsProps) {
  const supabase = createClientComponentClient();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile);
  const [notifications, setNotifications] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

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
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل بيانات الحساب",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updates = {
        display_name: profile?.display_name,
        phone: profile?.phone,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: "تم تحديث بيانات الحساب بنجاح",
      });

      fetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث بيانات الحساب",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return null;

    try {
      const fileExt = avatarFile.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("user-avatars")
        .upload(filePath, avatarFile);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("user-avatars")
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error("Avatar upload error:", error);
      return null;
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Handle avatar upload if file selected
      let avatarUrl = profile?.avatar_url;

      if (avatarFile) {
        const uploadedUrl = await uploadAvatar();
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: profile?.display_name,
          phone: profile?.phone,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: "تم تحديث الملف الشخصي بنجاح",
      });

      fetchProfile();
    } catch (error) {
      console.error("Update profile error:", error);
      toast({
        style: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الملف الشخصي",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          </CardTitle>
          <CardDescription>
            <div className="h-3 w-48 bg-muted animate-pulse rounded" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3].map((i) => (
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
      className="grid gap-6"
    >
      {/* المعلومات الشخصية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            المعلومات الشخصية
          </CardTitle>
          <CardDescription>
            تحديث معلوماتك الشخصية وبيانات الاتصال
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="relative mx-auto sm:mx-0">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={profile?.avatar_url || "/placeholder-user.jpg"}
                  />
                  <AvatarFallback>
                    {profile?.display_name?.charAt(0) ||
                      profile?.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                >
                  <PencilLine className="h-4 w-4" />
                </Button>
              </div>
              <div className="w-full space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="display_name">الاسم</Label>
                    <Input
                      id="display_name"
                      value={profile?.display_name || ""}
                      onChange={(e) =>
                        setProfile(
                          profile ? { ...profile, display_name: e.target.value } : null
                        )
                      }
                      placeholder="الاسم الكامل"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الجوال</Label>
                    <Input
                      id="phone"
                      value={profile?.phone || ""}
                      onChange={(e) =>
                        setProfile(profile ? { ...profile, phone: e.target.value } : null)
                      }
                      placeholder="05xxxxxxxx"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-medium">إشعارات الحساب</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between space-x-2">
                  <Label
                    htmlFor="notifications"
                    className="flex flex-col space-y-1"
                  >
                    <span>الإشعارات داخل التطبيق</span>
                    <span className="font-normal text-sm text-muted-foreground">
                      استلام إشعارات عن التحديثات المهمة
                    </span>
                  </Label>
                  <Switch
                    id="notifications"
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <Label
                    htmlFor="email-updates"
                    className="flex flex-col space-y-1"
                  >
                    <span>تحديثات البريد الإلكتروني</span>
                    <span className="font-normal text-sm text-muted-foreground">
                      استلام التحديثات عبر البريد الإلكتروني
                    </span>
                  </Label>
                  <Switch
                    id="email-updates"
                    checked={emailUpdates}
                    onCheckedChange={setEmailUpdates}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving} className="min-w-[120px]">
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

      {/* الأمان */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            الأمان
          </CardTitle>
          <CardDescription>
            إدارة إعدادات الأمان وكلمة المرور
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 rounded-lg border p-4">
            <div className="space-y-1">
              <h4 className="text-sm font-medium">تغيير كلمة المرور</h4>
              <p className="text-sm text-muted-foreground">
                قم بتحديث كلمة المرور الخاصة بك للحفاظ على أمان حسابك
              </p>
            </div>
            <Button variant="outline" className="shrink-0">
              تغيير كلمة المرور
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
