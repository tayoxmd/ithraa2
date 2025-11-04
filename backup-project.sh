#!/bin/bash

# سكريبت النسخ الاحتياطي للمشروع
# يحفظ جميع الملفات المهمة (بدون node_modules و dist)

set -e

# الانتقال إلى مجلد المشروع
cd "$(dirname "$0")"

# إنشاء اسم ملف النسخة الاحتياطية
BACKUP_DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_NAME="ithraa-backup-${BACKUP_DATE}"
BACKUP_DIR="${HOME}/${BACKUP_NAME}"
ZIP_FILE="${HOME}/${BACKUP_NAME}.zip"

echo "📦 بدء إنشاء نسخة احتياطية..."
echo ""

# إنشاء مجلد النسخة الاحتياطية
mkdir -p "${BACKUP_DIR}"

# نسخ الملفات المهمة
echo "📋 نسخ الملفات..."

# نسخ الكود المصدري
rsync -av --progress \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude '.git' \
  --exclude '.DS_Store' \
  --exclude '*.log' \
  --exclude '.vite' \
  --exclude 'android/app/build' \
  --exclude 'android/.gradle' \
  --exclude 'android/build' \
  ./ "${BACKUP_DIR}/"

# نسخ معلومات Git (اختياري)
if [ -d ".git" ]; then
  echo "📚 نسخ معلومات Git..."
  cp -r .git "${BACKUP_DIR}/.git" 2>/dev/null || echo "⚠️  تم تخطي .git (حجم كبير)"
fi

# إنشاء ملف معلومات
cat > "${BACKUP_DIR}/BACKUP_INFO.txt" << EOF
نسخة احتياطية من مشروع إثراء
تاريخ الإنشاء: $(date)
المسار الأصلي: $(pwd)
الإصدار: $(git rev-parse HEAD 2>/dev/null || echo "غير معروف")
الفرع: $(git branch --show-current 2>/dev/null || echo "غير معروف")

ملاحظات:
- هذا النسخة الاحتياطية لا تحتوي على node_modules
- قم بتشغيل 'npm install' بعد الاستعادة
- راجع ملف BACKUP_AND_RESTORE.md للتعليمات الكاملة
EOF

# ضغط الملفات
echo ""
echo "🗜️  ضغط الملفات..."
cd "${HOME}"
zip -r "${ZIP_FILE}" "${BACKUP_NAME}" -q

# حذف المجلد المؤقت
rm -rf "${BACKUP_DIR}"

# عرض معلومات النسخة الاحتياطية
FILE_SIZE=$(du -h "${ZIP_FILE}" | cut -f1)

echo ""
echo "✅ تم إنشاء النسخة الاحتياطية بنجاح!"
echo ""
echo "📁 الموقع: ${ZIP_FILE}"
echo "📊 الحجم: ${FILE_SIZE}"
echo ""
echo "💡 للاستعادة:"
echo "   1. انسخ الملف إلى الكمبيوتر الجديد"
echo "   2. فك الضغط: unzip ${BACKUP_NAME}.zip"
echo "   3. شغل: cd ${BACKUP_NAME} && npm install && npm run dev"
echo ""

