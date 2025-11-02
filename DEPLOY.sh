#!/bin/bash

# 🚀 سكريبت النشر السريع
# استخدام: ./DEPLOY.sh

echo "🚀 بدء عملية النشر..."
echo ""

# التحقق من وجود المشروع
if [ ! -f "package.json" ]; then
    echo "❌ خطأ: يجب تنفيذ السكريبت من مجلد المشروع"
    exit 1
fi

# الخطوة 1: بناء المشروع
echo "📦 جاري بناء المشروع..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ فشل البناء! راجع الأخطاء أعلاه"
    exit 1
fi

echo "✅ تم البناء بنجاح!"
echo ""

# الخطوة 2: التحقق من وجود dist
if [ ! -d "dist" ]; then
    echo "❌ خطأ: مجلد dist غير موجود"
    exit 1
fi

echo "📋 الخيارات المتاحة:"
echo ""
echo "1️⃣  رفع إلى GitHub (للنشر التلقائي):"
echo "   git add ."
echo "   git commit -m 'تحديثات النشر'"
echo "   git push origin main"
echo ""
echo "2️⃣  إنشاء ملف ZIP للرفع اليدوي:"
echo "   cd dist && zip -r ../ithraa-deploy.zip . && cd .."
echo ""
echo "3️⃣  النشر المباشر (إذا كان لديك SSH):"
echo "   scp -r dist/* user@server:/path/to/public_html/"
echo ""

# سؤال: هل تريد إنشاء ZIP؟
read -p "هل تريد إنشاء ملف ZIP جاهز للرفع؟ (y/n): " create_zip

if [ "$create_zip" = "y" ] || [ "$create_zip" = "Y" ]; then
    echo "📦 جاري إنشاء ملف ZIP..."
    cd dist
    zip -r ../ithraa-deploy.zip . -q
    cd ..
    echo "✅ تم إنشاء: ithraa-deploy.zip"
    echo "   ارفع هذا الملف إلى cPanel واستخرجه في public_html"
fi

echo ""
echo "✅ جاهز للنشر!"
echo ""
echo "📝 الخطوات التالية:"
echo "   1. ارفع محتويات dist إلى public_html في cPanel"
echo "   2. تأكد من رفع ملف .htaccess"
echo "   3. افتح https://in33.in للتحقق"

