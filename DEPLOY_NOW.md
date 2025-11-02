# 🚀 نشر الموقع إلى cPanel - الآن!

## ✅ الخطوات الفورية:

### 1️⃣ بناء المشروع

افتح Terminal واكتب:

```bash
cd /Users/amani/Documents/GitHub/ithraa
npm run build
```

انتظر حتى يكتمل البناء (دقيقة أو دقيقتين)

---

### 2️⃣ رفع التغييرات إلى GitHub

```bash
git add .
git commit -m "تحديثات وإصلاحات - $(date +%Y-%m-%d-%H%M)"
git push origin main
```

---

### 3️⃣ النشر في cPanel

#### الطريقة التلقائية (موصى به):

1. **سجل الدخول إلى cPanel:**
   - رابط: `https://in33.in:2083`
   - أو `https://cpanel.in33.in`

2. **اذهب إلى Git Version Control**

3. **اختر المستودع `ithraa2`**

4. **انقر "Pull or Deploy"**

5. **انقر "Update from Remote"**
   - انتظر حتى يظهر: "Successfully updated"

6. **انقر "Deploy HEAD Commit"**
   - انتظر حتى يظهر: "Successfully deployed"

7. ✅ **تم!** افتح: `https://in33.in`

---

#### الطريقة اليدوية (إذا فشل التلقائي):

1. **في cPanel File Manager:**
   - اذهب إلى `public_html`
   - احذف جميع الملفات القديمة

2. **ارفع محتويات dist:**
   - من مجلد `dist` في مشروعك
   - ارفع جميع الملفات والمجلدات
   - تأكد من رفع `index.html` و `assets/`

3. **ارفع `.htaccess`:**
   - ارفع ملف `.htaccess` من جذر المشروع

4. ✅ **تم!**

---

## 📋 معلومات مهمة:

- **النطاق:** https://in33.in
- **cPanel:** https://in33.in:2083
- **اسم المستخدم:** u2890132
- **مجلد النشر:** public_html

---

## 🔍 التحقق من النشر:

بعد النشر، تحقق من:
- [ ] الموقع يفتح بدون أخطاء
- [ ] الصفحة الرئيسية تعمل
- [ ] الصور تظهر بشكل صحيح
- [ ] البحث يعمل
- [ ] لا توجد أخطاء في Console (F12)

---

**جاهز للنشر! 🚀**

