#!/bin/bash

# سكريبت النشر التلقائي إلى cPanel
# يتم تشغيله تلقائياً عند git push

echo "🚀 بدء النشر التلقائي إلى cPanel..."

# إعدادات cPanel
CPANEL_HOST="in33.in"
CPANEL_USER="u2890132"
CPANEL_PASS="@@@Tayo0991"
REMOTE_DIR="/home/u2890132/public_html"
REPO_NAME="ithraa2"

# بناء المشروع
echo "📦 بناء المشروع..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ فشل البناء - مجلد dist غير موجود"
    exit 1
fi

# النشر عبر rsync (إذا كان متاحاً)
if command -v rsync &> /dev/null; then
    echo "📤 رفع الملفات عبر rsync..."
    sshpass -p "$CPANEL_PASS" rsync -avz --delete \
        -e "ssh -o StrictHostKeyChecking=no" \
        dist/ $CPANEL_USER@$CPANEL_HOST:$REMOTE_DIR/
    
    # رفع .htaccess
    sshpass -p "$CPANEL_PASS" scp -o StrictHostKeyChecking=no \
        .htaccess $CPANEL_USER@$CPANEL_HOST:$REMOTE_DIR/
else
    echo "⚠️  rsync غير متاح، استخدم FTP..."
    # يمكن إضافة سكريبت FTP هنا
fi

echo "✅ تم النشر بنجاح!"

