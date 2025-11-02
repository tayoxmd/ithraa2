# ✅ إعداد المستودع في cPanel - إرشادات التحقق

## 📋 معلومات المستودع الصحيحة

### ✅ المعلومات المطلوبة في cPanel:

1. **Repository Name:** `ithraa2`
2. **Repository Path:** `/var/www/u2890132/repositories/ithraa2`
3. **Remote URL:** `https://github.com/tayoxmd/ithraa2.git`
4. **Checked-Out Branch:** `main`

---

## 🔍 خطوات التحقق من الإعداد في cPanel

### 1. التحقق من اسم المستودع

1. سجل الدخول إلى cPanel: `https://in33.in:2083`
2. اذهب إلى **Git Version Control**
3. تأكد من أن اسم المستودع هو **`ithraa2`** (وليس `ithraa`)
4. إذا كان الاسم خاطئاً:
   - احذف المستودع القديم
   - أنشئ مستودع جديد باسم `ithraa2`
   - المسار: `/var/www/u2890132/repositories/ithraa2`
   - Remote URL: `https://github.com/tayoxmd/ithraa2.git`

---

### 2. التحقق من Post-Receive Hook

إذا كنت تستخدم Post-Receive Hook بدلاً من `.cpanel.yml`:

1. في cPanel Git، انقر على المستودع `ithraa2`
2. انقر **Manage** أو **Settings**
3. ابحث عن **Post-Receive Hook**
4. تأكد من أن الكود يحتوي على المسار الصحيح:

```bash
#!/bin/bash
cd /var/www/u2890132/repositories/ithraa2
git pull origin main
npm install
npm run build
cp -r dist/* /home/u2890132/public_html/
cp .htaccess /home/u2890132/public_html/
echo "✅ تم التحديث بنجاح في $(date)"
```

**⚠️ مهم:** تأكد من أن المسار في السطر الثاني هو `/var/www/u2890132/repositories/ithraa2` (وليس `ithraa`)

---

### 3. التحقق من `.cpanel.yml`

ملف `.cpanel.yml` موجود في المشروع ويحتوي على:

```yaml
---
deployment:
  tasks:
    - export DEPLOYPATH=/home/u2890132/public_html
    - /bin/bash -c "cd /var/www/u2890132/repositories/ithraa2 && git pull origin main || true"
    - /bin/bash -c "cd /var/www/u2890132/repositories/ithraa2 && npm install || true"
    - /bin/bash -c "cd /var/www/u2890132/repositories/ithraa2 && npm run build || true"
    - /bin/cp -rf /var/www/u2890132/repositories/ithraa2/dist/* $DEPLOYPATH/ || true
    - /bin/cp -f /var/www/u2890132/repositories/ithraa2/.htaccess $DEPLOYPATH/ || true
    - /bin/echo "✅ تم التحديث بنجاح في $(date)"
```

**✅ هذا الملف صحيح ويستخدم `ithraa2`**

---

## 🔧 خطوات إصلاح المشكلة

### إذا كان المستودع في cPanel باسم `ithraa` (بدون 2):

1. **في cPanel:**
   - اذهب إلى **Git Version Control**
   - احذف المستودع القديم `ithraa`
   - أنشئ مستودع جديد:
     - **Repository Name:** `ithraa2`
     - **Repository Path:** `ithraa2` (سيتم إنشاؤه تلقائياً في `/var/www/u2890132/repositories/ithraa2`)
     - **Repository URL:** `https://github.com/tayoxmd/ithraa2.git`
     - **Branch:** `main`

2. **بعد إنشاء المستودع:**
   - انقر **Pull or Deploy**
   - انقر **Update from Remote**
   - انتظر حتى يكتمل السحب

3. **للنشر:**
   - انقر **Deploy HEAD Commit**
   - أو استخدم Post-Receive Hook (الكود أعلاه)

---

## ✅ التحقق النهائي

بعد الإصلاح، تأكد من:

- [ ] اسم المستودع في cPanel: `ithraa2`
- [ ] Remote URL: `https://github.com/tayoxmd/ithraa2.git`
- [ ] المسار: `/var/www/u2890132/repositories/ithraa2`
- [ ] Post-Receive Hook (إن وجد) يستخدم المسار الصحيح
- [ ] ملف `.cpanel.yml` موجود في GitHub

---

## 🚀 بعد الإصلاح

1. ارفع التغييرات إلى GitHub:
```bash
git add .
git commit -m "تحديث إعدادات المستودع"
git push origin main
```

2. في cPanel:
   - انقر **Update from Remote**
   - انقر **Deploy HEAD Commit**

3. ✅ افتح الموقع: `https://in33.in`

---

## 📝 ملاحظات مهمة

- **اسم المجلد المحلي** يمكن أن يكون `ithraa` (هذا لا يهم)
- **اسم المستودع في cPanel** يجب أن يكون `ithraa2` (هذا مهم جداً!)
- **اسم المستودع في GitHub** هو `ithraa2` (صحيح)

**المشكلة عادة تكون في:** اسم المستودع في cPanel أو Post-Receive Hook يستخدم مسار خاطئ.

