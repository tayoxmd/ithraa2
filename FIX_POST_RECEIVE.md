# 🔧 تصحيح ملف post-receive في cPanel

## ❌ المشكلة:

المسار في ملف `post-receive` غير صحيح:
- ❌ الحالي: `~/ithraa2`
- ✅ يجب أن يكون: `/var/www/u2890132/repositories/ithraa2`

---

## ✅ الحل السريع:

### في File Manager في cPanel:

1. **اذهب إلى:**
   ```
   repositories/ithraa2/.git/hooks/
   ```

2. **انقر على ملف `post-receive`**

3. **انقر Edit**

4. **استبدل المحتوى بالكامل بهذا:**

```bash
#!/bin/bash

# Post-Receive Hook للنشر التلقائي إلى cPanel
# يتم تشغيله تلقائياً عند git push

echo "🚀 بدء النشر التلقائي..."

# الانتقال إلى مجلد المشروع (المسار الصحيح في cPanel)
cd /var/www/u2890132/repositories/ithraa2 || exit 1

# سحب آخر التحديثات
git pull origin main

# تثبيت التبعيات (إذا لزم الأمر)
if [ -f "package.json" ]; then
    echo "📦 تثبيت التبعيات..."
    npm install --production=false
    
    echo "🔨 بناء المشروع..."
    npm run build
    
    # نسخ الملفات إلى public_html
    if [ -d "dist" ]; then
        echo "📤 رفع الملفات..."
        cp -r dist/* /home/u2890132/public_html/
        cp .htaccess /home/u2890132/public_html/ 2>/dev/null || true
        
        echo "✅ تم النشر بنجاح!"
    else
        echo "❌ فشل البناء - مجلد dist غير موجود"
        exit 1
    fi
else
    echo "⚠️  package.json غير موجود"
    exit 1
fi
```

5. **احفظ الملف**

6. **✅ جاهز!**

---

## 🎯 بعد التصحيح:

### عند كل `git push`:

```bash
git add .
git commit -m "تحديث"
git push origin main
```

**✅ سيتم النشر تلقائياً على cPanel!**

---

## ⚠️ إذا كان Node.js غير متوفر في cPanel:

استخدم هذا المحتوى بدلاً منه:

```bash
#!/bin/bash
cd /var/www/u2890132/repositories/ithraa2
git pull origin main
echo "✅ تم سحب التحديثات - قم ببناء محلياً وارفع dist"
```

---

## 📋 ملخص التغييرات:

**المسارات المحدثة:**
- ❌ `~/ithraa2` → ✅ `/var/www/u2890132/repositories/ithraa2`
- ❌ `~/public_html/` → ✅ `/home/u2890132/public_html/`

---

**الكود الصحيح جاهز في ملف:** `CPANEL_POST_RECEIVE_FIXED.txt` 🚀

