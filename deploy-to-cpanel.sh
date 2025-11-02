#!/bin/bash

# سكريبت النشر إلى cPanel
# استخدام: ./deploy-to-cpanel.sh

set -e  # توقف عند أي خطأ

echo "🚀 بدء عملية النشر إلى cPanel..."
echo ""

# إعدادات cPanel
CPANEL_HOST="in33.in"
CPANEL_USER="u2890132"
CPANEL_PASS="@@@Tayo0991"
REMOTE_DIR="/home/u2890132/public_html"
REPO_DIR="/var/www/u2890132/repositories/ithraa2"

# الألوان للرسائل
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# الخطوة 1: بناء المشروع
echo -e "${YELLOW}📦 الخطوة 1: بناء المشروع...${NC}"
if ! npm run build; then
    echo -e "${RED}❌ فشل بناء المشروع${NC}"
    exit 1
fi

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ مجلد dist غير موجود${NC}"
    exit 1
fi

echo -e "${GREEN}✅ تم البناء بنجاح${NC}"
echo ""

# الخطوة 2: إنشاء ملف ZIP
echo -e "${YELLOW}📦 الخطوة 2: إنشاء ملف ZIP...${NC}"
cd dist
zip -r ../ithraa-deploy-$(date +%Y%m%d-%H%M%S).zip . > /dev/null 2>&1
cd ..
echo -e "${GREEN}✅ تم إنشاء ملف ZIP${NC}"
echo ""

# الخطوة 3: عرض الخيارات
echo -e "${YELLOW}📋 اختر طريقة النشر:${NC}"
echo "1) النشر عبر Git (تلقائي - موصى به)"
echo "2) النشر اليدوي (رفع ملف ZIP)"
echo "3) النشر عبر rsync/SSH (يتطلب إعداد SSH)"
echo ""
read -p "اختر الخيار (1/2/3): " choice

case $choice in
    1)
        echo -e "${YELLOW}🔄 النشر عبر Git...${NC}"
        echo ""
        echo "يجب عليك:"
        echo "1. التأكد من رفع جميع التغييرات إلى GitHub:"
        echo "   git add ."
        echo "   git commit -m 'تحديث للنشر'"
        echo "   git push origin main"
        echo ""
        echo "2. في cPanel:"
        echo "   - اذهب إلى Git Version Control"
        echo "   - اختر المستودع ithraa2"
        echo "   - انقر 'Update from Remote'"
        echo "   - انقر 'Deploy HEAD Commit'"
        echo ""
        echo -e "${GREEN}✅ سيتم النشر تلقائياً بعد git push${NC}"
        ;;
    2)
        echo -e "${YELLOW}📤 النشر اليدوي...${NC}"
        echo ""
        echo "ملفات جاهزة للنشر:"
        echo "📁 مجلد dist: $(du -sh dist | cut -f1)"
        echo "📦 ملف ZIP: $(ls -lh ithraa-deploy-*.zip 2>/dev/null | tail -1 | awk '{print $5}')"
        echo ""
        echo "الخطوات:"
        echo "1. افتح cPanel File Manager"
        echo "2. اذهب إلى public_html"
        echo "3. احذف الملفات القديمة (احتفظ بنسخة احتياطية!)"
        echo "4. ارفع جميع محتويات مجلد dist"
        echo "5. ارفع ملف .htaccess"
        echo ""
        echo -e "${GREEN}✅ الملفات جاهزة للرفع${NC}"
        ;;
    3)
        echo -e "${YELLOW}🔐 النشر عبر SSH...${NC}"
        if command -v rsync &> /dev/null; then
            if command -v sshpass &> /dev/null; then
                echo "📤 رفع الملفات..."
                sshpass -p "$CPANEL_PASS" rsync -avz --delete \
                    -e "ssh -o StrictHostKeyChecking=no -p 22" \
                    dist/ "$CPANEL_USER@$CPANEL_HOST:$REMOTE_DIR/"
                
                # رفع .htaccess
                sshpass -p "$CPANEL_PASS" scp -o StrictHostKeyChecking=no -P 22 \
                    .htaccess "$CPANEL_USER@$CPANEL_HOST:$REMOTE_DIR/"
                
                echo -e "${GREEN}✅ تم النشر بنجاح عبر SSH${NC}"
            else
                echo -e "${RED}❌ sshpass غير مثبت. قم بتثبيته أو استخدم الخيار 2${NC}"
            fi
        else
            echo -e "${RED}❌ rsync غير متوفر${NC}"
        fi
        ;;
    *)
        echo -e "${RED}❌ خيار غير صحيح${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 تم إعداد النشر!${NC}"
echo ""
echo "🔗 رابط الموقع: https://in33.in"
echo ""

