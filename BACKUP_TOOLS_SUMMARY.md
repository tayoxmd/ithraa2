# 🛠️ أدوات النسخ الاحتياطي المتاحة

## 📦 السكريبتات المتاحة

### 1. `backup-project.sh` - نسخة احتياطية عادية
```bash
./backup-project.sh
```
- ✅ يحفظ الكود والإعدادات
- ✅ بدون `node_modules` (حجم صغير)
- ✅ بدون `dist`
- 📁 الموقع: `~/ithraa-backup-[تاريخ].zip`

### 2. `backup-full.sh` - نسخة احتياطية كاملة
```bash
./backup-full.sh
```
- ✅ يحفظ كل شيء بما في ذلك `node_modules`
- ⚠️ حجم كبير (عدة GB)
- ✅ أسرع في الاستعادة (لا حاجة لـ `npm install`)

### 3. `backup-env.sh` - حفظ ملف .env
```bash
./backup-env.sh
```
- ✅ يحفظ ملف `.env` بشكل منفصل وآمن
- 📁 الموقع: `~/ithraa-env-backup-[تاريخ].txt`
- ⚠️ احفظه في مكان آمن!

### 4. `restore-project.sh` - استعادة المشروع
```bash
./restore-project.sh
```
- 🔄 دليل تفاعلي للاستعادة
- ✅ من Git أو من ZIP
- ✅ تثبيت تلقائي للتبعيات

---

## 🚀 الاستخدام السريع

### لحفظ نسخة احتياطية قبل السفر:

```bash
cd /Users/amani/Documents/GitHub/ithraa

# 1. حفظ الكود
./backup-project.sh

# 2. حفظ ملف .env
./backup-env.sh

# 3. رفع إلى Git (اختياري لكن موصى به)
git add .
git commit -m "نسخة احتياطية قبل السفر"
git push
```

### لاسترجاع على كمبيوتر جديد:

```bash
# الطريقة 1: من Git (الأسهل)
git clone https://github.com/[username]/ithraa.git
cd ithraa
npm install
./start-dev.sh

# الطريقة 2: من ZIP
./restore-project.sh
```

---

## 📚 الوثائق الكاملة

- `BACKUP_AND_RESTORE.md` - دليل شامل ومفصل
- `كيفية_النسخ_الاحتياطي.md` - دليل سريع بالعربية

---

**تم إنشاء:** 4 سكريبتات جاهزة للاستخدام ✅

