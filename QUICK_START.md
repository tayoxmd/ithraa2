# دليل البدء السريع 🚀

## للموقع على cPanel

### 1. بناء المشروع
```bash
npm run build
```

### 2. تحضير الملفات للنشر
```bash
npm run deploy:prepare
```

هذا سينشئ ملف `ithraa-deploy.zip` في المجلد الرئيسي.

### 3. رفع الملفات
- ارفع محتويات مجلد `dist` إلى `public_html` في cPanel
- تأكد من رفع ملف `.htaccess`
- أو استخدم ملف ZIP الذي تم إنشاؤه

**للمزيد من التفاصيل**: راجع ملف `DEPLOY_TO_CPANEL.md`

---

## لتطبيق Android

### 1. إعداد Android Studio
- ثبت Android Studio
- ثبت Android SDK

### 2. بناء ومزامنة
```bash
npm run android:sync
```

### 3. فتح في Android Studio
```bash
npm run android:open
```

### 4. بناء APK
```bash
npm run android:build
```

APK سيكون في: `android/app/build/outputs/apk/debug/app-debug.apk`

**للمزيد من التفاصيل**: راجع ملف `ANDROID_SETUP.md`

---

## أوامر سريعة 📝

```bash
# تشغيل محلي
npm run dev

# بناء للنشر
npm run build

# معاينة البناء
npm run preview

# Android - بناء ومزامنة
npm run android:sync

# Android - فتح في Android Studio
npm run android:open

# Android - تشغيل على الجهاز
npm run android:run

# تحضير ملف ZIP للنشر
npm run deploy:prepare
```
