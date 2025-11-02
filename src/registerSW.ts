// Service Worker Registration
// هذا الملف يُستخدم فقط في وضع الإنتاج
// في وضع التطوير، لا يتم استيراده على الإطلاق من main.tsx

// هذا الملف يجب أن يُستورد فقط عندما يكون VitePWA مفعّل (وضع الإنتاج)
// في وضع التطوير، VitePWA معطل، لذلك virtual:pwa-register غير متوفر

// الحل: جعل كل الكود داخل try-catch وتأخير الاستيراد

let updateSW: any = null;

try {
  // Dynamic import - سيتم فقط في وضع الإنتاج
  if (typeof window !== 'undefined' && import.meta.env.PROD) {
    import('virtual:pwa-register').then((module) => {
      const { registerSW } = module;
      import('./utils/offlineSync').then(({ offlineSync }) => {
        updateSW = registerSW({
          onNeedRefresh() {
            console.log('تحديث جديد متاح - سيتم تحديث التطبيق تلقائياً');
            if (updateSW) updateSW(true);
          },
          onOfflineReady() {
            console.log('التطبيق جاهز للعمل بدون اتصال بالإنترنت');
          },
          onRegistered(registration) {
            console.log('Service Worker مسجل بنجاح');
            if (registration) {
              setInterval(() => {
                registration.update();
              }, 60000);
            }
          },
          immediate: true,
        });

        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'CACHE_UPDATED') {
              console.log('تم تحديث الكاش - إعادة تحميل البيانات');
              window.location.reload();
            }
          });
        }

        offlineSync.init().then(() => {
          if (navigator.onLine) {
            offlineSync.syncPendingOperations().catch(console.error);
          }
        }).catch(console.error);
      }).catch(() => {
        console.log('offlineSync غير متوفر');
      });
    }).catch(() => {
      console.log('Service Worker غير متوفر في وضع التطوير');
    });
  }
} catch (error) {
  console.log('Service Worker غير متوفر:', error);
}

export { updateSW };
