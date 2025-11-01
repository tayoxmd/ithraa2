# 🔄 إعداد النشر التلقائي إلى cPanel

## الطريقة المفضلة: استخدام Git Hook في cPanel

هذه الطريقة الأسهل والأكثر موثوقية - تحديث تلقائي عند كل `git push`!

---

## 📋 الخطوات

### الخطوة 1: إعداد Git في cPanel

1. **سجل الدخول إلى cPanel**
   ```
   https://in33.in:2083
   ```

2. **اذهب إلى Git Version Control**
   - في cPanel، ابحث عن **Git Version Control**
   - أو اذهب إلى **Files → Git Version Control**

3. **إنشاء مستودع جديد**
   - انقر **Create**
   - **Repository Path:** `ithraa`
   - **Repository URL:** رابط GitHub الخاص بك
     ```
     https://github.com/YOUR_USERNAME/ithraa.git
     ```
   - انقر **Create**

### الخطوة 2: إعداد Post-Receive Hook

بعد إنشاء المستودع، أضف **Post-Receive Hook** التالي:

```bash
#!/bin/bash
cd ~/ithraa
git pull origin main
npm install
npm run build
cp -r dist/* ~/public_html/
cp .htaccess ~/public_html/
echo "✅ تم التحديث بنجاح!"
```

**كيفية إضافة Hook:**

1. في cPanel Git، انقر على المستودع `ithraa`
2. انقر **Manage**
3. في قسم **Post-Receive Hook**، الصق السكريبت أعلاه
4. انقر **Update**

### الخطوة 3: إعداد SSH Key (للأمان)

1. **إنشاء SSH Key محلياً:**
   ```bash
   ssh-keygen -t rsa -b 4096 -C "cpanel-deploy"
   ```

2. **نسخ المفتاح العام:**
   ```bash
   cat ~/.ssh/id_rsa.pub
   ```

3. **إضافته في cPanel:**
   - cPanel → **SSH Access**
   - **Manage SSH Keys**
   - **Import Key**
   - الصق المفتاح العام
   - **Authorize** المفتاح

### الخطوة 4: اختبار النشر

```bash
# في المشروع المحلي
git add .
git commit -m "تحديث"
git push origin main
```

سيتم النشر تلقائياً! ✅

---

## 🔧 الطريقة البديلة: استخدام GitHub Actions

### الخطوة 1: إعداد Secrets في GitHub

1. اذهب إلى GitHub Repository
2. **Settings → Secrets and variables → Actions**
3. أضف Secrets التالية:
   - `CPANEL_USERNAME`: `u2890132`
   - `CPANEL_PASSWORD`: كلمة مرور cPanel
   - `CPANEL_HOST`: `in33.in`
   - `CPANEL_SSH_KEY`: (مفتاح SSH الخاص)

### الخطوة 2: الملف جاهز!

تم إنشاء ملف `.github/workflows/deploy-to-cpanel.yml`

**عند كل push، سيتم:**
1. بناء المشروع تلقائياً
2. رفع الملفات إلى cPanel
3. ✅ الموقع محدث!

---

## 🚀 الطريقة السريعة: سكريبت محلي

### استخدام السكريبت المحلي

1. **تثبيت sshpass (للمصادقة التلقائية):**
   ```bash
   # macOS
   brew install hudochenkov/sshpass/sshpass
   
   # Linux
   sudo apt-get install sshpass
   ```

2. **تعديل السكريبت:**
   - افتح `deploy-cpanel.sh`
   - تأكد من المعلومات صحيحة

3. **تشغيله:**
   ```bash
   chmod +x deploy-cpanel.sh
   ./deploy-cpanel.sh
   ```

---

## ⚙️ الطريقة المتقدمة: Watch Script

### مراقبة التغييرات والنشر التلقائي

إنشاء `watch-deploy.sh`:

```bash
#!/bin/bash

# مراقبة التغييرات والنشر التلقائي

while true; do
    # انتظر التغييرات
    if git diff --quiet && git diff --staged --quiet; then
        sleep 5
        continue
    fi
    
    echo "📝 تغييرات جديدة، جاري النشر..."
    npm run build
    ./deploy-cpanel.sh
    git add .
    git commit -m "تحديث تلقائي $(date)"
    git push
    
    sleep 10
done
```

**تشغيله:**
```bash
chmod +x watch-deploy.sh
./watch-deploy.sh
```

---

## 📝 إضافة Git Hook محلي (الأسهل)

### إعداد Git Hook للتحديث التلقائي

```bash
# في مجلد المشروع
mkdir -p .git/hooks

# إنشاء post-push hook
cat > .git/hooks/post-push << 'EOF'
#!/bin/bash
echo "🔄 بدء النشر التلقائي..."
npm run build
./deploy-cpanel.sh
EOF

chmod +x .git/hooks/post-push
```

---

## ✅ التوصية النهائية

**الأفضل: Git Hook في cPanel** ✨

**لماذا؟**
- ✅ تحديث تلقائي فوري
- ✅ لا حاجة لإعدادات معقدة
- ✅ يعمل مع كل `git push`
- ✅ آمن ومضمون

---

## 🔍 استكشاف الأخطاء

### المشكلة: Git Hook لا يعمل

**الحل:**
1. تأكد من الصلاحيات:
   ```bash
   chmod +x ~/ithraa/.git/hooks/post-receive
   ```

2. تحقق من المسارات في السكريبت

3. راجع سجلات الأخطاء في cPanel

### المشكلة: البناء يفشل

**الحل:**
- تأكد من تثبيت Node.js في cPanel
- تحقق من `package.json` صحيح

---

## 🎉 مبروك!

الآن عند كل `git push`، سيتم تحديث الموقع تلقائياً على cPanel!

**لا حاجة لرفع يدوي بعد الآن!** 🚀

