import { registerSW } from 'virtual:pwa-register';
import { offlineSync } from './utils/offlineSync';

// التحقق من وضع التطوير
const isDevelopment = import.meta.env.DEV;

const updateSW = registerSW({
  onNeedRefresh() {
    console.log('تحديث جديد متاح');
    // في وضع التطوير: لا نقوم بالتحديث التلقائي لتجنب إعادة التحميل المستمرة
    if (!isDevelopment) {
      console.log('سيتم تحديث التطبيق تلقائياً');
      updateSW(true);
    } else {
      console.log('وضع التطوير: لا يتم التحديث التلقائي');
    }
  },
  onOfflineReady() {
    console.log('التطبيق جاهز للعمل بدون اتصال بالإنترنت');
  },
  onRegistered(registration) {
    console.log('Service Worker مسجل بنجاح');
    
    // في وضع الإنتاج فقط: فحص التحديثات كل دقيقة
    if (registration && !isDevelopment) {
      setInterval(() => {
        registration.update();
      }, 60000);
    }
  },
  immediate: true,
});

// مزامنة البيانات عند التحديث (في وضع الإنتاج فقط)
if ('serviceWorker' in navigator && !isDevelopment) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CACHE_UPDATED') {
      console.log('تم تحديث الكاش - إعادة تحميل البيانات');
      window.location.reload();
    }
  });
}

// بدء المزامنة عند فتح التطبيق
offlineSync.init().then(() => {
  if (navigator.onLine) {
    offlineSync.syncPendingOperations().catch(console.error);
  }
}).catch(console.error);

export { updateSW };
