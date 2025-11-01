# ⚡ إعداد سريع - النشر التلقائي (خطوة واحدة!)

## 🎯 الخطوة الوحيدة المطلوبة:

### في cPanel - إضافة Post-Receive Hook:

1. **سجل الدخول إلى cPanel:**
   ```
   https://in33.in:2083
   ```

2. **اذهب إلى Git Version Control**
   - ابحث عن **Git Version Control** في cPanel
   - أو **Files → Git Version Control**

3. **أنشئ مستودع جديد (إذا لم يكن موجوداً):**
   - انقر **Create**
   - **Repository Path:** `ithraa`
   - **Repository URL:** رابط GitHub الخاص بك
   - انقر **Create**

4. **أضف Post-Receive Hook:**
   - بعد إنشاء المستودع، انقر عليه
   - انقر **Manage** أو **Settings**
   - ابحث عن **Post-Receive Hook** أو **Post Receive Hook**
   - **انسخ والصق** المحتوى من ملف `CPANEL_POST_RECEIVE_HOOK.txt`:
   
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
   
   - انقر **Update** أو **Save**

5. **✅ جاهز!**

---

## 🚀 بعد ذلك - التحديث التلقائي:

### في كل مرة تريد تحديث الموقع:

```bash
# 1. عدل الملفات محلياً
# ... قم بالتعديلات ...

# 2. بناء المشروع (اختياري - يمكنك حذفه من Hook)
npm run build

# 3. رفع إلى GitHub
git add .
git commit -m "تحديث"
git push origin main
```

**🎉 سيتم التحديث تلقائياً على cPanel بعد 30-60 ثانية!**

---

## ⚠️ ملاحظة مهمة:

إذا كان **Node.js غير متوفر** في cPanel، استخدم هذا Hook بدلاً منه:

```bash
#!/bin/bash
cd ~/ithraa
git pull origin main
# البناء يتم محلياً، ثم ارفع dist فقط
echo "✅ تم سحب التحديثات. قم ببناء محلياً وارفع dist يدوياً"
```

**أو** استخدم GitHub Actions بدلاً من ذلك (انظر `AUTO_DEPLOY_SETUP.md`)

---

## ✅ التحقق من النشر:

بعد `git push`:
1. انتظر 30-60 ثانية
2. افتح `https://in33.in`
3. اضغط **Ctrl+F5** (تحديث قوي)
4. ✅ التحديثات ستظهر!

---

## 📝 مثال عملي:

```bash
# عدل ملف
nano src/pages/Index.tsx

# أضف التغييرات
git add src/pages/Index.tsx

# Commit
git commit -m "تحديث الصفحة الرئيسية"

# Push - سيتم النشر تلقائياً!
git push origin main

# انتظر 60 ثانية
# افتح https://in33.in
# ✅ التحديث ظهر!
```

---

**هذا كل شيء! بعد إعداد Hook مرة واحدة، كل شيء تلقائي!** 🎉

