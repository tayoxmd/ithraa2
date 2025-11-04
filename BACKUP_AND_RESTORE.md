# 💾 دليل النسخ الاحتياطي والاستعادة الكامل

## 📋 المحتويات
1. [الطريقة 1: استخدام Git (الأفضل)](#git-method)
2. [الطريقة 2: نسخة احتياطية يدوية (ZIP)](#zip-method)
3. [الطريقة 3: نسخة احتياطية كاملة مع node_modules](#full-backup)
4. [الاستعادة على كمبيوتر آخر](#restore)

---

## 🔵 الطريقة 1: استخدام Git (الأفضل) {#git-method}

### ✅ المميزات:
- ✅ مجاني تماماً
- ✅ تتبع جميع التغييرات
- ✅ يمكن الاستعادة من أي وقت
- ✅ لا تحتاج مساحة كبيرة
- ✅ متزامن مع GitHub

### 📝 خطوات النسخ الاحتياطي:

#### 1. تأكد من أن جميع التغييرات محفوظة:

```bash
cd /Users/amani/Documents/GitHub/ithraa

# عرض حالة Git
git status

# إضافة جميع التغييرات
git add .

# حفظ التغييرات
git commit -m "نسخة احتياطية: [تاريخ]"

# رفع إلى GitHub
git push origin main
```

#### 2. التحقق من أن كل شيء على GitHub:

افتح: `https://github.com/[username]/ithraa`

---

## 📦 الطريقة 2: نسخة احتياطية يدوية (ZIP) {#zip-method}

### استخدم السكريبت الجاهز:

```bash
cd /Users/amani/Documents/GitHub/ithraa
./backup-project.sh
```

سيكون الملف في: `~/ithraa-backup-[تاريخ].zip`

---

## 💾 الطريقة 3: نسخة احتياطية كاملة {#full-backup}

### تتضمن: الكود + node_modules + dist

```bash
cd /Users/amani/Documents/GitHub/ithraa
./backup-full.sh
```

**حجم أكبر لكن أسرع في الاستعادة**

---

## 🔄 الاستعادة على كمبيوتر آخر {#restore}

### الطريقة A: من Git (الأسهل)

#### 1. تثبيت المتطلبات:

```bash
# تثبيت nvm (إذا لم يكن مثبتاً)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# إعادة فتح Terminal أو:
source ~/.zshrc

# تثبيت Node.js
nvm install 20
nvm use 20
```

#### 2. استنساخ المشروع:

```bash
cd ~/Documents/GitHub  # أو أي مجلد تفضله
git clone https://github.com/[username]/ithraa.git
cd ithraa
```

#### 3. تثبيت التبعيات:

```bash
npm install
```

#### 4. تشغيل المشروع:

```bash
./start-dev.sh
# أو
npm run dev
```

#### 5. فتح المتصفح:

افتح: `http://localhost:8080`

---

### الطريقة B: من نسخة ZIP

#### 1. نسخ الملف:

انسخ ملف `ithraa-backup-[تاريخ].zip` إلى الكمبيوتر الجديد

#### 2. فك الضغط:

```bash
cd ~/Documents/GitHub  # أو أي مجلد
unzip ithraa-backup-[تاريخ].zip
cd ithraa
```

#### 3. تثبيت التبعيات (إذا لم تكن في النسخة):

```bash
npm install
```

#### 4. تشغيل المشروع:

```bash
./start-dev.sh
```

---

## 🔐 الإعدادات المهمة

### 1. متغيرات البيئة (.env)

إذا كان لديك ملف `.env`:

#### حفظ ملف .env:

```bash
# الطريقة السريعة: استخدام السكريبت
./backup-env.sh

# أو يدوياً:
cp .env ~/Desktop/ithraa-env-backup.txt
```

#### استعادة ملف .env:

```bash
# في الكمبيوتر الجديد:
cp ~/Desktop/ithraa-env-backup.txt .env
# أو من النسخة الاحتياطية:
cp ~/ithraa-env-backup-[تاريخ].txt .env
```

**⚠️ مهم:** 
- ❌ لا ترفع ملف `.env` إلى Git! (تم إضافته إلى `.gitignore`)
- ✅ احفظه في مكان آمن (مشفر إذا أمكن)
- ✅ لا تشاركه مع أحد

### 2. إعدادات Supabase

تحقق من ملف:
- `src/integrations/supabase/client.ts`

### 3. إعدادات Capacitor (للجوال)

```bash
# بعد الاستعادة، قم بمزامنة Capacitor
npm run android:sync
```

---

## 📝 قائمة فحص الاستعادة

- [ ] استنساخ/نسخ المشروع
- [ ] تثبيت Node.js (v20)
- [ ] تثبيت التبعيات (`npm install`)
- [ ] **نسخ ملف `.env` (إن وجد)** ← مهم جداً!
- [ ] التحقق من إعدادات Supabase
- [ ] تشغيل الخادم (`npm run dev`)
- [ ] فتح `http://localhost:8080`
- [ ] التحقق من أن كل شيء يعمل

---

## 🆘 حل المشاكل الشائعة

### المشكلة: `npm: command not found`

**الحل:**
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20
```

### المشكلة: التبعيات لا تعمل

**الحل:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### المشكلة: Git لا يعمل

**الحل:**
```bash
# إعداد Git (مرة واحدة فقط)
git config --global user.name "اسمك"
git config --global user.email "بريدك@example.com"
```

---

## 💡 نصائح مهمة

1. **احفظ نسخة احتياطية قبل أي تغيير كبير**
2. **ارفع التغييرات إلى Git بانتظام**
3. **لا ترفع ملفات `.env` أو `node_modules` إلى Git**
4. **استخدم `./backup-project.sh` قبل السفر أو تغيير الكمبيوتر**

---

**آخر تحديث:** تم إنشاء سكريبتات النسخ الاحتياطي

