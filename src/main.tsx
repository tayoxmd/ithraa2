import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// تعطيل Service Worker في وضع التطوير بالكامل
// فقط في وضع الإنتاج: استيراد registerSW
if (import.meta.env.PROD) {
  // Dynamic import لتجنب أخطاء في وضع التطوير
  import("./registerSW").catch(() => {
    // تجاهل الأخطاء في وضع التطوير
    console.log('Service Worker غير متوفر في وضع التطوير');
  });
}

createRoot(document.getElementById("root")!).render(<App />);
