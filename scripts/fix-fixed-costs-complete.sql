-- إصلاح شامل لنظام التكاليف الثابتة

-- 1. حذف الوظائف القديمة المعطلة
DROP FUNCTION IF EXISTS get_fixed_costs_summary(UUID);
DROP FUNCTION IF EXISTS calculate_fixed_costs_per_product(UUID);

-- 2. التأكد من وجود جدول fixed_costs بالهيكل الصحيح
CREATE TABLE IF NOT EXISTS fixed_costs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    period VARCHAR(20) NOT NULL DEFAULT 'monthly' CHECK (period IN ('monthly', 'yearly', 'once')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. إعداد RLS policies بشكل صحيح
ALTER TABLE fixed_costs ENABLE ROW LEVEL SECURITY;

-- حذف السياسات الموجودة
DROP POLICY IF EXISTS "Users can view own fixed costs" ON fixed_costs;
DROP POLICY IF EXISTS "Users can insert own fixed costs" ON fixed_costs;
DROP POLICY IF EXISTS "Users can update own fixed costs" ON fixed_costs;
DROP POLICY IF EXISTS "Users can delete own fixed costs" ON fixed_costs;

-- إنشاء سياسات جديدة
CREATE POLICY "Users can view own fixed costs" ON fixed_costs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fixed costs" ON fixed_costs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fixed costs" ON fixed_costs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own fixed costs" ON fixed_costs
    FOR DELETE USING (auth.uid() = user_id);

-- 4. إنشاء وظيفة بسيطة لحساب التكاليف الثابتة لكل منتج
CREATE OR REPLACE FUNCTION calculate_fixed_costs_per_product(user_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
    total_monthly NUMERIC := 0;
    expected_sales INTEGER := 30;
    result NUMERIC := 0;
BEGIN
    -- جلب عدد المبيعات المتوقعة
    SELECT COALESCE(expected_monthly_sales, 30) INTO expected_sales
    FROM project_settings 
    WHERE user_id = user_uuid;
    
    -- إذا لم توجد إعدادات، استخدم القيمة الافتراضية
    IF expected_sales IS NULL OR expected_sales = 0 THEN
        expected_sales := 30;
    END IF;
    
    -- حساب إجمالي التكاليف الشهرية
    SELECT COALESCE(SUM(
        CASE 
            WHEN period = 'monthly' THEN amount
            WHEN period = 'yearly' THEN amount / 12.0
            ELSE 0
        END
    ), 0) INTO total_monthly
    FROM fixed_costs 
    WHERE user_id = user_uuid;
    
    -- حساب التكلفة لكل منتج
    IF expected_sales > 0 THEN
        result := total_monthly / expected_sales;
    END IF;
    
    RETURN COALESCE(result, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_fixed_costs_user_id ON fixed_costs(user_id);
CREATE INDEX IF NOT EXISTS idx_fixed_costs_period ON fixed_costs(period);

-- 6. إنشاء محفز لتحديث updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_fixed_costs_updated_at ON fixed_costs;
CREATE TRIGGER update_fixed_costs_updated_at
    BEFORE UPDATE ON fixed_costs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. إدراج بيانات تجريبية للاختبار (اختياري)
-- يمكن حذف هذا القسم إذا لم تكن تريد بيانات تجريبية

SELECT 'تم إصلاح نظام التكاليف الثابتة بنجاح' AS result;
