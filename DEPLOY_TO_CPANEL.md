# دليل النشر على cPanel 🚀

## المتطلبات الأساسية
- حساب استضافة مع cPanel
- الوصول إلى cPanel File Manager أو FTP
- معرفة اسم المجال الخاص بك

---

## الطريقة 1: النشر عبر File Manager في cPanel (الأسهل) 📁

### الخطوة 1: بناء المشروع محلياً
```bash
npm run build
```
هذا سينشئ مجلد `dist` يحتوي على جميع الملفات الجاهزة للنشر.

### الخطوة 2: تحضير الملفات للنشر
1. افتح مجلد `dist` في المشروع
2. ضغط جميع الملفات في `dist` إلى ملف ZIP
   - على Mac: `cd dist && zip -r ../ithraa-build.zip .`
   - على Windows: انقر بزر الماوس الأيمن → Send to → Compressed folder

### الخطوة 3: رفع الملفات إلى cPanel
1. سجل الدخول إلى cPanel
2. افتح **File Manager**
3. اذهب إلى `public_html` (أو `public_html/اسم-المجلد` إذا كنت تستخدم مجلد فرعي)
4. احذف ملفات `index.html` القديمة إن وجدت
5. ارفع ملف ZIP
6. انقر بزر الماوس الأيمن على ZIP → **Extract**
7. تأكد من أن ملف `.htaccess` موجود في المجلد الرئيسي

### الخطوة 4: التحقق من النشر
افتح المتصفح واذهب إلى: `https://your-domain.com`

---

## الطريقة 2: النشر عبر FTP/SFTP 🔌

### الخطوة 1: بناء المشروع
```bash
npm run build
```

### الخطوة 2: استخدام FTP Client
استخدم برنامج مثل:
- **FileZilla** (مجاني)
- **WinSCP** (Windows)
- **Cyberduck** (Mac)
- **Transmit** (Mac)

### الخطوة 3: الاتصال
- **Host**: ftp.your-domain.com (أو عنوان IP المقدم من cPanel)
- **Username**: اسم المستخدم في cPanel
- **Password**: كلمة مرور cPanel
- **Port**: 21 (FTP) أو 22 (SFTP - موصى به)

### الخطوة 4: رفع الملفات
1. اذهب إلى `public_html` (أو المجلد الفرعي المحدد)
2. احذف الملفات القديمة
3. ارفع جميع محتويات مجلد `dist`
4. تأكد من رفع ملف `.htaccess`

---

## الطريقة 3: النشر عبر Git (الأكثر احترافية) 🎯

### الخطوة 1: إعداد Git في cPanel
1. افتح cPanel → **Git Version Control**
2. انقر **Create** لإنشاء مستودع جديد
3. أدخل:
   - **Repository Path**: `ithraa`
   - **Repository URL**: رابط GitHub الخاص بك
4. انقر **Create**

### الخطوة 2: إعداد Post-Receive Hook
في cPanel Git، أضف السكريبت التالي في **Post-Receive Hook**:

```bash
#!/bin/bash
cd ~/ithraa
npm install
npm run build
cp -r dist/* ~/public_html/
cp ~/ithraa/.htaccess ~/public_html/
```

### الخطوة 3: النشر التلقائي
عند كل `git push`:
```bash
git push origin main
```
سيتم البناء والنشر تلقائياً!

---

## الطريقة 4: استخدام Terminal في cPanel (للمستخدمين المتقدمين) 💻

### الخطوة 1: الوصول إلى Terminal
1. cPanel → **Terminal** (قد لا يكون متوفر في جميع الخوادم)
2. أو استخدم **SSH** إذا كان متاحاً

### الخطوة 2: استنساخ المشروع
```bash
cd ~
git clone https://github.com/your-username/ithraa.git
cd ithraa
```

### الخطوة 3: البناء والنشر
```bash
npm install
npm run build
cp -r dist/* ~/public_html/
cp .htaccess ~/public_html/
```

---

## إعدادات مهمة بعد النشر ⚙️

### 1. تحديث روابط Supabase (إن لزم الأمر)
إذا كنت تستخدم Supabase، تأكد من:
- إضافة النطاق الخاص بك إلى **Allowed Origins** في Supabase Dashboard
- تحديث **Redirect URLs** في إعدادات المصادقة

### 2. إعداد SSL Certificate
في cPanel:
1. اذهب إلى **SSL/TLS Status**
2. تأكد من تفعيل SSL للنطاق
3. استخدم **Let's Encrypt** للحصول على شهادة مجانية

### 3. إعداد Custom Domain (إن لزم الأمر)
1. cPanel → **Addon Domains** أو **Subdomains**
2. أضف النطاق الفرعي أو النطاق المخصص

---

## استكشاف الأخطاء 🔧

### المشكلة: الصفحة بيضاء
**الحل**:
1. تأكد من رفع ملف `.htaccess`
2. تحقق من أن جميع الملفات في `dist` تم رفعها
3. تحقق من Console في المتصفح للأخطاء

### المشكلة: الخطأ 404 للصفحات
**الحل**:
- تأكد من وجود ملف `.htaccess` في المجلد الرئيسي
- تأكد من أن Apache `mod_rewrite` مفعل في cPanel

### المشكلة: الأيقونات والصور لا تظهر
**الحل**:
- تأكد من رفع مجلد `assets` كاملاً
- تحقق من المسارات في ملفات HTML/JS

### المشكلة: بطء التحميل
**الحل**:
- تفعيل Gzip Compression في cPanel
- تأكد من أن `.htaccess` يحتوي على إعدادات التخزين المؤقت

---

## نصائح مهمة 💡

1. **احتفظ بنسخة احتياطية**: دائماً احتفظ بنسخة من `dist` قبل النشر
2. **اختبر محلياً أولاً**: استخدم `npm run preview` لاختبار البناء
3. **راقب الأخطاء**: استخدم Browser DevTools لمراقبة الأخطاء
4. **تحديثات آمنة**: قم ببناء ونشر التحديثات في ساعات غير الذروة

---

## الأوامر السريعة 📝

```bash
# بناء المشروع
npm run build

# معاينة البناء محلياً
npm run preview

# فحص حجم البناء
du -sh dist

# ضغط الملفات للنشر
cd dist && zip -r ../ithraa-build.zip .
```

---

## الدعم والمساعدة 🆘

إذا واجهت أي مشاكل:
1. تحقق من سجلات الأخطاء في cPanel → **Error Log**
2. راجع Console في المتصفح
3. تأكد من أن جميع المتطلبات مثبتة

**تم التحديث**: آخر تحديث - $(date)
