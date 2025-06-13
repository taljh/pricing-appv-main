# دليل المصادقة وإدارة البيانات في نظام التسعير المتقدم

## جدول المحتويات

1. [نظرة عامة على نظام المصادقة](#نظرة-عامة-على-نظام-المصادقة)
2. [إدارة الجلسات (Sessions)](#إدارة-الجلسات)
3. [استخدام سياق المصادقة (AuthContext)](#استخدام-سياق-المصادقة)
4. [وصول المكونات للبيانات](#وصول-المكونات-للبيانات)
5. [آلية التحقق من حالة المصادقة](#آلية-التحقق-من-حالة-المصادقة)
6. [حماية المسارات والصفحات](#حماية-المسارات-والصفحات)
7. [تخزين وجلب بيانات المستخدم](#تخزين-وجلب-بيانات-المستخدم)
8. [أفضل الممارسات والأنماط المتبعة](#أفضل-الممارسات-والأنماط-المتبعة)
9. [حل المشكلات الشائعة](#حل-المشكلات-الشائعة)
10. [نموذج رمز للاستخدام](#نموذج-رمز-للاستخدام)

## نظرة عامة على نظام المصادقة

يستخدم نظام التسعير المتقدم مكتبة **Supabase** لإدارة المصادقة وتخزين البيانات، مع نهج مركزي لإدارة حالة المصادقة عبر التطبيق بالكامل. تم تصميم النظام للتأكد من:

- تسجيل الدخول موحد عبر جميع علامات التبويب والمتصفحات
- وصول آمن للبيانات حسب صلاحيات المستخدم
- إعادة استخدام منطق المصادقة في جميع أجزاء التطبيق
- تجربة مستخدم سلسة مع انتقالات سهلة

### التقنيات المستخدمة

- **Supabase Auth**: للتعامل مع تسجيل الدخول، التسجيل، وإدارة الجلسات
- **React Context**: لمشاركة حالة المصادقة عبر المكونات
- **Next.js Middleware**: لحماية المسارات وتوجيه المستخدمين
- **Local Storage & Cookies**: لتخزين وإدارة بيانات الجلسة

## إدارة الجلسات

### تهيئة Supabase للمصادقة

نظام المصادقة مبني على ملفين أساسيين:

1. **lib/supabaseClient.js**: ينشئ مثيل Supabase الرئيسي مع إعداد الكوكيز المناسب
2. **lib/auth-context.tsx**: يوفر سياق المصادقة لجميع المكونات

\`\`\`javascript
// lib/supabaseClient.js - تهيئة العميل مع إعدادات الكوكيز المناسبة
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    storageKey: 'sb-pricing-app-auth-token',
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: {
      // تهيئة التخزين بطريقة توفر التوافق عبر المتصفحات
      getItem: (key) => {
        if (typeof window === 'undefined') return null;
        return JSON.parse(window.localStorage.getItem(key) || 'null');
      },
      setItem: (key, value) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(value));
        }
      },
      removeItem: (key) => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key);
        }
      },
    }
  }
})
\`\`\`

### دورة حياة الجلسة

1. **إنشاء الجلسة**: عند تسجيل الدخول، يتم إنشاء جلسة جديدة وتخزينها في localStorage وكوكيز المتصفح
2. **التحقق من الجلسة**: يتم التحقق من الجلسة في جميع الطلبات لضمان صلاحيتها
3. **تجديد الجلسة**: يتم تجديد الجلسة تلقائياً عند انتهاء صلاحيتها
4. **إنهاء الجلسة**: عند تسجيل الخروج، يتم مسح الجلسة من التخزين

## استخدام سياق المصادقة

### نظرة عامة على AuthContext

نستخدم `AuthContext` لتوفير حالة المصادقة لكل المكونات في التطبيق. يتضمن هذا السياق:

- حالة المستخدم الحالي
- دالة تسجيل الخروج
- دالة تحديث المعلومات
- حالة التحميل لإظهار المؤشرات المناسبة

\`\`\`tsx
// lib/auth-context.tsx - السياق الرئيسي للمصادقة
import { createContext, useContext, useEffect, useState } from 'react';
import { createClientComponentClient, User, Session } from '@supabase/auth-helpers-nextjs';
import { useRouter, usePathname } from 'next/navigation';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // تنفيذ مزود المصادقة مع التسجيل لتغييرات الحالة
  // ...التفاصيل متوفرة في الملف الكامل
}

// Hook خاص للوصول إلى سياق المصادقة
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
\`\`\`

### كيفية استخدام useAuth في المكونات

\`\`\`tsx
// مثال لاستخدام سياق المصادقة
import { useAuth } from '@/lib/auth-context';

export function ProfileComponent() {
  // الحصول على بيانات المستخدم وحالة المصادقة
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  
  if (isLoading) {
    return <div>جاري التحميل...</div>;
  }
  
  if (!isAuthenticated) {
    return <div>يرجى تسجيل الدخول للوصول إلى هذه الصفحة</div>;
  }
  
  return (
    <div>
      <h1>مرحباً {user?.email}</h1>
      <button onClick={signOut}>تسجيل الخروج</button>
    </div>
  );
}
\`\`\`

## وصول المكونات للبيانات

### المبدأ العام

1. استخدم `useAuth` للتحقق من حالة المصادقة
2. استخدم `supabase` للوصول إلى البيانات بشكل مباشر
3. تأكد من استخدام الاستعلامات المناسبة التي تفلتر البيانات حسب المستخدم

### نمط استرجاع البيانات الموصى به

\`\`\`tsx
// نمط موصى به لاسترجاع البيانات
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabaseClient';

function ProductsComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    async function loadData() {
      // لا تنفذ العملية إذا لم تكتمل عملية التحقق من المصادقة بعد
      if (isLoading) return;
      
      // تأكد من أن المستخدم مسجل الدخول
      if (!isAuthenticated || !user) {
        return;
      }
      
      setLoadingProducts(true);
      
      // استرجاع البيانات مع فلترة حسب المستخدم
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id);
      
      if (!error && data) {
        setProducts(data);
      }
      
      setLoadingProducts(false);
    }
    
    loadData();
  }, [user, isAuthenticated, isLoading]);

  if (isLoading || loadingProducts) {
    return <div>جاري التحميل...</div>;
  }
  
  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
\`\`\`

## آلية التحقق من حالة المصادقة

### تدفق العمليات

1. **التحقق الأولي**: كل صفحة/مكون يستخدم `useAuth` يتحقق من حالة المستخدم
2. **الاشتراك بالتغييرات**: `AuthContext` يدير اشتراكًا لتغييرات المصادقة
3. **تجديد تلقائي**: Supabase يدير تجديد الرموز منتهية الصلاحية تلقائيًا

### التحقق من المصادقة في الـ Middleware

\`\`\`typescript
// middleware.ts - حماية المسارات على مستوى الخادم
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()
  
  const { pathname } = req.nextUrl
  const publicPaths = ['/auth/login', '/auth/signup', '/auth/reset', '/favicon.ico']
  
  // إذا لم يوجد جلسة والمسار ليس عاماً، أعد التوجيه إلى صفحة تسجيل الدخول
  if (!session && !publicPaths.some(path => pathname.startsWith(path))) {
    const loginUrl = new URL('/auth/login', req.url)
    return NextResponse.redirect(loginUrl)
  }
  
  // إذا توفرت جلسة والمسار عام، أعد التوجيه إلى الصفحة الرئيسية
  if (session && publicPaths.some(path => pathname.startsWith(path))) {
    const homeUrl = new URL('/', req.url)
    return NextResponse.redirect(homeUrl)
  }
  
  return res
}
\`\`\`

## حماية المسارات والصفحات

### حماية على مستوى الخادم

يتم استخدام Middleware لحماية المسارات غير العامة، كما موضح أعلاه.

### حماية على مستوى العميل

نستخدم `useAuth` في الصفحات للتحقق من حالة المصادقة:

\`\`\`tsx
// مثال لصفحة محمية
'use client'

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/ui/app-shell';

export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  // إعادة التوجيه إذا لم يكن المستخدم مصادقاً
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-r-indigo-600"></div>
        </div>
      </AppShell>
    );
  }
  
  return (
    <AppShell>
      {/* محتوى الصفحة المحمية */}
    </AppShell>
  );
}
\`\`\`

## تخزين وجلب بيانات المستخدم

### هيكل البيانات

يستخدم النظام الجداول التالية:

1. **auth.users**: (مُدار من Supabase) - بيانات المستخدمين الأساسية
2. **profiles**: معلومات إضافية عن المستخدمين
3. **products**: منتجات المستخدم
4. **settings**: إعدادات المستخدم أو المشروع

### العلاقات بين الجداول

كل جدول يحتوي على حقل `user_id` مرتبط بجدول `auth.users` للتأكد من أن كل مستخدم يرى بياناته الخاصة فقط.

### آلية جلب بيانات المستخدم

استخدم دائمًا حقل المستخدم للفلترة في الاستعلامات:

\`\`\`typescript
// نمط للاستعلام عن البيانات
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/auth-context';

export async function getUserProducts() {
  const { user } = useAuth();
  
  if (!user) return { data: null, error: new Error('User not authenticated') };
  
  return await supabase
    .from('products')
    .select('*')
    .eq('user_id', user.id);
}

export async function updateUserProfile(profileData) {
  const { user } = useAuth();
  
  if (!user) return { data: null, error: new Error('User not authenticated') };
  
  return await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      updated_at: new Date().toISOString(),
      ...profileData,
    }, { onConflict: 'id' });
}
\`\`\`

## أفضل الممارسات والأنماط المتبعة

### ✅ الأنماط الموصى بها

1. **استخدام `useAuth` في كل المكونات** التي تحتاج للوصول لحالة المستخدم
2. **التحقق من `isLoading` قبل عرض المحتوى** لتجنب الحالات الوسيطة
3. **فلترة البيانات دائماً بمعرف المستخدم** لضمان الأمان
4. **التعامل بشكل صحيح مع الأخطاء** وعرض رسائل مناسبة للمستخدم
5. **استخدام الانتظار الكامل للمصادقة** قبل تنفيذ استعلامات البيانات

### ❌ أنماط يجب تجنبها

1. **استخدام `supabase.auth` مباشرة** في المكونات بدلاً من `useAuth`
2. **استدعاء `getCurrentUser()` أو `getCurrentSession()` مباشرة** من ملف auth.js
3. **عدم التحقق من حالة المصادقة** قبل عرض البيانات الخاصة
4. **تخزين حالة المستخدم في useState محلي** بدلاً من استخدام السياق المركزي

## حل المشكلات الشائعة

### مشكلة: عدم ظهور البيانات عند فتح المتصفح بنافذة جديدة

**الحل**: تأكد من أن `AuthProvider` يتم تحميله في الملف الرئيسي `app/layout.tsx` وأن `storageKey` في `supabaseClient.js` موحد.

### مشكلة: رسالة "يجب تسجيل الدخول" رغم تسجيل الدخول بالفعل

**الحل**: تأكد من استخدام `useAuth` بدلاً من استدعاء `supabase.auth.getSession()` مباشرة، وتحقق من `isLoading` قبل عرض الرسائل.

### مشكلة: فقدان الجلسة بعد إعادة تحميل الصفحة

**الحل**: تأكد من أن خيارات `persistSession` و `autoRefreshToken` مضبوطة على `true` في `supabaseClient.js`.

## نموذج رمز للاستخدام

### نموذج لصفحة مكتملة

\`\`\`tsx
'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabaseClient';
import { AppShell } from '@/components/ui/app-shell';
import { toast } from 'sonner';

export default function ProductsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  // تحميل المنتجات عند دخول الصفحة
  useEffect(() => {
    async function loadProducts() {
      if (isLoading) return;
      
      if (!isAuthenticated || !user) {
        // سيعالج middleware هذه الحالة، ولكن يمكن إضافة معالجة إضافية هنا
        return;
      }
      
      setLoadingProducts(true);
      
      try {
        // استرجاع بيانات المنتجات مع التأكد من فلترتها حسب المستخدم
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        setProducts(data || []);
      } catch (error) {
        console.error('Error loading products:', error);
        toast.error('حدث خطأ أثناء تحميل المنتجات');
      } finally {
        setLoadingProducts(false);
      }
    }
    
    loadProducts();
  }, [user, isAuthenticated, isLoading]);

  // إضافة منتج جديد
  async function addNewProduct(productData) {
    if (!isAuthenticated || !user) {
      toast.error('يجب تسجيل الدخول لإضافة منتج');
      return;
    }
    
    try {
      const newProduct = {
        ...productData,
        user_id: user.id,
        created_at: new Date()
      };
      
      const { data, error } = await supabase
        .from('products')
        .insert(newProduct)
        .select();
        
      if (error) {
        throw error;
      }
      
      // تحديث القائمة المحلية بدلاً من إعادة تحميل الصفحة
      setProducts(prev => [data[0], ...prev]);
      toast.success('تمت إضافة المنتج بنجاح');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('حدث خطأ أثناء إضافة المنتج');
    }
  }

  if (isLoading || loadingProducts) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-r-indigo-600"></div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="container py-6">
        <h1>المنتجات ({products.length})</h1>
        
        {/* UI لإضافة منتج وعرض قائمة المنتجات */}
      </div>
    </AppShell>
  );
}
\`\`\`

### نموذج لمكون إضافة/تعديل بيانات

\`\`\`tsx
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function SettingsForm() {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    project_name: '',
    target_profit: 30,
  });
  const [isSaving, setIsSaving] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      toast.error('يرجى تسجيل الدخول أولاً');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // مثال لتحديث البيانات مع ربطها بالمستخدم الحالي
      const { error } = await supabase
        .from('settings')
        .upsert({
          user_id: user.id,
          project_name: formData.project_name,
          target_profit: formData.target_profit,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
        
      if (error) throw error;
      
      toast.success('تم حفظ الإعدادات بنجاح');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('حدث خطأ أثناء حفظ الإعدادات');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="project_name">اسم المشروع</label>
          <Input 
            id="project_name"
            name="project_name"
            value={formData.project_name}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <label htmlFor="target_profit">نسبة الربح المستهدفة</label>
          <Input 
            id="target_profit"
            name="target_profit"
            type="number"
            value={formData.target_profit}
            onChange={handleChange}
          />
        </div>
        
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </Button>
      </div>
    </form>
  );
}
\`\`\`

## الخلاصة

للحصول على إدارة جلسات وبيانات متسقة وآمنة في النظام:

1. **استخدم `AuthProvider`** في المكون الجذري للتطبيق
2. **استخدم `useAuth`** في أي مكون يحتاج للتحقق من المصادقة أو الوصول لبيانات المستخدم
3. **تحقق دائماً من `isAuthenticated` و `isLoading`** قبل عرض أو معالجة البيانات
4. **فلتر البيانات دائماً بـ `user_id`** عند الاستعلام من قاعدة البيانات
5. **تعامل بشكل صحيح مع الأخطاء** وأظهر رسائل مناسبة للمستخدم

باتباع هذه المبادئ، ستضمن تجربة مستخدم سلسة وآمنة، مع تجنب المشاكل الشائعة مثل فقدان الجلسة أو عدم مزامنة البيانات عبر علامات التبويب المختلفة.
