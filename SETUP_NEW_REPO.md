# 🔗 إعداد الربط مع GitHub الجديد

## ✅ معلومات المشروع

- **اسم المشروع:** ithraa2
- **GitHub Repository:** https://github.com/tayoxmd/ithraa2
- **الموقع:** https://in33.in (cPanel)
- **cPanel Username:** u2890132
- **المستودع في cPanel:** ithraa2

---

## 🚀 خطوات الإعداد الكاملة

### 1️⃣ رفع المشروع إلى GitHub (إذا لم يكن مرفوعاً)

```bash
cd /Users/amani/Documents/GitHub/ithraa

# إضافة جميع الملفات
git add .

# Commit
git commit -m "الإصدار الأول - إعداد النشر التلقائي"

# رفع إلى GitHub
git push -u origin main
```

---

### 2️⃣ إعداد Git في cPanel

1. **سجل الدخول إلى cPanel:**
   ```
   https://in33.in:2083
   ```

2. **اذهب إلى Git Version Control**

3. **إنشاء مستودع جديد:**
   - انقر **Create**
   - **Repository Path:** `ithraa2`
   - **Repository URL:** `https://github.com/tayoxmd/ithraa2.git`
   - انقر **Create**

---

### 3️⃣ إضافة Post-Receive Hook في cPanel

بعد إنشاء المستودع في cPanel:

1. انقر على المستودع `ithraa2`
2. انقر **Manage** أو **Settings**
3. ابحث عن **Post-Receive Hook**
4. انسخ والصق السكريبت التالي:

```bash
#!/bin/bash
cd ~/ithraa2
git pull origin main
npm install
npm run build
cp -r dist/* ~/public_html/
cp .htaccess ~/public_html/
echo "✅ تم التحديث بنجاح في $(date)"
```

5. انقر **Update** أو **Save**

---

### 4️⃣ إعداد GitHub Secrets (للنشر التلقائي)

إذا كنت تريد استخدام GitHub Actions:

1. اذهب إلى: https://github.com/tayoxmd/ithraa2/settings/secrets/actions
2. انقر **New repository secret**
3. أضف Secrets التالية:

   - **CPANEL_USERNAME** = `u2890132`
   - **CPANEL_PASSWORD** = (كلمة مرور cPanel)
   - **CPANEL_HOST** = `in33.in`

---

## ✅ التحقق من الإعداد

### اختبار النشر التلقائي:

```bash
# 1. عدل ملف
nano src/pages/Index.tsx

# 2. أضف التغييرات
git add .

# 3. Commit
git commit -m "تحديث تجريبي"

# 4. Push - سيتم النشر تلقائياً!
git push origin main
```

**انتظر 30-60 ثانية ثم افتح:**
```
https://in33.in
```

---

## 📋 الملفات المحدثة

تم تحديث الملفات التالية للمشروع الجديد:

- ✅ `.github/workflows/deploy-to-cpanel.yml` - GitHub Actions
- ✅ `CPANEL_POST_RECEIVE_HOOK.txt` - Hook للسكريبت
- ✅ `deploy-cpanel.sh` - سكريبت النشر

---

## 🎯 سير العمل بعد الإعداد

### عند كل تعديل:

```bash
# 1. عدل الملفات محلياً
# ... قم بالتعديلات ...

# 2. رفع إلى GitHub
git add .
git commit -m "تحديث"
git push origin main

# 3. ✅ سيتم النشر تلقائياً على cPanel!
```

**لا حاجة لرفع يدوي بعد الآن!** 🎉

---

## ⚠️ ملاحظات مهمة

1. **اسم المستودع في cPanel:**
   - تأكد من أنه `ithraa2` (وليس `ithraa`)
   - هذا مهم جداً في Post-Receive Hook

2. **Node.js في cPanel:**
   - إذا لم يكن متوفراً، استخدم هذا Hook بدلاً منه:
   ```bash
   #!/bin/bash
   cd ~/ithraa2
   git pull origin main
   echo "✅ تم سحب التحديثات - قم ببناء محلياً وارفع dist"
   ```

3. **التحقق من المسارات:**
   - المستودع: `~/ithraa2`
   - الموقع: `~/public_html/`

---

## 🔍 استكشاف الأخطاء

### المشكلة: Git Pull يفشل

**الحل:**
- تأكد من أن GitHub Repository موجود
- تحقق من الصلاحيات في cPanel
- راجع Error Log في cPanel

### المشكلة: البناء يفشل

**الحل:**
- تأكد من تثبيت Node.js في cPanel
- أو استخدم البناء المحلي وارفع `dist` فقط

---

## ✅ جاهز!

بعد إعداد Hook مرة واحدة، كل `git push` سيقوم بتحديث الموقع تلقائياً!

**مبروك! 🎉**

