-- إنشاء جدول profiles إذا لم يكن موجوداً
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    account_type TEXT DEFAULT 'free'::text
);

-- إنشاء جدول project_settings
CREATE TABLE IF NOT EXISTS public.project_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    project_name TEXT DEFAULT 'مشروعي الجديد',
    currency TEXT DEFAULT 'SAR',
    tax_rate DECIMAL(5,4) DEFAULT 0.15,
    profit_margin DECIMAL(5,4) DEFAULT 0.30,
    UNIQUE(user_id)
);

-- إنشاء جدول fixed_costs
CREATE TABLE IF NOT EXISTS public.fixed_costs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category TEXT DEFAULT 'عام',
    is_active BOOLEAN DEFAULT true
);

-- تمكين RLS على جميع الجداول
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixed_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- حذف السياسات الموجودة إذا كانت موجودة
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own project settings" ON public.project_settings;
DROP POLICY IF EXISTS "Users can update own project settings" ON public.project_settings;
DROP POLICY IF EXISTS "Users can insert own project settings" ON public.project_settings;

DROP POLICY IF EXISTS "Users can view own fixed costs" ON public.fixed_costs;
DROP POLICY IF EXISTS "Users can manage own fixed costs" ON public.fixed_costs;

DROP POLICY IF EXISTS "Users can view own products" ON public.products;
DROP POLICY IF EXISTS "Users can manage own products" ON public.products;

-- إنشاء سياسات جديدة للـ profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- سياسات project_settings
CREATE POLICY "Users can view own project settings" ON public.project_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own project settings" ON public.project_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own project settings" ON public.project_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- سياسات fixed_costs
CREATE POLICY "Users can view own fixed costs" ON public.fixed_costs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own fixed costs" ON public.fixed_costs
    FOR ALL USING (auth.uid() = user_id);

-- سياسات products
CREATE POLICY "Users can view own products" ON public.products
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own products" ON public.products
    FOR ALL USING (auth.uid() = user_id);

-- إنشاء دالة لإنشاء ملف شخصي تلقائياً
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- إنشاء ملف شخصي للمستخدم الجديد
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'مستخدم جديد')
    );
    
    -- إنشاء إعدادات المشروع الافتراضية
    INSERT INTO public.project_settings (user_id)
    VALUES (NEW.id);
    
    -- إضافة بعض التكاليف الثابتة الافتراضية
    INSERT INTO public.fixed_costs (user_id, name, amount, category)
    VALUES 
        (NEW.id, 'إيجار المحل', 5000.00, 'إيجار'),
        (NEW.id, 'فواتير الكهرباء', 800.00, 'مرافق'),
        (NEW.id, 'راتب الموظفين', 8000.00, 'رواتب');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- حذف المحفز إذا كان موجوداً
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- إنشاء محفز لإنشاء ملف شخصي تلقائياً
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- إنشاء دالة لتحديث updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إضافة محفزات تحديث التاريخ
DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.project_settings;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.project_settings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.fixed_costs;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.fixed_costs
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.products;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
