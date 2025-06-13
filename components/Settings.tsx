"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Settings, Sliders } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import Link from "next/link"

export function SettingsDialog() {
  const [open, setOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState(true)
  const [emailAlerts, setEmailAlerts] = useState(false)
  
  return (
    <>
      {/* تغيير زر الإعدادات من فتح النافذة المنبثقة إلى توجيه مباشر إلى صفحة الإعدادات */}
      <Link href="/settings">
        <button 
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-900"
          aria-label="الإعدادات"
        >
          <Settings className="h-5 w-5" />
        </button>
      </Link>
      
      {/* الإبقاء على النافذة المنبثقة للإعدادات السريعة كمرجع (يمكن إزالتها لاحقًا إذا لم تعد مطلوبة) */}
      <Dialog open={open} onOpenChange={setOpen} className="hidden">
        <DialogTrigger className="hidden">
          <span></span>
        </DialogTrigger>
        <DialogContent dir="rtl" className="sm:max-w-[600px]">
          <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
            <DialogTitle className="text-xl font-bold">الإعدادات السريعة</DialogTitle>
            <Link href="/settings">
              <Button variant="outline" size="sm" className="gap-2">
                <Sliders className="h-4 w-4 ml-1" />
                <span>إعدادات المشروع</span>
              </Button>
            </Link>
          </DialogHeader>
          
          {/* ... باقي محتوى النافذة المنبثقة ... */}
        </DialogContent>
      </Dialog>
    </>
  )
}
