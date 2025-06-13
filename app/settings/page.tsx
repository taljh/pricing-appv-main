"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/ui/app-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectSettings } from "@/components/settings/project-settings";
import { FixedCosts } from "@/components/settings/fixed-costs";
import { Settings, CreditCard, Building2, Loader2, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";

export default function SettingsPage() {
  const [supabase] = useState(() => createClientComponentClient());
  const router = useRouter();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("project");

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;

      if (!session) {
        toast({
          title: "غير مصرح",
          description: "يجب تسجيل الدخول للوصول إلى هذه الصفحة",
        });
        router.push("/login");
        return;
      }

      setUserId(session.user.id);
    } catch (error) {
      console.error("Error checking user session:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء التحقق من الجلسة",
      });
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="container max-w-6xl py-6 space-y-8" dir="rtl">
          <div className="flex items-center gap-2 pb-4 border-b">
            <Settings className="h-6 w-6 text-primary ml-1" />
            <h1 className="text-2xl font-bold">الإعدادات</h1>
          </div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="w-full">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse mr-auto" />
                    <div className="h-8 w-full bg-gray-100 rounded animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="container max-w-6xl py-6 space-y-8"
        dir="rtl"
      >
        <div className="flex items-center justify-between gap-2 pb-4 border-b">
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">الإعدادات</h1>
          </div>
          
          <Link href="/profile">
            <Button variant="outline" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>الملف الشخصي</span>
            </Button>
          </Link>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-8" dir="rtl">
          <TabsList className="flex h-auto p-1 gap-1">
            <TabsTrigger value="project" className="flex items-center gap-2 p-2.5 order-1">
              <Building2 className="h-4 w-4" />
              <span>المشروع</span>
            </TabsTrigger>
            <TabsTrigger value="costs" className="flex items-center gap-2 p-2.5 order-2">
              <CreditCard className="h-4 w-4" />
              <span>التكاليف</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="project" className="space-y-6">
            <ProjectSettings userId={userId!} />
          </TabsContent>

          <TabsContent value="costs" className="space-y-6">
            <FixedCosts userId={userId!} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </AppShell>
  );
}
