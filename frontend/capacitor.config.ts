import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.anthony.pkm',
  appName: 'PKM',
  webDir: 'out',
  server: {
    // Replace with your Vercel URL when deploying to production
    url: 'http://10.0.2.2:3000', // Default Android emulator localhost equivalent
    cleartext: true
  }
};

export default config;
