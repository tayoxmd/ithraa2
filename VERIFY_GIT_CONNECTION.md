# ✅ التحقق من ربط المسار مع GitHub

## 📍 المسار المطلوب التحقق منه:

```
/var/www/u2890132/repositories/ithraa2
```

---

## ✅ الوضع الحالي:

### 1. **Git Remote (المحلي):**
```
✅ origin: https://github.com/tayoxmd/ithraa2.git
```

### 2. **ملف `.cpanel.yml`:**
```yaml
✅ يستخدم المسار: /var/www/u2890132/repositories/ithraa2
✅ يستخدم Remote: git pull origin main
```

### 3. **اسم المستودع:**
```
✅ GitHub: ithraa2
✅ cPanel يجب أن يكون: ithraa2
```

---

## 🔍 كيفية التحقق من الربط في cPanel:

### الخطوة 1: التحقق من إعدادات المستودع في cPanel

1. سجل الدخول إلى cPanel: `https://in33.in:2083`
2. اذهب إلى **Git Version Control**
3. انقر على المستودع `ithraa2`
4. تحقق من:

#### ✅ يجب أن يكون:
- **Repository Name:** `ithraa2`
- **Repository Path:** `/var/www/u2890132/repositories/ithraa2`
- **Remote URL:** `https://github.com/tayoxmd/ithraa2.git`
- **Checked-Out Branch:** `main`

---

### الخطوة 2: اختبار الربط

#### في cPanel:

1. انقر **Pull or Deploy**
2. انقر **Update from Remote**
3. إذا ظهرت رسالة نجاح → ✅ الربط صحيح
4. إذا ظهر خطأ → ❌ هناك مشكلة في الربط

---

### الخطوة 3: التحقق من Post-Receive Hook (إن وجد)

إذا كنت تستخدم Post-Receive Hook:

1. في cPanel Git، انقر **Manage** أو **Settings**
2. ابحث عن **Post-Receive Hook**
3. تأكد من أن الكود يحتوي على:

```bash
#!/bin/bash
cd /var/www/u2890132/repositories/ithraa2  # ✅ المسار الصحيح
git pull origin main                        # ✅ من GitHub
```

---

## 🔧 إصلاح المشاكل المحتملة:

### المشكلة 1: اسم المستودع في cPanel خاطئ

**إذا كان الاسم `ithraa` (بدون 2):**

1. احذف المستودع القديم
2. أنشئ مستودع جديد:
   - **Repository Name:** `ithraa2`
   - **Repository URL:** `https://github.com/tayoxmd/ithraa2.git`
   - **Branch:** `main`

---

### المشكلة 2: Remote URL خاطئ في cPanel

**إذا كان Remote URL مختلف:**

1. في cPanel Git، انقر **Manage**
2. ابحث عن **Remote URL** أو **Repository URL**
3. تأكد أنه: `https://github.com/tayoxmd/ithraa2.git`
4. إذا كان مختلفاً، عدله

---

### المشكلة 3: المسار في `.cpanel.yml` خاطئ

**الملف الحالي صحيح، لكن للتحقق:**

الملف موجود في: `.cpanel.yml`

المحتوى الحالي:
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

✅ **هذا صحيح ويستخدم المسار الصحيح**

---

## ✅ الخلاصة:

| العنصر | القيمة | الحالة |
|--------|--------|--------|
| **GitHub Repository** | `https://github.com/tayoxmd/ithraa2.git` | ✅ صحيح |
| **Local Git Remote** | `origin: https://github.com/tayoxmd/ithraa2.git` | ✅ صحيح |
| **cPanel Repository Path** | `/var/www/u2890132/repositories/ithraa2` | ✅ صحيح |
| **`.cpanel.yml` Path** | `/var/www/u2890132/repositories/ithraa2` | ✅ صحيح |
| **Repository Name** | `ithraa2` | ✅ صحيح |

---

## 🚀 اختبار الربط:

### اختبار سريع:

1. **في المشروع المحلي:**
```bash
cd /Users/amani/Documents/GitHub/ithraa
git add .
git commit -m "اختبار الربط"
git push origin main
```

2. **في cPanel:**
   - انقر **Update from Remote**
   - إذا ظهرت رسالة نجاح → ✅ الربط يعمل
   - انقر **Deploy HEAD Commit**

3. **افتح الموقع:**
   - https://in33.in
   - إذا ظهرت التحديثات → ✅ كل شيء يعمل!

---

## 📝 ملاحظات مهمة:

- **المسار `/var/www/u2890132/repositories/ithraa2`** هو المسار على خادم cPanel، وليس على GitHub
- **GitHub** يحتوي على الكود فقط
- **cPanel** يسحب الكود من GitHub إلى المسار `/var/www/u2890132/repositories/ithraa2`
- الربط يعمل عبر **Remote URL** في إعدادات Git في cPanel

**كل شيء يبدو صحيحاً! ✅**

