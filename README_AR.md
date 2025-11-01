# إثراء - ITHRAA 🏨

نظام حجز الفنادق والشقق الفندقية - تطبيق ويب متقدم مع دعم تطبيق Android

---

## 📱 دعم Android وتطبيق الجوال

تم إعداد المشروع بالكامل لدعم تطبيق Android الأصلي باستخدام **Capacitor**.

### ✅ ما تم إعداده:
- ✅ Capacitor مثبت ومعد بشكل كامل
- ✅ Android platform مضاف جاهز للبناء
- ✅ ملفات الإعداد جاهزة
- ✅ دليل شامل في `ANDROID_SETUP.md`

### 🚀 خطوات سريعة لتطبيق Android:

1. **تثبيت Android Studio و JDK**
   - حمّل Android Studio من [هنا](https://developer.android.com/studio)
   - ثبت JDK 17

2. **بناء ومزامنة**
   ```bash
   npm run android:sync
   ```

3. **فتح في Android Studio**
   ```bash
   npm run android:open
   ```

4. **بناء APK**
   ```bash
   npm run android:build
   ```

**للمزيد من التفاصيل**: راجع ملف `ANDROID_SETUP.md`

---

## 🌐 النشر على cPanel

تم إعداد المشروع بالكامل للنشر على استضافة cPanel.

### ✅ ما تم إعداده:
- ✅ ملف `.htaccess` جاهز لدعم React Router
- ✅ إعدادات التخزين المؤقت والضغط
- ✅ دليل شامل في `DEPLOY_TO_CPANEL.md`

### 🚀 خطوات سريعة للنشر:

1. **بناء المشروع**
   ```bash
   npm run build
   ```

2. **تحضير الملفات**
   ```bash
   npm run deploy:prepare
   ```

3. **رفع الملفات**
   - ارفع محتويات مجلد `dist` إلى `public_html` في cPanel
   - تأكد من رفع ملف `.htaccess`

**للمزيد من التفاصيل**: راجع ملف `DEPLOY_TO_CPANEL.md`

---

## 📚 الأدلة المتاحة

1. **`QUICK_START.md`** - دليل البدء السريع
2. **`ANDROID_SETUP.md`** - دليل كامل لتطبيق Android
3. **`DEPLOY_TO_CPANEL.md`** - دليل كامل للنشر على cPanel
4. **`CAPACITOR_OFFLINE.md`** - معلومات عن Capacitor والوضع Offline

---

## 🛠️ الأوامر المتاحة

```bash
# التطوير
npm run dev              # تشغيل خادم التطوير

# البناء
npm run build            # بناء للموقع
npm run preview          # معاينة البناء

# Android
npm run android:sync     # بناء ومزامنة Android
npm run android:open     # فتح في Android Studio
npm run android:run      # بناء ومزامنة وتشغيل
npm run android:build    # بناء APK
npm run android:release  # بناء AAB للنشر

# النشر
npm run deploy:prepare   # تحضير ملف ZIP للنشر
```

---

## ⚙️ الإعدادات المهمة

### Capacitor Config
الملف: `capacitor.config.ts`

```typescript
{
  appId: 'com.ithraa.app',  // غير هذا لمعرف فريد
  appName: 'إثراء - ITHRAA',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
}
```

### Vite Config
الملف: `vite.config.ts`

- البورت: `8080`
- PWA مُفعّل بالكامل
- Service Worker جاهز

---

## 🔗 روابط مفيدة

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/)
- [Vite Documentation](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)

---

## 📝 ملاحظات مهمة

1. **للموقع على cPanel**: 
   - تأكد من رفع ملف `.htaccess` مع الملفات
   - راجع `DEPLOY_TO_CPANEL.md` للتفاصيل

2. **لتطبيق Android**:
   - تحتاج Android Studio مثبت
   - راجع `ANDROID_SETUP.md` للخطوات التفصيلية

3. **Supabase**:
   - تأكد من إضافة النطاق إلى Allowed Origins في Supabase
   - تحديث Redirect URLs في إعدادات المصادقة

---

## 🆘 الدعم والمساعدة

- راجع الأدلة المرفقة
- تحقق من Console للأخطاء
- راجع سجلات الأخطاء في cPanel

---

**تم التحديث**: جميع الأدلة والملفات جاهزة للاستخدام! 🎉
