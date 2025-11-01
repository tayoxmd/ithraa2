# دليل إعداد تطبيق Android 📱

## نظرة عامة
المشروع مدعوم بـ **Capacitor** لبناء تطبيق Android أصلي يعمل بشكل كامل على أجهزة Android.

---

## المتطلبات الأساسية 🔧

### 1. تثبيت Java Development Kit (JDK)
```bash
# على macOS
brew install openjdk@17

# أو حمّل من: https://adoptium.net/
```

### 2. تثبيت Android Studio
1. حمّل من: https://developer.android.com/studio
2. قم بتثبيته وافتحه
3. اذهب إلى **Tools → SDK Manager**
4. ثبت:
   - Android SDK Platform
   - Android SDK Build-Tools
   - Android SDK Command-line Tools

### 3. إعداد متغيرات البيئة
أضف إلى `~/.zshrc` أو `~/.bash_profile`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

ثم أعد تحميل Shell:
```bash
source ~/.zshrc
```

---

## خطوات إعداد التطبيق 🚀

### الخطوة 1: بناء المشروع
```bash
npm run build
```

### الخطوة 2: مزامنة Capacitor
```bash
npx cap sync android
```

هذا الأمر سيقوم بـ:
- نسخ ملفات `dist` إلى مشروع Android
- تحديث plugins
- تحديث Android dependencies

### الخطوة 3: فتح المشروع في Android Studio
```bash
npx cap open android
```

أو افتح يدوياً:
```
android/app
```

### الخطوة 4: بناء التطبيق

#### الطريقة 1: عبر Android Studio
1. افتح المشروع في Android Studio
2. انقر **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. انتظر حتى يكتمل البناء
4. سيظهر APK في: `android/app/build/outputs/apk/debug/app-debug.apk`

#### الطريقة 2: عبر Terminal
```bash
cd android
./gradlew assembleDebug
```

APK سيكون في: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## تشغيل التطبيق على الجهاز 📲

### الطريقة 1: USB Debugging
1. فعّل **Developer Options** على جهاز Android:
   - اذهب إلى **Settings → About Phone**
   - اضغط **Build Number** 7 مرات
2. فعّل **USB Debugging** في **Developer Options**
3. وصّل الجهاز بالكمبيوتر
4. في Terminal:
   ```bash
   npx cap run android
   ```

### الطريقة 2: استخدام Android Emulator
1. افتح Android Studio
2. **Tools → Device Manager → Create Device**
3. اختر جهازاً وثبت النظام
4. شغّل Emulator
5. في Terminal:
   ```bash
   npx cap run android
   ```

### الطريقة 3: تثبيت APK مباشرة
1. انسخ ملف `app-debug.apk` إلى جهاز Android
2. فعّل **Install from Unknown Sources** في الإعدادات
3. افتح APK وثبته

---

## نشر التطبيق على Google Play Store 🏪

### الخطوة 1: إنشاء Android App Bundle (AAB)
```bash
cd android
./gradlew bundleRelease
```

AAB سيكون في: `android/app/build/outputs/bundle/release/app-release.aab`

### الخطوة 2: توقيع التطبيق
1. أنشئ keystore:
   ```bash
   keytool -genkey -v -keystore ithraa-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias ithraa
   ```
2. احفظ ملف keystore ومعلوماته في مكان آمن!

3. أنشئ ملف `android/keystore.properties`:
   ```properties
   storePassword=your-store-password
   keyPassword=your-key-password
   keyAlias=ithraa
   storeFile=path/to/ithraa-release-key.jks
   ```

### الخطوة 3: تحديث build.gradle
أضف إلى `android/app/build.gradle`:
```gradle
android {
    ...
    signingConfigs {
        release {
            def keystorePropertiesFile = rootProject.file("keystore.properties")
            def keystoreProperties = new Properties()
            keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
            
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

### الخطوة 4: رفع إلى Google Play
1. سجل في [Google Play Console](https://play.google.com/console)
2. أنشئ تطبيق جديد
3. ارفع ملف AAB في **Release → Production**
4. املأ معلومات التطبيق:
   - الاسم: إثراء - ITHRAA
   - الوصف
   - الأيقونة (512x512)
   - لقطات الشاشة
5. قدم للت审核

---

## إعدادات Capacitor المهمة ⚙️

### capacitor.config.ts
```typescript
{
  appId: 'com.ithraa.app',  // غير هذا لمعرف فريد
  appName: 'إثراء - ITHRAA',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // للتطوير: استخدم رابط الخادم
    // url: 'http://your-local-ip:8080',
    // cleartext: true
  }
}
```

### تحديث Info في Android
في `android/app/src/main/res/values/strings.xml`:
```xml
<resources>
    <string name="app_name">إثراء - ITHRAA</string>
    <string name="package_name">com.ithraa.app</string>
</resources>
```

---

## تحديث التطبيق بعد التعديلات 🔄

### عند كل تعديل على الويب:
```bash
# 1. بناء المشروع
npm run build

# 2. مزامنة Capacitor
npx cap sync android

# 3. إعادة بناء APK
cd android
./gradlew assembleDebug
```

### تحديث تلقائي (Live Reload) - للتطوير
في `capacitor.config.ts`:
```typescript
server: {
  url: 'http://your-local-ip:8080',  // استخدم IP محليك
  cleartext: true
}
```

ثم شغّل:
```bash
npm run dev
npx cap run android
```
التطبيق سيتصل بالخادم المحلي مباشرة!

---

## استكشاف الأخطاء 🔧

### خطأ: "SDK location not found"
**الحل**: أضف إلى `android/local.properties`:
```properties
sdk.dir=/Users/your-username/Library/Android/sdk
```

### خطأ: "Gradle sync failed"
**الحل**:
```bash
cd android
./gradlew clean
```

### خطأ: "INSTALL_FAILED_INSUFFICIENT_STORAGE"
**الحل**: حرّر مساحة على الجهاز

### التطبيق لا يتصل بالإنترنت
**الحل**: أضف في `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

---

## نصائح مهمة 💡

1. **اختبر على أجهزة حقيقية**: Emulator قد لا يعكس الأداء الفعلي
2. **احتفظ بنسخ احتياطية**: من keystore وملفات الإعداد
3. **راقب حجم التطبيق**: استخدم ProGuard لتقليل الحجم
4. **اختبر جميع الصفحات**: تأكد من أن Routing يعمل بشكل صحيح

---

## الأوامر السريعة 📝

```bash
# بناء ومزامنة
npm run build && npx cap sync android

# فتح في Android Studio
npx cap open android

# تشغيل على الجهاز
npx cap run android

# بناء APK
cd android && ./gradlew assembleDebug

# بناء AAB للنشر
cd android && ./gradlew bundleRelease

# تنظيف وإعادة بناء
cd android && ./gradlew clean && ./gradlew assembleDebug
```

---

## الدعم والمساعدة 🆘

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/)
- [Google Play Console](https://play.google.com/console)

**تم التحديث**: آخر تحديث - $(date)
