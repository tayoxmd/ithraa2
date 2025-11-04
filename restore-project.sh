#!/bin/bash

# سكريبت استعادة المشروع من نسخة احتياطية

set -e

echo "🔄 دليل استعادة المشروع"
echo ""
echo "اختر طريقة الاستعادة:"
echo "1) من Git (الأسهل والأفضل)"
echo "2) من ملف ZIP"
echo ""
read -p "اختر رقم (1 أو 2): " choice

case $choice in
  1)
    echo ""
    echo "📥 الاستعادة من Git..."
    echo ""
    
    # التحقق من Git
    if ! command -v git &> /dev/null; then
      echo "❌ Git غير مثبت. قم بتثبيته أولاً:"
      echo "   macOS: brew install git"
      echo "   أو حمّل من: https://git-scm.com/downloads"
      exit 1
    fi
    
    read -p "أدخل رابط Git repository: " repo_url
    read -p "أدخل مسار الاستعادة (افتراضي: ~/Documents/GitHub/ithraa): " restore_path
    
    RESTORE_PATH=${restore_path:-"$HOME/Documents/GitHub/ithraa"}
    
    echo ""
    echo "📂 استنساخ المشروع إلى: ${RESTORE_PATH}"
    mkdir -p "$(dirname "${RESTORE_PATH}")"
    git clone "${repo_url}" "${RESTORE_PATH}"
    
    cd "${RESTORE_PATH}"
    
    echo ""
    echo "📦 تثبيت التبعيات..."
    
    # تحميل nvm
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    
    # استخدام Node.js 20
    if ! nvm use 20 2>/dev/null; then
      echo "📥 تثبيت Node.js 20..."
      nvm install 20
      nvm use 20
    fi
    
    npm install
    
    echo ""
    echo "✅ تم الاستعادة بنجاح!"
    echo ""
    echo "🚀 لتشغيل المشروع:"
    echo "   cd ${RESTORE_PATH}"
    echo "   ./start-dev.sh"
    echo "   أو"
    echo "   npm run dev"
    ;;
    
  2)
    echo ""
    echo "📥 الاستعادة من ملف ZIP..."
    echo ""
    
    read -p "أدخل مسار ملف ZIP: " zip_path
    
    if [ ! -f "${zip_path}" ]; then
      echo "❌ الملف غير موجود: ${zip_path}"
      exit 1
    fi
    
    read -p "أدخل مسار الاستعادة (افتراضي: ~/Documents/GitHub): " restore_dir
    
    RESTORE_DIR=${restore_dir:-"$HOME/Documents/GitHub"}
    
    echo ""
    echo "📂 فك الضغط إلى: ${RESTORE_DIR}"
    cd "${RESTORE_DIR}"
    unzip -q "${zip_path}"
    
    # البحث عن مجلد المشروع
    EXTRACTED_DIR=$(find . -maxdepth 1 -type d -name "ithraa*" | head -1)
    
    if [ -z "${EXTRACTED_DIR}" ]; then
      echo "❌ لم يتم العثور على مجلد المشروع"
      exit 1
    fi
    
    cd "${EXTRACTED_DIR}"
    
    # التحقق من وجود node_modules
    if [ ! -d "node_modules" ]; then
      echo ""
      echo "📦 تثبيت التبعيات..."
      
      # تحميل nvm
      export NVM_DIR="$HOME/.nvm"
      [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
      
      # استخدام Node.js 20
      if ! nvm use 20 2>/dev/null; then
        echo "📥 تثبيت Node.js 20..."
        nvm install 20
        nvm use 20
      fi
      
      npm install
    else
      echo "✅ تم العثور على node_modules - لا حاجة للتثبيت"
    fi
    
    FULL_PATH=$(pwd)
    
    echo ""
    echo "✅ تم الاستعادة بنجاح!"
    echo ""
    echo "🚀 لتشغيل المشروع:"
    echo "   cd ${FULL_PATH}"
    echo "   ./start-dev.sh"
    echo "   أو"
    echo "   npm run dev"
    ;;
    
  *)
    echo "❌ اختيار غير صحيح"
    exit 1
    ;;
esac

