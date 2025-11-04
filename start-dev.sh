#!/bin/bash

# تحميل nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# استخدام Node.js 20 (إذا لم يكن مثبتاً، سيتم تثبيته)
if ! nvm use 20 2>/dev/null; then
    echo "📦 تثبيت Node.js 20..."
    nvm install 20
    nvm use 20
    nvm alias default 20
fi

# الانتقال إلى مجلد المشروع
cd "$(dirname "$0")"

# التحقق من أن npm موجود
if ! command -v npm &> /dev/null; then
    echo "❌ خطأ: npm غير موجود. حاول إعادة فتح Terminal."
    exit 1
fi

# تشغيل الخادم
echo "🚀 بدء تشغيل الخادم المحلي..."
echo "📍 سيتم فتح: http://localhost:8080"
echo ""
npm run dev

