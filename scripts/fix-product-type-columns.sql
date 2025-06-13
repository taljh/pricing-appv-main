-- إضافة عمود product_type إلى جدول pricings إذا لم يكن موجوداً
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'pricings'
        AND column_name = 'product_type'
    ) THEN
        ALTER TABLE pricings ADD COLUMN product_type text DEFAULT 'abaya';
    END IF;
END $$;

-- إضافة عمود product_type إلى جدول products إذا لم يكن موجوداً
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'products'
        AND column_name = 'product_type'
    ) THEN
        ALTER TABLE products ADD COLUMN product_type text DEFAULT 'abaya';
    END IF;
END $$;

-- تحديث RLS للسماح بتحديث عمود product_type
DROP POLICY IF EXISTS pricings_policy ON pricings;
CREATE POLICY pricings_policy ON pricings
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS products_policy ON products;
CREATE POLICY products_policy ON products
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
