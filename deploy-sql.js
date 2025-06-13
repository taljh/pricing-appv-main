// Script لتنفيذ ملفات SQL مباشرة في قاعدة بيانات Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// استخدام معلومات الاتصال من متغيرات البيئة
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('خطأ: متغيرات البيئة NEXT_PUBLIC_SUPABASE_URL و SUPABASE_SERVICE_KEY غير متوفرة');
  console.error('يرجى التأكد من وجود ملف .env يحتوي على المتغيرات المطلوبة');
  process.exit(1);
}

// إنشاء عميل Supabase باستخدام معلومات الاتصال
console.log(`جاري الاتصال بقاعدة البيانات: ${supabaseUrl}`);
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

// وظيفة لتنفيذ استعلام SQL كامل (يُستخدم مع supabase.rpc إذا كان متاحًا)
async function executeRawQuery(sql) {
  try {
    // تنفيذ الاستعلام من خلال واجهة برمجة التطبيقات العامة
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // إذا فشلت الطريقة الأولى (قد لا تكون دالة exec_sql متاحة)، نستخدم طريقة REST
      console.warn('فشل تنفيذ الاستعلام باستخدام rpc، محاولة استخدام REST API');
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({ sql_query: sql })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`فشل استعلام REST: ${errorText}`);
      }
      
      return await response.json();
    }
    
    return data;
  } catch (error) {
    console.error(`خطأ في تنفيذ الاستعلام: ${error.message}`);
    throw error;
  }
}

// وظيفة لتنفيذ ملف SQL كامل
async function runSqlFile(filePath) {
  try {
    // قراءة محتوى الملف
    console.log(`جاري قراءة الملف: ${filePath}`);
    const sqlContent = fs.readFileSync(path.resolve(filePath), 'utf8');
    
    // تقسيم المحتوى إلى استعلامات منفصلة
    // يفصل بين الاستعلامات على أساس ";" ويتجاهل الفواصل المنقوطة داخل النصوص المحاطة بعلامات اقتباس
    const commands = [];
    let currentCommand = '';
    let inString = false;
    let stringMarker = '';
    
    for (let i = 0; i < sqlContent.length; i++) {
      const char = sqlContent[i];
      const nextChar = sqlContent[i + 1] || '';
      
      // التعامل مع النصوص المحاطة بعلامات اقتباس
      if ((char === "'" || char === '"') && sqlContent[i - 1] !== '\\') {
        if (!inString) {
          inString = true;
          stringMarker = char;
        } else if (char === stringMarker) {
          inString = false;
        }
      }
      
      // إضافة الحرف إلى الاستعلام الحالي
      currentCommand += char;
      
      // التعامل مع نهاية الاستعلام
      if (char === ';' && !inString) {
        if (currentCommand.trim()) {
          commands.push(currentCommand.trim());
        }
        currentCommand = '';
      }
    }
    
    // إضافة الاستعلام الأخير إذا كان موجوداً
    if (currentCommand.trim()) {
      commands.push(currentCommand.trim());
    }
    
    console.log(`تم العثور على ${commands.length} استعلام للتنفيذ`);
    
    // تنفيذ كل استعلام
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i].trim();
      if (command) {
        console.log(`جاري تنفيذ الاستعلام ${i + 1}/${commands.length}`);
        console.log('الاستعلام:', command.substring(0, 100) + (command.length > 100 ? '...' : ''));
        
        try {
          await executeRawQuery(command);
          console.log(`✅ تم تنفيذ الاستعلام ${i + 1} بنجاح`);
        } catch (error) {
          console.error(`❌ فشل تنفيذ الاستعلام ${i + 1}:`, error.message);
        }
      }
    }
    
    console.log('✅ تم تنفيذ جميع الاستعلامات بنجاح');
    return true;
  } catch (error) {
    console.error('❌ حدث خطأ أثناء تنفيذ الملف SQL:', error);
    return false;
  }
}

// التحقق من المعلمات وتنفيذ الملف المطلوب
const sqlFilePath = process.argv[2];
if (!sqlFilePath) {
  console.error('خطأ: يجب توفير مسار لملف SQL');
  console.error('الاستخدام: node deploy-sql.js path/to/sqlfile.sql');
  process.exit(1);
}

// تنفيذ الملف SQL
runSqlFile(sqlFilePath)
  .then(success => {
    if (success) {
      console.log('✅ تم تنفيذ الملف بنجاح!');
    } else {
      console.error('❌ فشل تنفيذ الملف');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('حدث خطأ غير متوقع:', error);
    process.exit(1);
  });
