import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wazifah.tasbeeh',
  appName: 'Wazifah Tasbeeh',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Haptics: {
      enabled: true
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#020617'
    }
  }
};

export default config;
