# نظام إدارة الإعدادات - التوثيق الفني

## نظرة عامة
يقدم هذا القسم شرحاً مفصلاً لكيفية عمل قسم الإعدادات في النظام، وكيفية ربطه مع قاعدة البيانات Supabase، وإدارة جلسات المستخدمين.

## هيكل قاعدة البيانات

### جدول project_settings
\`\`\`sql
CREATE TABLE project_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    project_name TEXT NOT NULL,
    target_category TEXT NOT NULL CHECK (target_category IN ('economic', 'medium', 'luxury')),
    target_profit INTEGER NOT NULL CHECK (target_profit BETWEEN 20 AND 50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

## إدارة الجلسة والمستخدم

### 1. التحقق من الجلسة
في الصفحة الرئيسية للإعدادات (`app/settings/page.tsx`)، يتم التحقق من وجود جلسة مستخدم نشطة:

\`\`\`typescript
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
  }
};
\`\`\`

### 2. تمرير معرف المستخدم
يتم تمرير معرف المستخدم (`userId`) إلى جميع المكونات الفرعية:

\`\`\`typescript
<TabsContent value="project">
  <ProjectSettings userId={userId} />
</TabsContent>
\`\`\`

## إدارة بيانات المشروع

### 1. هيكل البيانات
يتم تعريف واجهة البيانات في `project-settings.tsx`:

\`\`\`typescript
interface ProjectSettingsData {
  id?: string;
  user_id: string;
  project_name: string;
  target_category: "economic" | "medium" | "luxury";
  target_profit: number;
  created_at?: string;
  updated_at?: string;
}
\`\`\`

### 2. سحب البيانات
يتم سحب بيانات المشروع عند تحميل المكون:

\`\`\`typescript
const fetchProjectSettings = async () => {
  try {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("project_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No data found, this is expected for new users
        return;
      }
      throw error;
    }

    if (data) {
      setSettings({
        id: data.id,
        user_id: data.user_id,
        project_name: data.project_name,
        target_category: data.target_category,
        target_profit: data.target_profit,
        created_at: data.created_at,
        updated_at: data.updated_at,
      });
    }
  } catch (error) {
    console.error("Error fetching project settings:", error);
    toast({
      title: "خطأ في جلب البيانات",
      description: "حدث خطأ أثناء جلب بيانات المشروع",
    });
  } finally {
    setIsLoading(false);
  }
};
\`\`\`

### 3. حفظ البيانات
يتم حفظ التغييرات في قاعدة البيانات:

\`\`\`typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const { data, error } = await supabase
      .from("project_settings")
      .upsert({
        user_id: userId,
        project_name: settings.project_name,
        target_category: settings.target_category,
        target_profit: settings.target_profit,
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) throw error;

    if (data) {
      setSettings(prev => ({
        ...prev,
        id: data.id,
        created_at: data.created_at,
        updated_at: data.updated_at,
      }));

      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ إعدادات المشروع بنجاح",
      });
    }
  } catch (error) {
    console.error("Error saving project settings:", error);
    toast({
      title: "خطأ في الحفظ",
      description: "حدث خطأ أثناء حفظ إعدادات المشروع",
    });
  } finally {
    setIsLoading(false);
  }
};
\`\`\`

## ميزات الأمان

1. **التحقق من الجلسة**: يتم التحقق من وجود جلسة مستخدم نشطة قبل عرض أي بيانات.
2. **التحقق من الملكية**: يتم التحقق من أن المستخدم يملك الصلاحية للوصول إلى البيانات.
3. **التحقق من صحة البيانات**: يتم التحقق من صحة البيانات قبل حفظها في قاعدة البيانات.

## معالجة الأخطاء

1. **أخطاء الجلسة**: يتم إعادة توجيه المستخدم إلى صفحة تسجيل الدخول.
2. **أخطاء قاعدة البيانات**: يتم عرض رسائل خطأ مناسبة للمستخدم.
3. **أخطاء التحقق من الصحة**: يتم عرض رسائل خطأ توضيحية للمستخدم.

## تحسينات الأداء

1. **استعلام واحد**: يتم استخدام استعلام واحد لسحب جميع البيانات المطلوبة.
2. **تحديث فوري**: يتم تحديث واجهة المستخدم فوراً بعد نجاح العملية.
3. **تعطيل الحقول**: يتم تعطيل الحقول أثناء عمليات التحميل والحفظ.

## ملاحظات هامة

1. يجب التأكد من وجود الجلسة قبل أي عملية.
2. يجب التحقق من صحة البيانات قبل حفظها.
3. يجب معالجة جميع حالات الخطأ بشكل مناسب.
4. يجب عرض رسائل مناسبة للمستخدم في جميع الحالات.

## الخطوات المستقبلية

1. إضافة نظام التخزين المؤقت للبيانات.
2. تحسين أداء الاستعلامات.
3. إضافة المزيد من خيارات التحقق من الصحة.
4. تحسين تجربة المستخدم في حالات الخطأ.
