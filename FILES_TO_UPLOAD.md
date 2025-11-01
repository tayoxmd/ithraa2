# 📁 قائمة الملفات المطلوب رفعها إلى cPanel

## ✅ ارفع كل هذه الملفات من مجلد `dist` إلى `public_html` في cPanel

---

## 📋 الملفات الرئيسية (في المجلد الرئيسي)

```
public_html/
├── index.html                    ✅ ارفع (الملف الرئيسي)
├── .htaccess                     ✅ ارفع (هام جداً - للنشر!)
├── favicon.png                   ✅ ارفع (أيقونة الموقع)
├── icon-192.png                  ✅ ارفع (أيقونة PWA)
├── icon-512.png                  ✅ ارفع (أيقونة PWA)
├── manifest.webmanifest          ✅ ارفع (إعدادات PWA)
├── robots.txt                    ✅ ارفع (للمحركات البحث)
├── sw.js                         ✅ ارفع (Service Worker)
└── workbox-*.js                  ✅ ارفع (Service Worker)
```

---

## 📁 المجلدات المطلوبة

```
public_html/
└── assets/                       ✅ ارفع المجلد كاملاً
    ├── index-*.css               (ملفات CSS)
    ├── index-*.js                (ملفات JavaScript)
    ├── workbox-*.js              (Service Worker)
    └── *.jpg, *.png, *.webp      (الصور)
```

---

## 🎯 الخطوات السريعة

### 1. بناء المشروع
```bash
npm run build
```

### 2. ارفع كل شيء من مجلد `dist`
- افتح مجلد `dist` في مشروعك
- حدد **جميع** الملفات والمجلدات
- ارفعهم إلى `public_html` في cPanel

### 3. تأكد من رفع `.htaccess`
- ملف `.htaccess` **ضروري جداً**
- بدونه لن يعمل Routing بشكل صحيح

---

## ❌ لا ترفع هذه الملفات

```
❌ node_modules/
❌ src/
❌ android/
❌ .env
❌ .git/
❌ package.json
❌ vite.config.ts
❌ tsconfig.json
❌ README.md
❌ أي ملف خارج مجلد dist/
```

---

## 📊 حجم الملفات المتوقع

بعد البناء:
- `dist/` كاملاً: حوالي 2-3 MB
- `assets/`: حوالي 1.5-2 MB
- الملفات الفردية: صغيرة (< 2 MB لكل ملف)

---

## ⚡ طريقة سريعة: ZIP

### على macOS/Linux:
```bash
cd dist
zip -r ../ithraa-deploy.zip .
```

### على Windows:
1. افتح مجلد `dist`
2. حدد جميع الملفات
3. انقر بزر الماوس الأيمن → Send to → Compressed folder

### ثم:
1. ارفع `ithraa-deploy.zip` إلى `public_html`
2. انقر بزر الماوس الأيمن → Extract
3. احذف ملف ZIP بعد الاستخراج

---

## ✅ قائمة التحقق

قبل النشر، تأكد من:

- [ ] تم بناء المشروع (`npm run build`)
- [ ] مجلد `dist` موجود
- [ ] ملف `.htaccess` موجود في المشروع
- [ ] تم رفع `index.html`
- [ ] تم رفع `.htaccess` ⚠️ **هام جداً!**
- [ ] تم رفع مجلد `assets` كاملاً
- [ ] تم رفع جميع الصور (`*.jpg`, `*.png`, `*.webp`)
- [ ] تم رفع `manifest.webmanifest`
- [ ] تم رفع `sw.js` و `workbox-*.js`
- [ ] تم رفع `favicon.png` والأيقونات

---

## 🔍 كيف تعرف أنك رفعت كل شيء؟

بعد الرفع، يجب أن تحتوي `public_html` على:

```
✅ index.html
✅ .htaccess
✅ assets/ (مجلد)
✅ favicon.png
✅ icon-192.png
✅ icon-512.png
✅ manifest.webmanifest
✅ robots.txt
✅ sw.js
✅ workbox-*.js
```

**إجمالي:** حوالي 10-15 ملف في المجلد الرئيسي + مجلد `assets` يحتوي على ملفات كثيرة

---

## ⚠️ تحذيرات مهمة

1. **احذف الملفات القديمة أولاً** قبل رفع الجديدة
2. **ارفع `.htaccess`** - بدونها لن يعمل Routing
3. **ارفع `assets` كاملاً** - لا تنس أي ملف داخل المجلد
4. **تحقق من الموقع** بعد الرفع مباشرة

---

## 📝 ملاحظة

**لا يمكنني رفع الملفات مباشرة** لأنني لا أستطيع الوصول إلى cPanel الخاص بك.

لكن المشروع **جاهز تماماً** - فقط ارفع محتويات `dist` وستعمل فوراً!

---

**تم التحديث**: الملفات جاهزة للرفع!
