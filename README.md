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

### الطريقة الموصى بها: `.cpanel.yml`

المشروع يستخدم `.cpanel.yml` للنشر التلقائي على cPanel.

**كيف يعمل:**
1. ارفع التغييرات إلى GitHub:
```bash
git add .
git commit -m "تحديث"
git push origin main
```

2. في cPanel:
   - اذهب إلى **Git Version Control**
   - اختر المستودع `ithraa2`
   - انقر على **"Pull or Deploy"**
   - انقر على **"Update from Remote"**
   - سيتم النشر تلقائياً عبر `.cpanel.yml`

✅ **النشر التلقائي:** بعد `git push` و `Update from Remote` في cPanel، سيتم النشر خلال 2-5 دقائق!

---

### ⚠️ ملاحظة: GitHub Actions معطل

- ❌ **GitHub Actions** تم تعطيله (لا حاجة لـ SSH keys)
- ✅ **`.cpanel.yml`** هو الطريقة الوحيدة للنشر التلقائي

---

**تم التحديث:** آخر تحديث - نوفمبر 2024
