import type { CapacitorConfig } from '@capacitor/cli';

const serverUrl = process.env.CAPACITOR_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'com.anthony.pkm',
  appName: 'PKM',
  webDir: 'out',
  ...(serverUrl
    ? {
        server: {
          url: serverUrl,
          cleartext: serverUrl.startsWith("http://"),
        },
      }
    : {}),
  plugins: {
    SocialLogin: {
      google: {
        webClientId: '1069048826472-1c3nmurr51nv8cq6di0smp99vs3gq6gg.apps.googleusercontent.com',
      },
    },
    CapacitorCookies: {
      enabled: true,
    },
  },
};

export default config;
