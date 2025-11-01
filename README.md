# إثراء - ITHRAA2 🏨

نظام حجز الفنادق والشقق الفندقية - تطبيق ويب متقدم مع دعم تطبيق Android

## 🚀 الميزات

- ✅ تطبيق ويب متقدم (React + TypeScript)
- ✅ دعم تطبيق Android (Capacitor)
- ✅ كرة أرضية متحركة 3D مع نقاط على مكة والمدينة
- ✅ نماذج 3D لبرج الساعة والحرمين
- ✅ تسجيل الدخول عبر WhatsApp
- ✅ النشر التلقائي إلى cPanel

## 📱 النشر

### الموقع: https://in33.in

### النشر التلقائي:
عند كل `git push`، يتم تحديث الموقع تلقائياً على cPanel.

## 🛠️ التطوير

```bash
# تثبيت التبعيات
npm install

# تشغيل محلياً
npm run dev

# بناء للإنتاج
npm run build
```

## 📝 معلومات المشروع

- **GitHub:** https://github.com/tayoxmd/ithraa2
- **الموقع:** https://in33.in
- **cPanel Username:** u2890132

## 📚 الأدلة

- `AUTO_DEPLOY_SETUP.md` - إعداد النشر التلقائي
- `FINAL_SETUP_CODE.md` - الكود النهائي للإعداد
- `ANDROID_SETUP.md` - إعداد تطبيق Android
- `DEPLOY_TO_CPANEL.md` - دليل النشر على cPanel

## ⚡ النشر التلقائي

بعد إعداد Post-Receive Hook في cPanel:

```bash
git add .
git commit -m "تحديث"
git push origin main
```

✅ سيتم النشر تلقائياً على cPanel بعد 30-60 ثانية!

---

**تم التحديث:** آخر تحديث - نوفمبر 2024
