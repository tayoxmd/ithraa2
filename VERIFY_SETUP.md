# ✅ التحقق من الإعداد - بناءً على الصور

## 📊 الوضع الحالي:

### ✅ ما هو صحيح:
1. ✅ المستودع موجود في cPanel: `/var/www/u2890132/repositories/ithraa2`
2. ✅ Remote URL صحيح: `https://github.com/tayoxmd/ithraa2.git`
3. ✅ ملف `post-receive` موجود في `.git/hooks`
4. ✅ Checked-out branch موجود
5. ✅ No uncommitted changes

### ❌ المشكلة:
❌ ملف `.cpanel.yml` غير موجود في المستودع

---

## 🔧 الحل: خياران

### الخيار 1: إضافة `.cpanel.yml` (للنشر عبر cPanel Deploy)

**خطوات:**

1. **في GitHub - إنشاء الملف:**
   - اذهب إلى: https://github.com/tayoxmd/ithraa2
   - انقر **Add file** → **Create new file**
   - اسم الملف: `.cpanel.yml`
   - انسخ هذا المحتوى:

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

   - انقر **Commit new file**

2. **في cPanel:**
   - انقر **Update from Remote**
   - انتظر حتى يكتمل السحب
   - انقر **Deploy HEAD Commit**

---

### الخيار 2: استخدام Post-Receive Hook (أسهل - موصى به!)

**ملاحظة:** ملف `post-receive` موجود بالفعل في `/var/www/u2890132/repositories/ithraa2/.git/hooks/`

**خطوات:**

1. **في File Manager في cPanel:**
   - اذهب إلى: `repositories/ithraa2/.git/hooks/`
   - انقر على ملف `post-receive`
   - انقر **Edit**

2. **استبدل المحتوى بهذا:**

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

3. **احفظ الملف**

4. **في Terminal في cPanel (اختياري):**
   ```bash
   chmod +x /var/www/u2890132/repositories/ithraa2/.git/hooks/post-receive
   ```

5. **✅ جاهز!**

**الآن عند كل `git push`، سيتم النشر تلقائياً!**

---

## 🎯 التوصية: الخيار 2 (Post-Receive Hook)

**لماذا؟**
- ✅ أسهل - فقط تعديل ملف واحد في cPanel
- ✅ يعمل تلقائياً مع كل `git push`
- ✅ لا حاجة لـ `.cpanel.yml`
- ✅ الملف موجود بالفعل!

---

## 📝 خطوات سريعة للخيار 2:

1. **في File Manager:**
   - اذهب إلى `repositories/ithraa2/.git/hooks/`
   - انقر **Edit** على `post-receive`

2. **استبدل المحتوى بالكود أعلاه**

3. **احفظ**

4. **✅ جاهز!**

**الآن عند كل `git push` → تحديث تلقائي!**

---

## ✅ التحقق من النشر:

بعد تعديل `post-receive`:

```bash
# في المشروع المحلي
git add .
git commit -m "اختبار النشر التلقائي"
git push origin main
```

**سيتم النشر تلقائياً على cPanel!**

---

## 🔍 ملاحظة مهمة:

إذا كان **Node.js غير متوفر** في cPanel، استخدم هذا المحتوى بدلاً منه:

```bash
#!/bin/bash
cd /var/www/u2890132/repositories/ithraa2
git pull origin main
echo "✅ تم سحب التحديثات - قم ببناء محلياً وارفع dist"
```

---

**الخيار 2 (Post-Receive Hook) هو الأسهل والأسرع!** 🚀

