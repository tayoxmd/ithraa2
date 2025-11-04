# 🔧 حل مشكلة Localhost - الآن

## ✅ المشكلة
الخادم المحلي لا يعمل لأن Node.js غير موجود في PATH.

---

## 🚀 الحل السريع

### الطريقة 1: استخدام السكريبت الجديد (الأسهل)

```bash
cd /Users/amani/Documents/GitHub/ithraa
./start-dev.sh
```

### الطريقة 2: تشغيل يدوي

```bash
# 1. تحميل nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 2. تثبيت واستخدام Node.js 20
nvm install 20
nvm use 20
nvm alias default 20

# 3. الانتقال إلى المشروع
cd /Users/amani/Documents/GitHub/ithraa

# 4. تشغيل الخادم
npm run dev
```

---

## ✅ الحل الدائم (إضافة nvm إلى .zshrc)

لفتح `.zshrc`:

```bash
nano ~/.zshrc
```

أضف هذه الأسطر في نهاية الملف:

```bash
# NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# استخدام Node.js 20 افتراضياً
nvm use 20 2>/dev/null || nvm install 20 && nvm use 20
```

ثم احفظ الملف (`Ctrl+O` ثم `Enter` ثم `Ctrl+X`).

أعد فتح Terminal أو نفذ:
```bash
source ~/.zshrc
```

---

## 🔍 التحقق من أن الخادم يعمل

بعد تشغيل الخادم، يجب أن ترى:

```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:8080/
➜  Network: http://[YOUR_IP]:8080/
```

ثم افتح المتصفح على: `http://localhost:8080`

---

## ⚠️ ملاحظات مهمة

1. **لا تغلق Terminal** أثناء استخدام الموقع
2. **الخادم يجب أن يكون شغال** قبل فتح localhost
3. إذا ظهر خطأ، أرسله لي
4. **استخدم `./start-dev.sh`** لتسهيل التشغيل في المستقبل

---

## 🆘 إذا لم يعمل

1. تأكد من أن nvm مثبت:
   ```bash
   ls -la ~/.nvm
   ```

2. أعد تثبيت Node.js:
   ```bash
   export NVM_DIR="$HOME/.nvm"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
   nvm install 20
   nvm alias default 20
   ```

3. أعد فتح Terminal وأشغل `./start-dev.sh`

---

**آخر تحديث**: تم إنشاء `start-dev.sh` وتثبيت Node.js 20
