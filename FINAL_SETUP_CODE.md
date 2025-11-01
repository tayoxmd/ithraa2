# 🔗 الكود النهائي - إعداد النشر التلقائي مع ithraa2

## ✅ معلومات المشروع المحدثة

- **اسم المشروع:** ithraa2
- **GitHub Repository:** https://github.com/tayoxmd/ithraa2
- **الموقع:** https://in33.in (cPanel)
- **cPanel Username:** u2890132
- **المستودع في cPanel:** ithraa2

---

## 📋 الكود النهائي للنسخ

### 1️⃣ Post-Receive Hook في cPanel

**انسخ هذا الكود بالكامل والصقه في Post-Receive Hook في cPanel:**

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

**أين أضع هذا الكود؟**
1. cPanel → Git Version Control
2. انقر على مستودع `ithraa2`
3. انقر **Manage** أو **Settings**
4. ابحث عن **Post-Receive Hook**
5. الصق الكود أعلاه
6. انقر **Update** أو **Save**

---

### 2️⃣ إعداد Git في cPanel

**عند إنشاء المستودع في cPanel:**

- **Repository Path:** `ithraa2`
- **Repository URL:** `https://github.com/tayoxmd/ithraa2.git`

---

### 3️⃣ إعداد GitHub Secrets (للنشر عبر GitHub Actions)

**إذا كنت تريد استخدام GitHub Actions:**

اذهب إلى: https://github.com/tayoxmd/ithraa2/settings/secrets/actions

أضف Secrets التالية:

1. **CPANEL_USERNAME**
   - القيمة: `u2890132`

2. **CPANEL_PASSWORD**
   - القيمة: (كلمة مرور cPanel)

3. **CPANEL_HOST**
   - القيمة: `in33.in`

---

## 🚀 سير العمل بعد الإعداد

### عند كل تعديل:

```bash
# 1. عدل الملفات محلياً
# ... قم بالتعديلات ...

# 2. رفع إلى GitHub
git add .
git commit -m "تحديث"
git push origin main

# 3. ✅ سيتم النشر تلقائياً على cPanel بعد 30-60 ثانية!
```

---

## 📝 خطوات الإعداد الكاملة

### الخطوة 1: رفع المشروع إلى GitHub (إذا لم يكن مرفوعاً)

```bash
cd /Users/amani/Documents/GitHub/ithraa

# إضافة جميع الملفات
git add .

# Commit
git commit -m "الإصدار الأول - إعداد النشر التلقائي"

# رفع إلى GitHub
git push -u origin main
```

### الخطوة 2: إعداد Git في cPanel

1. سجل الدخول إلى cPanel: `https://in33.in:2083`
2. اذهب إلى **Git Version Control**
3. انقر **Create**
4. املأ:
   - **Repository Path:** `ithraa2`
   - **Repository URL:** `https://github.com/tayoxmd/ithraa2.git`
5. انقر **Create**

### الخطوة 3: إضافة Post-Receive Hook

1. في cPanel Git، انقر على `ithraa2`
2. انقر **Manage** أو **Settings**
3. ابحث عن **Post-Receive Hook**
4. **انسخ والصق الكود التالي:**

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

### الخطوة 4: اختبار النشر

```bash
# في المشروع المحلي
git add .
git commit -m "اختبار النشر التلقائي"
git push origin main

# انتظر 30-60 ثانية
# افتح https://in33.in
# ✅ التحديثات ستظهر!
```

---

## ✅ الكود جاهز للنسخ

**ملف:** `CPANEL_POST_RECEIVE_HOOK_ITHRAE2.txt` يحتوي على الكود جاهز للنسخ.

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
   - المستودع في cPanel: `~/ithraa2`
   - الموقع: `~/public_html/`

---

## 🎉 مبروك!

**بعد إعداد Hook مرة واحدة، كل `git push` سيقوم بتحديث الموقع تلقائياً!**

**لا حاجة لرفع يدوي بعد الآن!** 🚀

