# 🚀 كيفية رفع .cpanel.yml إلى GitHub

## الطريقة 1: عبر Terminal (الأسهل)

```bash
cd /Users/amani/Documents/GitHub/ithraa

# إضافة الملف
git add .cpanel.yml

# Commit
git commit -m "إضافة ملف .cpanel.yml للنشر التلقائي"

# رفع إلى GitHub (سيطلب اسم المستخدم وكلمة المرور)
git push origin main
```

**ملاحظة:** إذا طلب اسم المستخدم وكلمة المرور:
- **Username:** `tayoxmd`
- **Password:** استخدم Personal Access Token (ليس كلمة المرور العادية)

---

## الطريقة 2: عبر GitHub Desktop

1. افتح GitHub Desktop
2. افتح المشروع `ithraa`
3. سيظهر `.cpanel.yml` كتغيير جديد
4. أدخل رسالة Commit: "إضافة ملف .cpanel.yml للنشر التلقائي"
5. انقر **Commit to main**
6. انقر **Push origin**

---

## الطريقة 3: عبر GitHub Website

1. اذهب إلى: https://github.com/tayoxmd/ithraa2
2. انقر **Add file** → **Create new file**
3. اسم الملف: `.cpanel.yml`
4. انسخ محتوى الملف من `ithraa/.cpanel.yml`
5. الصق المحتوى
6. انقر **Commit new file**

---

## الطريقة 4: باستخدام GitHub CLI

```bash
# تثبيت GitHub CLI (إذا لم يكن مثبتاً)
brew install gh

# تسجيل الدخول
gh auth login

# رفع الملفات
cd /Users/amani/Documents/GitHub/ithraa
git add .cpanel.yml
git commit -m "إضافة ملف .cpanel.yml"
git push origin main
```

---

## ✅ بعد رفع الملف

### في cPanel:

1. **Update from Remote**
   - انقر على زر "Update from Remote" في cPanel
   - انتظر حتى يكتمل السحب

2. **Deploy HEAD Commit**
   - بعد السحب، انقر "Deploy HEAD Commit"
   - سيتم النشر تلقائياً

3. **تحقق من النشر**
   - افتح `https://in33.in`
   - ✅ يجب أن يعمل الآن!

---

## 📋 محتوى ملف .cpanel.yml (للنسخ)

إذا كنت ستستخدم الطريقة 3 (GitHub Website)، انسخ هذا:

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

---

## 🔧 إذا كان لديك مشكلة في المصادقة

### إنشاء Personal Access Token:

1. اذهب إلى: https://github.com/settings/tokens
2. انقر **Generate new token (classic)**
3. أعطه اسم: `cpanel-deploy`
4. اختر الصلاحيات: `repo`
5. انقر **Generate token**
6. انسخ Token

### استخدام Token:

```bash
# عند git push، استخدم Token ككلمة مرور
git push origin main
# Username: tayoxmd
# Password: [الصق Token هنا]
```

---

**اختر الطريقة الأسهل لك!** 🚀

