#!/bin/bash

# 🚀 سكريبت لإعداد الوصول من الجوال

echo "📱 إعداد الوصول من الجوال..."
echo ""

# الحصول على IP المحلي
IP=$(ipconfig getifaddr en0 2>/dev/null || ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

if [ -z "$IP" ]; then
    echo "❌ لم يتم العثور على IP. تأكد من الاتصال بـ WiFi."
    exit 1
fi

echo "✅ تم العثور على IP: $IP"
echo ""
echo "📋 الخيارات المتاحة:"
echo ""
echo "1️⃣  الوصول عبر IP المحلي (الأسهل - يحتاج نفس WiFi)"
echo "   👉 افتح في الجوال: http://$IP:8080"
echo ""
echo "2️⃣  استخدام ngrok (يعمل من أي مكان)"
echo "   👉 شغل: ngrok http 8080"
echo ""
echo "3️⃣  استخدام Cloudflare Tunnel (مجاني - يعمل من أي مكان)"
echo "   👉 شغل: cloudflared tunnel --url http://localhost:8080"
echo ""
echo ""

# التحقق من وجود ngrok
if command -v ngrok &> /dev/null; then
    echo "✅ ngrok مثبت - يمكنك استخدامه"
else
    echo "ℹ️  لتثبيت ngrok: brew install ngrok"
fi

# التحقق من وجود cloudflared
if command -v cloudflared &> /dev/null; then
    echo "✅ cloudflared مثبت - يمكنك استخدامه"
else
    echo "ℹ️  لتثبيت cloudflared: brew install cloudflared"
fi

echo ""
echo "🚀 جاري تشغيل الخادم..."
echo ""

# تشغيل الخادم مع host 0.0.0.0
cd "$(dirname "$0")"
npm run dev -- --host 0.0.0.0



