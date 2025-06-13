-- إضافة عمود product_type إلى جدول pricings
ALTER TABLE pricings 
ADD COLUMN IF NOT EXISTS product_type TEXT DEFAULT 'abaya' 
CHECK (product_type IN ('abaya', 'regular'));

-- تحديث البيانات الموجودة لتكون من نوع عباية
UPDATE pricings 
SET product_type = 'abaya' 
WHERE product_type IS NULL;

-- إضافة فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_pricings_product_type ON pricings(product_type);

-- التأكد من وجود العمود
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'pricings' AND column_name = 'product_type';
