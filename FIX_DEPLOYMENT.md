# 🔧 حل مشاكل النشر - دليل شامل

## ❌ المشاكل الشائعة وحلولها

---

## 1️⃣ مشكلة: لا يمكن تنفيذ الأوامر في Terminal

### الحل:

#### الطريقة 1: استخدام GitHub Desktop (الأسهل)
1. افتح **GitHub Desktop**
2. اكتب رسالة الـ commit في الحقل
3. انقر **Commit to main**
4. انقر **Push origin**

#### الطريقة 2: استخدام Terminal مباشرة
```bash
# افتح Terminal
cd /Users/amani/Documents/GitHub/ithraa

# رفع التغييرات
git add .
git commit -m "تحديثات النشر"
git push origin main
```

#### الطريقة 3: استخدام سكريبت جاهز
```bash
# شغل السكريبت:
./DEPLOY.sh
```

---

## 2️⃣ مشكلة: الأخطاء في النشر على cPanel

### التحقق من المشاكل:

#### ✅ الخطوة 1: التأكد من البناء المحلي
```bash
cd /Users/amani/Documents/GitHub/ithraa
npm run build
```

إذا نجح البناء → المشكلة في النشر
إذا فشل البناء → راجع الأخطاء أدناه

#### ✅ الخطوة 2: التحقق من ملف `.cpanel.yml`
```bash
cat .cpanel.yml
```

يجب أن يحتوي على:
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
```

#### ✅ الخطوة 3: النشر اليدوي (إذا فشل التلقائي)

**في cPanel:**

1. **File Manager** → افتح `public_html`
2. **احذف** جميع الملفات القديمة (احتفظ بنسخة احتياطية)
3. **من الكمبيوتر:**
   ```bash
   npm run build
   ```
4. **ارفع** محتويات مجلد `dist` إلى `public_html`
5. **ارفع** ملف `.htaccess` أيضاً

---

## 3️⃣ حل المشاكل الشائعة

### ❌ المشكلة: "npm: command not found" في cPanel

**الحل:**
```bash
# في cPanel Terminal أو SSH:
which node
which npm

# إذا لم تكن موجودة، استخدم المسار الكامل:
/usr/local/bin/npm install
/usr/local/bin/npm run build
```

### ❌ المشكلة: "Permission denied"

**الحل:**
```bash
# في cPanel Terminal:
chmod 755 /var/www/u2890132/repositories/ithraa2
chmod 755 /home/u2890132/public_html
```

### ❌ المشكلة: الموقع يعرض صفحة بيضاء

**الحل:**
1. تأكد من رفع ملف `.htaccess`
2. تأكد من رفع جميع ملفات `dist/assets`
3. افتح Console (F12) وراجع الأخطاء

### ❌ المشكلة: Routing لا يعمل (404)

**الحل:**
1. تأكد من وجود `.htaccess` في `public_html`
2. تأكد من محتوى `.htaccess` صحيح (سيتم إنشاؤه أدناه)

---

## 🚀 الحل السريع الموصى به

### استخدم هذا السكريبت:

```bash
# 1. بناء المشروع
npm run build

# 2. إنشاء ZIP جاهز
cd dist
zip -r ../ithraa-deploy.zip .
cd ..

# 3. الآن ارفع ithraa-deploy.zip إلى cPanel
# 4. استخرج في public_html
```

---

## 📝 ملف `.htaccess` الصحيح

سيتم إنشاء الملف الصحيح الآن...


