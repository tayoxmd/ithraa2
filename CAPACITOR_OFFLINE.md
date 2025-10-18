# تطبيق الجوال - العمل بدون اتصال (Capacitor) 📱

## التحديثات التلقائية للتطبيق المحلي

عند استخدام **Capacitor** لبناء التطبيق محلياً على جهازك:

### الوضع الحالي (Hot Reload) 🔄
التطبيق متصل مباشرة بالموقع عبر:
```json
"server": {
  "url": "https://6478dddf-f22a-4710-8929-035e38dc9182.lovableproject.com?forceHideBadge=true",
  "cleartext": true
}
```

**المميزات:**
- ✅ تحديث تلقائي فوري
- ✅ لا حاجة لإعادة البناء
- ✅ مثالي للتطوير والتجربة

**العيوب:**
- ❌ يحتاج اتصال بالإنترنت دائماً
- ❌ لا يعمل offline بالكامل

### الوضع Production (Build محلي) 📦

لبناء تطبيق يعمل بالكامل بدون إنترنت:

#### 1. تحديث capacitor.config.json:
```json
{
  "appId": "app.lovable.6478dddff22a47108929035e38dc9182",
  "appName": "ithraa",
  "webDir": "dist",
  "server": {
    "androidScheme": "https"
  }
}
```
⚠️ **احذف** سطر "url" من server

#### 2. البناء والمزامنة:
```bash
# سحب آخر تحديثات
git pull

# تثبيت التبعيات
npm install

# بناء التطبيق
npm run build

# مزامنة مع Capacitor
npx cap sync

# تشغيل التطبيق
npx cap run android
# أو
npx cap run ios
```

#### 3. عند كل تحديث:
```bash
git pull
npm run build
npx cap sync
```

## كيفية عمل التحديثات 🔄

### في وضع Hot Reload (الحالي):
```
تطبيق الجوال → يتصل مباشرة → Lovable Server
              ← يحصل على آخر نسخة ←
```
- تحديث **فوري** عند أي تغيير
- لا حاجة لأي إجراء

### في وضع Production:
```
تطبيق الجوال → ملفات محلية في dist/
```
- يعمل **بدون إنترنت** 100%
- يحتاج **git pull + build + sync** للتحديث

## نظام Offline في التطبيق المحلي 💾

حتى في وضع Production، النظام يعمل:

### 1. التخزين المحلي (Service Worker):
- جميع الملفات محفوظة محلياً
- الصور والأصول مخزنة
- JavaScript/CSS جاهز

### 2. IndexedDB للبيانات:
```typescript
// البيانات محفوظة محلياً
const hotels = offlineSync.getCachedData('hotels');
```

### 3. المزامنة الذكية:
```typescript
// عند الاتصال
window.addEventListener('online', () => {
  offlineSync.syncPendingOperations();
});
```

## استراتيجية التحديث الموصى بها 🎯

### للتطوير والاختبار:
استخدم **Hot Reload** (الوضع الحالي):
- تحديثات فورية
- لا حاجة لإعادة البناء
- سهل ومريح

### للنشر والإنتاج:
استخدم **Production Build**:
1. اعمل `git pull` يومياً أو أسبوعياً
2. قم بـ `npm run build`
3. نفذ `npx cap sync`
4. أعد تشغيل التطبيق

## نظام التحديث التلقائي للمستخدمين 📲

إذا أردت تحديث التطبيق للمستخدمين تلقائياً:

### الحل 1: Code Push (موصى به)
استخدم خدمات مثل:
- [AppCenter CodePush](https://appcenter.ms/)
- [Capawesome Cloud](https://capawesome.io/)

```bash
npm install @capawesome/capacitor-live-update
```

### الحل 2: In-App Update
```typescript
// src/utils/appUpdater.ts
import { CapacitorUpdater } from '@capawesome/capacitor-updater';

export async function checkForUpdates() {
  try {
    const update = await CapacitorUpdater.download({
      url: 'https://your-server.com/app-update.zip',
    });
    
    if (update) {
      await CapacitorUpdater.set({ id: update.id });
      // إعادة تشغيل التطبيق
      await CapacitorUpdater.reload();
    }
  } catch (error) {
    console.error('فشل التحديث:', error);
  }
}
```

## الفرق بين Hot Reload و Production

| الميزة | Hot Reload | Production Build |
|--------|------------|------------------|
| تحديث تلقائي | ✅ فوري | ❌ يدوي |
| يعمل offline | ❌ لا | ✅ نعم |
| سرعة التحميل | متوسطة | ⚡ سريع جداً |
| حجم التطبيق | صغير | كبير |
| للتطوير | ✅ ممتاز | ❌ بطيء |
| للإنتاج | ❌ يحتاج نت | ✅ ممتاز |

## أمثلة عملية 💡

### مثال 1: التبديل بين الوضعين

**للتطوير:**
```json
// capacitor.config.json
{
  "server": {
    "url": "https://6478dddf-f22a-4710-8929-035e38dc9182.lovableproject.com?forceHideBadge=true",
    "cleartext": true
  }
}
```

**للإنتاج:**
```json
// capacitor.config.json
{
  "server": {
    "androidScheme": "https"
  }
}
```

### مثال 2: فحص الاتصال في التطبيق

```typescript
import { Network } from '@capacitor/network';

// فحص الاتصال
const status = await Network.getStatus();
console.log('متصل:', status.connected);

// الاستماع للتغييرات
Network.addListener('networkStatusChange', (status) => {
  console.log('تغيرت حالة الاتصال:', status.connected);
});
```

## الأسئلة الشائعة ❓

### س: متى يجب استخدام Hot Reload؟
**ج:** عند التطوير والاختبار - يوفر تحديثات فورية.

### س: متى يجب استخدام Production Build؟
**ج:** عند النشر النهائي للمستخدمين.

### س: كم مرة يجب التحديث؟
**ج:** 
- في Hot Reload: تلقائياً
- في Production: عند إضافة ميزات جديدة

### س: هل يعمل التطبيق بدون نت؟
**ج:**
- Hot Reload: لا
- Production: نعم 100%

### س: كيف أعرف النسخة الحالية؟
**ج:** افتح Dev Tools واكتب:
```javascript
console.log('النسخة:', import.meta.env.VITE_APP_VERSION);
```

## الخلاصة 🎯

- **Hot Reload**: للتطوير - تحديث فوري لكن يحتاج نت
- **Production Build**: للإنتاج - يعمل offline لكن يحتاج تحديث يدوي
- **PWA**: يعمل على كل الأجهزة بدون Capacitor
- **Offline System**: يعمل في كل الحالات

اختر الوضع المناسب لاحتياجاتك! 🚀
