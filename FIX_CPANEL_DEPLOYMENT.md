# 🔧 حل مشكلة النشر في cPanel

## ❌ المشكلة

cPanel يعرض خطأ: **"The system cannot deploy"**

المتطلبات:
1. ✅ A checked-out branch or working tree exists
2. ❌ A valid .cpanel.yml file exists
3. ✅ No uncommitted changes exist

---

## ✅ الحل: إضافة ملف `.cpanel.yml`

### الخطوة 1: إنشاء ملف `.cpanel.yml` في المشروع

تم إنشاء الملف في المشروع! الآن:

```bash
# تأكد من وجود الملف
ls -la .cpanel.yml
```

### الخطوة 2: رفع الملف إلى GitHub

```bash
cd /Users/amani/Documents/GitHub/ithraa

# إضافة ملف .cpanel.yml
git add .cpanel.yml

# Commit
git commit -m "إضافة ملف .cpanel.yml للنشر التلقائي"

# رفع إلى GitHub
git push origin main
```

### الخطوة 3: في cPanel - سحب التحديثات

1. في cPanel Git، انقر على المستودع `ithraa2`
2. انقر **Pull or Deploy**
3. انقر **Update from Remote**
4. انتظر حتى يكتمل السحب

### الخطوة 4: النشر

بعد سحب التحديثات:

1. تأكد من ظهور ملف `.cpanel.yml` في المعلومات
2. انقر **Deploy HEAD Commit**
3. انتظر حتى يكتمل النشر
4. ✅ تم!

---

## 📋 محتوى ملف `.cpanel.yml`

الملف يحتوي على:

```yaml
---
deployment:
  tasks:
    - /bin/bash -c "cd /var/www/u2890132/repositories/ithraa2 && git pull origin main"
    - /bin/bash -c "cd /var/www/u2890132/repositories/ithraa2 && npm install"
    - /bin/bash -c "cd /var/www/u2890132/repositories/ithraa2 && npm run build"
    - /bin/cp -rf /var/www/u2890132/repositories/ithraa2/dist/* /home/u2890132/public_html/"
    - /bin/cp -f /var/www/u2890132/repositories/ithraa2/.htaccess /home/u2890132/public_html/"
```

---

## 🔄 طريقة بديلة: Post-Receive Hook (إذا لم يعمل .cpanel.yml)

إذا كان `.cpanel.yml` لا يعمل، استخدم **Post-Receive Hook**:

### في cPanel:

1. اذهب إلى **Manage Repository**
2. ابحث عن **Post-Receive Hook** (ليس في تبويب Pull or Deploy)
3. الصق السكريبت:

```bash
#!/bin/bash
cd /var/www/u2890132/repositories/ithraa2
git pull origin main
npm install
npm run build
cp -r dist/* /home/u2890132/public_html/
cp .htaccess /home/u2890132/public_html/
echo "✅ تم التحديث بنجاح"
```

4. انقر **Update**

---

## ✅ التحقق من النشر

بعد إضافة `.cpanel.yml` ورفعه:

1. في cPanel، انقر **Update from Remote**
2. ثم انقر **Deploy HEAD Commit**
3. انتظر رسالة النجاح
4. افتح `https://in33.in`
5. ✅ تم!

---

## 🔍 استكشاف الأخطاء

### الخطأ: "npm: command not found"

**الحل:**
- Node.js غير مثبت في cPanel
- استخدم البناء المحلي ثم ارفع `dist` فقط
- أو ثبت Node.js في cPanel

### الخطأ: "Permission denied"

**الحل:**
- تأكد من صلاحيات المجلدات:
```bash
chmod 755 /var/www/u2890132/repositories/ithraa2
chmod 755 /home/u2890132/public_html
```

### الخطأ: ".cpanel.yml not found"

**الحل:**
- تأكد من رفع الملف إلى GitHub
- انقر **Update from Remote** في cPanel
- تحقق من وجود الملف في Repository Path

---

## 🎯 الحل السريع

**الأسهل والأسرع:**

1. **ارفع `.cpanel.yml` إلى GitHub:**
   ```bash
   git add .cpanel.yml
   git commit -m "إضافة .cpanel.yml"
   git push origin main
   ```

2. **في cPanel:**
   - انقر **Update from Remote**
   - انقر **Deploy HEAD Commit**
   - ✅ جاهز!

---

**تم إنشاء ملف `.cpanel.yml` جاهز للاستخدام!** 🚀

