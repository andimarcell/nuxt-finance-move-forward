import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.universal.finance',
  appName: 'Financial App',
  webDir: '.output/public',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      '*.supabase.co',
      '*'
    ]
  },
  plugins: {
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0F172A",
      showSpinner: false
    }
  }
};

export default config;