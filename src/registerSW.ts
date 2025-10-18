import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    // يمكن إضافة notification للمستخدم هنا
    console.log('تحديث جديد متاح - سيتم تحديث التطبيق تلقائياً');
  },
  onOfflineReady() {
    console.log('التطبيق جاهز للعمل بدون اتصال بالإنترنت');
  },
  immediate: true,
});

// تحديث التطبيق تلقائياً كل 60 ثانية إذا كان هناك تحديث
setInterval(() => {
  updateSW();
}, 60000);

export { updateSW };
