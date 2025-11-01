# 🚀 إعداد النشر التلقائي إلى cPanel

## ✅ ما الذي تم إعداده؟

تم إنشاء نظام نشر تلقائي - عند كل `git push`، سيتم تحديث الموقع على cPanel تلقائياً!

**لا حاجة لرفع يدوي بعد الآن!** 🎉

---

## 🎯 الطريقة الأفضل والأسهل: Git Hook في cPanel

### ⚡ خطوات الإعداد (5 دقائق):

#### 1️⃣ إعداد Git في cPanel

1. سجل الدخول إلى cPanel: `https://in33.in:2083`
2. اذهب إلى **Git Version Control**
3. انقر **Create**
4. املأ:
   - **Repository Path:** `ithraa`
   - **Repository URL:** رابط GitHub الخاص بك
     ```
     https://github.com/YOUR_USERNAME/YOUR_REPO.git
     ```
5. انقر **Create**

#### 2️⃣ إضافة Post-Receive Hook

بعد إنشاء المستودع:

1. في cPanel Git، انقر على `ithraa`
2. انقر **Manage** أو **Settings**
3. ابحث عن **Post-Receive Hook**
4. الصق السكريبت التالي:

```bash
#!/bin/bash
cd ~/ithraa
git pull origin main
npm install
npm run build
cp -r dist/* ~/public_html/
cp .htaccess ~/public_html/
echo "✅ تم التحديث بنجاح في $(date)"
```

5. انقر **Update** أو **Save**

#### 3️⃣ اختبار النشر

في مشروعك المحلي:

```bash
# 1. إضافة التغييرات
git add .

# 2. عمل commit
git commit -m "تحديث تلقائي"

# 3. رفع إلى GitHub
git push origin main
```

**🎉 سيتم النشر تلقائياً على cPanel!**

افتح الموقع بعد 30 ثانية: `https://in33.in`

---

## 🔧 إعداد إضافي (اختياري)

### إعداد SSH Key للأمان

1. **إنشاء SSH Key محلياً:**
   ```bash
   ssh-keygen -t rsa -b 4096 -C "cpanel-deploy"
   ```

2. **نسخ المفتاح العام:**
   ```bash
   cat ~/.ssh/id_rsa.pub
   ```

3. **إضافته في cPanel:**
   - cPanel → **SSH Access** → **Manage SSH Keys**
   - **Import Key**
   - الصق المفتاح
   - **Authorize**

---

## 📋 طريقة بديلة: GitHub Actions

إذا كنت تريد استخدام GitHub Actions (أكثر احترافية):

### الخطوة 1: إضافة Secrets في GitHub

1. اذهب إلى GitHub Repository
2. **Settings → Secrets and variables → Actions → New repository secret**
3. أضف:
   - `CPANEL_USERNAME` = `u2890132`
   - `CPANEL_PASSWORD` = (كلمة مرور cPanel)
   - `CPANEL_HOST` = `in33.in`

### الخطوة 2: الملف جاهز!

تم إنشاء `.github/workflows/deploy-to-cpanel.yml`

**عند كل push، سيتم النشر تلقائياً!**

---

## 🚀 استخدام السكريبت المحلي (للمحترفين)

### تشغيل السكريبت مباشرة:

```bash
# جعل السكريبت قابل للتنفيذ
chmod +x deploy-cpanel.sh

# تشغيله
./deploy-cpanel.sh
```

---

## ✅ التحقق من النشر

بعد `git push`:

1. انتظر 30-60 ثانية
2. افتح `https://in33.in`
3. **Ctrl+F5** لتحديث الصفحة
4. ✅ التحديثات ستظهر!

---

## 🔍 استكشاف الأخطاء

### ❌ المشكلة: Hook لا يعمل

**الحل:**
- تأكد من الصلاحيات في cPanel
- تحقق من المسارات صحيحة
- راجع Error Log في cPanel

### ❌ المشكلة: البناء يفشل

**الحل:**
- تأكد من تثبيت Node.js في cPanel
- تحقق من `package.json` موجود

### ❌ المشكلة: الملفات لا ترفع

**الحل:**
- تحقق من المسار: `~/public_html`
- تأكد من الصلاحيات على المجلدات

---

## 📝 ملاحظات مهمة

1. **Node.js مطلوب في cPanel**
   - تأكد من تثبيت Node.js في cPanel
   - أو استخدم البناء محلياً وارفع `dist` فقط

2. **التحقق من الصلاحيات**
   ```bash
   chmod 755 ~/public_html
   chmod 644 ~/public_html/.htaccess
   ```

3. **النسخة الاحتياطية**
   - احتفظ بنسخة احتياطية قبل التحديثات الكبيرة
   - يمكنك استخدام `git tag` للإصدارات

---

## 🎉 الخلاصة

### الآن:

**عند كل تعديل:**
```bash
git add .
git commit -m "تحديث"
git push origin main
```

**✅ سيتم النشر تلقائياً على cPanel!**

**لا حاجة لرفع يدوي بعد الآن!** 🚀

---

## 📞 الدعم

إذا واجهت أي مشكلة:
1. راجع `CPANEL_GIT_HOOK.md` للتفاصيل
2. تحقق من Error Log في cPanel
3. تأكد من جميع الخطوات تمت بشكل صحيح

**تم التحديث:** آخر تحديث - $(date)

