#!/bin/bash

# سكريبت لحفظ ملف .env بشكل آمن

set -e

cd "$(dirname "$0")"

if [ ! -f ".env" ]; then
  echo "⚠️  لم يتم العثور على ملف .env"
  exit 1
fi

BACKUP_DATE=$(date +"%Y-%m-%d_%H-%M-%S")
ENV_BACKUP="${HOME}/ithraa-env-backup-${BACKUP_DATE}.txt"

# نسخ ملف .env
cp .env "${ENV_BACKUP}"

echo "✅ تم حفظ ملف .env بنجاح!"
echo ""
echo "📁 الموقع: ${ENV_BACKUP}"
echo ""
echo "💡 للاستعادة على كمبيوتر آخر:"
echo "   cp ${ENV_BACKUP} /path/to/project/.env"
echo ""
echo "⚠️  مهم: احفظ هذا الملف في مكان آمن ولا تشاركه!"

