import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// تعطيل Service Worker في وضع التطوير بالكامل
if (import.meta.env.PROD) {
  import("./registerSW");
}

createRoot(document.getElementById("root")!).render(<App />);
