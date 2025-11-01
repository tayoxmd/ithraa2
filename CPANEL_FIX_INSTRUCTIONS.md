# 🔧 حل مشكلة cPanel - خطأ 401 Unauthorized

## المشكلة:
cPanel يعرض خطأ **401 - Unauthorized** مما يعني أن الجلسة انتهت.

## الحل السريع:

### 1. تسجيل دخول جديد إلى cPanel
1. **اغلق جميع نوافذ cPanel**
2. **افتح cPanel من جديد**: `https://scp117.hosting.reg.ru:2083`
3. **سجل دخول مجدداً**
4. **اذهب إلى**: Git Version Control

### 2. التحقق من Git Repository

بعد تسجيل الدخول:
1. **اذهب إلى**: Git Version Control
2. **ابحث عن**: `ithraa2`
3. **انقر على**: "Manage" أو "إدارة"

### 3. نشر التحديثات يدوياً (اختياري)

إذا لم يعمل النشر التلقائي:
1. **انقر على**: "Pull or Deploy" tab
2. **انقر على**: "Update from Remote" (جلب التحديثات من GitHub)
3. **انتظر حتى ينتهي**
4. **انقر على**: "Deploy HEAD Commit" (نشر آخر commit)

---

## ✅ الحل الدائم:

### استخدام `.cpanel.yml` (موجود بالفعل)

`.cpanel.yml` موجود في المشروع وسيعمل تلقائياً عند:
- **رفع التغييرات إلى GitHub**
- **سحب التحديثات في cPanel**

### الخطوات:

1. **ارفع التغييرات إلى GitHub:**
   ```bash
   git add -A
   git commit -m "تحديث"
   git push origin main
   ```

2. **في cPanel:**
   - **Git Version Control** → **ithraa2** → **Pull or Deploy**
   - **انقر**: "Update from Remote"
   - سيتم النشر تلقائياً عبر `.cpanel.yml`

---

## 🚫 تم تعطيل GitHub Actions

- ✅ تم حذف `deploy-to-cpanel.yml`
- ✅ تم إنشاء ملف `disabled.yml` لمنع تشغيل Actions
- ✅ الآن `.cpanel.yml` هو الطريقة الوحيدة للنشر

---

**ملاحظة:** إذا استمرت المشكلة، حاول:
1. **مسح كاش المتصفح**
2. **تسجيل خروج ودخول جديد**
3. **استخدام متصفح آخر**

