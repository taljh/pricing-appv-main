-- إضافة البند الأساسي للتكاليف الثابتة

-- إدراج اشتراك المتجر الإلكتروني كبند أساسي لجميع المستخدمين
INSERT INTO fixed_costs (id, user_id, name, amount, period, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    auth.uid(),
    'اشتراك المتجر الإلكتروني',
    99.00,
    'monthly',
    NOW(),
    NOW()
WHERE auth.uid() IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM fixed_costs 
    WHERE user_id = auth.uid() 
    AND name = 'اشتراك المتجر الإلكتروني'
);

-- إنشاء وظيفة لإضافة البند الأساسي للمستخدمين الجدد
CREATE OR REPLACE FUNCTION add_default_fixed_costs()
RETURNS TRIGGER AS $$
BEGIN
    -- إضافة اشتراك المتجر الإلكتروني للمستخدم الجديد
    INSERT INTO fixed_costs (id, user_id, name, amount, period, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        NEW.id,
        'اشتراك المتجر الإلكتروني',
        99.00,
        'monthly',
        NOW(),
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء محفز لإضافة البنود الأساسية للمستخدمين الجدد
DROP TRIGGER IF EXISTS add_default_fixed_costs_trigger ON auth.users;
CREATE TRIGGER add_default_fixed_costs_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION add_default_fixed_costs();

SELECT 'تم إضافة البند الأساسي بنجاح' AS result;
