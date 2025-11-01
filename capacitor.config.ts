import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ithraa.app',
  appName: 'إثراء - ITHRAA',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // للتطوير: أزل التعليق واستخدم الرابط التالي
    // url: 'https://your-domain.com',
    // cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#007dff',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      spinnerColor: '#ffffff',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#007dff',
    },
  },
};

export default config;
