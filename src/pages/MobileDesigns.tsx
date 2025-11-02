import { Link } from "react-router-dom";

/**
 * صفحة لعرض جميع التصاميم على الجوال بسهولة
 */
export const MobileDesigns = () => {
  const designs = [
    {
      id: 1,
      name: "تصميم عصري بسيط",
      file: "Design1_Modern_Minimalist.html",
      description: "تصميم عصري بألوان متدرجة ونظام Kanban",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: 2,
      name: "تصميم كلاسيكي احترافي",
      file: "Design2_Classic_Professional.html",
      description: "تصميم تقليدي احترافي مناسب للعمل",
      color: "from-blue-600 to-blue-800",
    },
    {
      id: 3,
      name: "تصميم قائم على البطاقات",
      file: "Design3_Card_Based.html",
      description: "تصميم بسيط وواضح يعتمد على البطاقات",
      color: "from-green-400 to-blue-500",
    },
    {
      id: 4,
      name: "الوضع الليلي",
      file: "Design4_Dark_Mode.html",
      description: "تصميم داكن بالكامل مناسب للعمل الليلي",
      color: "from-gray-800 to-gray-900",
    },
    {
      id: 5,
      name: "عرض مقسم",
      file: "Design5_Split_View.html",
      description: "تصميم منظم بثلاثة أقسام واضحة",
      color: "from-indigo-500 to-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎨 تصميمات نظام البريد
          </h1>
          <p className="text-gray-600 text-lg">
            اختر التصميم المفضل لمعاينته
          </p>
        </div>

        {/* Designs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {designs.map((design) => (
            <a
              key={design.id}
              href={`/src/components/email-system/designs/${design.file}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                {/* Gradient Header */}
                <div className={`h-32 bg-gradient-to-r ${design.color} flex items-center justify-center`}>
                  <span className="text-white text-4xl font-bold">
                    {design.id}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                    {design.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {design.description}
                  </p>
                  
                  {/* Action Button */}
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-600 font-semibold text-sm group-hover:underline">
                      عرض التصميم →
                    </span>
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                      <span className="text-indigo-600 group-hover:text-white">→</span>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-12 bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            📱 معلومات الوصول
          </h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              <strong>للوصول من الجوال:</strong> تأكد أن الجوال على نفس WiFi مثل الكمبيوتر
            </p>
            <p>
              <strong>الرابط:</strong> http://YOUR_IP:8080/mobile-designs
            </p>
            <p>
              <strong>للوصول من أي مكان:</strong> استخدم Cloudflare Tunnel أو ngrok
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            ← العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
};

