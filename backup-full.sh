#!/bin/bash

# سكريبت النسخ الاحتياطي الكامل
# يحفظ جميع الملفات بما في ذلك node_modules و dist

set -e

# الانتقال إلى مجلد المشروع
cd "$(dirname "$0")"

# إنشاء اسم ملف النسخة الاحتياطية
BACKUP_DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_NAME="ithraa-full-backup-${BACKUP_DATE}"
BACKUP_DIR="${HOME}/${BACKUP_NAME}"
ZIP_FILE="${HOME}/${BACKUP_NAME}.zip"

echo "📦 بدء إنشاء نسخة احتياطية كاملة..."
echo "⚠️  تحذير: هذه النسخة ستكون كبيرة الحجم!"
echo ""

# إنشاء مجلد النسخة الاحتياطية
mkdir -p "${BACKUP_DIR}"

# نسخ جميع الملفات
echo "📋 نسخ جميع الملفات (قد يستغرق وقتاً)..."
rsync -av --progress \
  --exclude '.git' \
  --exclude '.DS_Store' \
  --exclude '*.log' \
  --exclude 'android/app/build' \
  --exclude 'android/.gradle' \
  --exclude 'android/build' \
  ./ "${BACKUP_DIR}/"

# إنشاء ملف معلومات
cat > "${BACKUP_DIR}/BACKUP_INFO.txt" << EOF
نسخة احتياطية كاملة من مشروع إثراء
تاريخ الإنشاء: $(date)
المسار الأصلي: $(pwd)
الإصدار: $(git rev-parse HEAD 2>/dev/null || echo "غير معروف")
الفرع: $(git branch --show-current 2>/dev/null || echo "غير معروف")

ملاحظات:
- هذه نسخة احتياطية كاملة تحتوي على node_modules
- لا حاجة لتشغيل 'npm install' بعد الاستعادة
- راجع ملف BACKUP_AND_RESTORE.md للتعليمات الكاملة
EOF

# ضغط الملفات
echo ""
echo "🗜️  ضغط الملفات (قد يستغرق وقتاً طويلاً)..."
cd "${HOME}"
zip -r "${ZIP_FILE}" "${BACKUP_NAME}" -q

# حذف المجلد المؤقت
rm -rf "${BACKUP_DIR}"

# عرض معلومات النسخة الاحتياطية
FILE_SIZE=$(du -h "${ZIP_FILE}" | cut -f1)

echo ""
echo "✅ تم إنشاء النسخة الاحتياطية الكاملة بنجاح!"
echo ""
echo "📁 الموقع: ${ZIP_FILE}"
echo "📊 الحجم: ${FILE_SIZE}"
echo ""
echo "💡 للاستعادة:"
echo "   1. انسخ الملف إلى الكمبيوتر الجديد"
echo "   2. فك الضغط: unzip ${BACKUP_NAME}.zip"
echo "   3. شغل: cd ${BACKUP_NAME} && npm run dev"
echo ""

