"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { 
  Sparkles, 
  Rocket, 
  DollarSign, 
  Scissors, 
  ShoppingCart, 
  FileText, 
  BarChart, 
  Bot, 
  Megaphone, 
  Tag,
  ArrowRight,
  PlusCircle,
  Star,
  Zap,
  MessageSquarePlus,
  Send,
  X
} from "lucide-react"
import { toast } from "sonner"

/**
 * مكون ترويجي يعرض الجيل القادم من منصة التسعير الذكية
 * يتم وضعه في أسفل الصفحة الرئيسية
 */
export function SmartPricingPromoCard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [featureSuggestion, setFeatureSuggestion] = useState("")
  const [email, setEmail] = useState("")
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(-1)

  // وظيفة لتقديم اقتراح ميزة جديدة
  const handleSubmitSuggestion = () => {
    // تحقق من صحة المدخلات
    if (!featureSuggestion.trim()) {
      toast.error("الرجاء إدخال اقتراح للميزة")
      return
    }

    if (email && !isValidEmail(email)) {
      toast.error("الرجاء إدخال بريد إلكتروني صالح")
      return
    }

    // هنا يمكن إضافة الكود لإرسال الاقتراح إلى الخادم
    console.log("اقتراح ميزة جديدة:", featureSuggestion, "البريد الإلكتروني:", email)
    
    // عرض رسالة نجاح
    toast.success("تم إرسال اقتراحك بنجاح، شكراً لك!")
    
    // إعادة تعيين النموذج وإغلاق الحوار
    setFeatureSuggestion("")
    setEmail("")
    setIsDialogOpen(false)
  }

  // التحقق من صحة البريد الإلكتروني
  const isValidEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  // قائمة المميزات مع أيقوناتها
  const features = [
    { 
      icon: <DollarSign className="h-5 w-5" />, 
      text: "نظام مالية متكامل لإدارة التكاليف والربح",
      description: "حساب آلي للتكاليف والإيرادات وتحليل هوامش الربح بشكل مفصّل"
    },
    { 
      icon: <Scissors className="h-5 w-5" />, 
      text: "إنتاج حسب الطلب وربط مباشر بالخياط",
      description: "إدارة طلبات الإنتاج وربطها مباشرة بورشات الخياطة لتحسين الكفاءة"
    },
    { 
      icon: <ShoppingCart className="h-5 w-5" />, 
      text: "تكامل مع متجر سلة",
      description: "مزامنة تلقائية مع متجرك الإلكتروني لتحديث المخزون والأسعار"
    },
    { 
      icon: <FileText className="h-5 w-5" />, 
      text: "إصدار قوائم إنتاج ذكية",
      description: "توليد قوائم الإنتاج والمواد المطلوبة بناءً على بيانات المبيعات والطلبات" 
    },
    { 
      icon: <BarChart className="h-5 w-5" />, 
      text: "تقارير مالية تغنيك عن المحاسب",
      description: "لوحات تحكم مالية متكاملة تعرض أداء مبيعاتك وتكاليفك بتفاصيل دقيقة"
    },
    { 
      icon: <Bot className="h-5 w-5" />, 
      text: "تسعير ذكي مبني على السوق",
      description: "خوارزميات ذكاء اصطناعي تحلل أسعار السوق وتقترح الأسعار المثالية"
    },
    { 
      icon: <Megaphone className="h-5 w-5" />, 
      text: "تسويق آلي مدمج",
      description: "نظام يقترح استراتيجيات ترويجية وحملات تسويقية بناءً على تحليل بيانات مبيعاتك"
    },
    { 
      icon: <Tag className="h-5 w-5" />, 
      text: "تتبع ذكي لمخزون الأقمشة",
      description: "نظام متكامل لإدارة المخزون وتتبع كميات الأقمشة المتاحة والمطلوبة"
    }
  ]

  // تغيير مؤشر العنصر النشط كل 3 ثوان
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeatureIndex((prev) => (prev + 1) % features.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [features.length])

  // تأثيرات الحركة
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <Card className="border-2 border-indigo-100 overflow-hidden bg-gradient-to-br from-white to-indigo-50/30 my-10 relative">
        {/* خلفية زخرفية */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-600 rounded-full"></div>
          <div className="absolute -left-10 -bottom-20 w-40 h-40 bg-purple-600 rounded-full"></div>
          <div className="absolute right-1/4 bottom-1/3 w-24 h-24 bg-pink-600 rounded-full"></div>
        </div>
        
        {/* شريط تزييني في أعلى الكارت */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          <div className="absolute top-0 left-0 h-full w-1/4 bg-white opacity-20 animate-pulse"></div>
        </div>
        
        {/* شارة "جديد" للفت الانتباه */}
        <div className="absolute top-4 left-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold px-3 py-1 shadow-lg transform rotate-3 z-10">
          جديد
        </div>
        
        <CardHeader className="pb-2 pt-8 px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-400 rounded-xl blur-md opacity-30 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-indigo-100 to-purple-100 p-3 rounded-xl shadow-inner border border-indigo-200">
                  <Sparkles className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600">نسخة الجيل القادم</h2>
                <p className="font-semibold text-xl text-gray-800">من منصة التسعير الذكية</p>
              </div>
            </div>
            
            <div className="flex">
              <motion.div 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs px-4 py-1.5 rounded-full font-medium flex items-center shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Rocket className="h-3.5 w-3.5 ml-1.5" />
                قريباً في 2025
              </motion.div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="px-8">
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            أدوات متقدمة تعتمد على <span className="font-semibold text-indigo-800">الذكاء الاصطناعي</span> وتحليل بيانات السوق لرفع أرباحك، وتحويل تسعير العبايات إلى <span className="font-semibold text-indigo-800">تجربة ذكية وشاملة</span>.
          </p>
          
          {/* عرض الميزة النشطة حالياً */}
          {activeFeatureIndex >= 0 && (
            <motion.div 
              key={activeFeatureIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="mb-8 bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-indigo-100 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-2 rounded-lg shadow-inner">
                  {features[activeFeatureIndex].icon}
                </div>
                <div>
                  <h3 className="font-bold text-indigo-900">{features[activeFeatureIndex].text}</h3>
                  <p className="text-gray-600 text-sm">{features[activeFeatureIndex].description}</p>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* شبكة المميزات */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4"
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05, 
                  backgroundColor: "rgba(238, 242, 255, 0.7)",
                  boxShadow: "0 4px 6px -1px rgba(99, 102, 241, 0.1), 0 2px 4px -2px rgba(99, 102, 241, 0.1)"
                }}
                className={`relative p-3 rounded-lg transition-all ${activeFeatureIndex === index ? 'bg-indigo-50 border border-indigo-200' : 'border border-transparent'}`}
                onClick={() => setActiveFeatureIndex(index)}
              >
                <FeatureItem 
                  icon={feature.icon} 
                  text={feature.text} 
                  isActive={activeFeatureIndex === index}
                />
                {activeFeatureIndex === index && (
                  <span className="absolute top-1 right-1 text-indigo-500">
                    <Zap className="h-3 w-3" />
                  </span>
                )}
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
        
        <div className="flex justify-center my-2">
          <div className="flex space-x-1 rtl:space-x-reverse">
            {features.map((_, idx) => (
              <button
                key={idx}
                className={`w-2 h-2 rounded-full ${activeFeatureIndex === idx ? 'bg-indigo-600' : 'bg-indigo-200'}`}
                onClick={() => setActiveFeatureIndex(idx)}
              />
            ))}
          </div>
        </div>
        
        <CardFooter className="px-8 flex flex-col sm:flex-row gap-4 items-center justify-between pb-8 pt-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 gap-2 shadow-md px-6">
                  <PlusCircle className="h-4 w-4" />
                  اقترح ميزة تحتاجها كتاجر عبايات
                </Button>
              </motion.div>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-md">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <DialogHeader>
                  <DialogTitle className="text-xl flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500" />
                    <span>اقتراح ميزة جديدة</span>
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">ما هي الميزة التي تحتاجها؟</label>
                    <Textarea 
                      placeholder="صف الميزة التي تحتاجها في عملك كتاجر عبايات..."
                      value={featureSuggestion}
                      onChange={(e) => setFeatureSuggestion(e.target.value)}
                      className="resize-none focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      rows={5}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">البريد الإلكتروني (اختياري)</label>
                    <Input 
                      type="email"
                      placeholder="للتواصل عند تطوير الميزة"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <p className="text-xs text-gray-500">لن يتم استخدام بريدك الإلكتروني لأغراض أخرى غير التواصل حول اقتراحك.</p>
                  </div>
                </div>
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">إلغاء</Button>
                  </DialogClose>
                  <Button 
                    onClick={handleSubmitSuggestion}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    إرسال الاقتراح
                  </Button>
                </DialogFooter>
              </motion.div>
            </DialogContent>
          </Dialog>
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>النسخة التجريبية متاحة للمستخدمين المميزين</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

// مكون فرعي لعرض ميزة واحدة
function FeatureItem({ icon, text, isActive = false }: { icon: React.ReactNode, text: string, isActive?: boolean }) {
  return (
    <div className="flex items-start gap-3 cursor-pointer">
      <div className={`flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-indigo-500'} transition-colors mt-0.5`}>
        {icon}
      </div>
      <span className={`text-sm ${isActive ? 'text-indigo-900 font-medium' : 'text-gray-700'} transition-colors`}>{text}</span>
    </div>
  )
}
