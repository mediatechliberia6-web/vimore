import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cfd.mediatech.vimore',
  appName: 'ViMore',
  webDir: 'public',
  server: {
    androidScheme: 'https',
    url: 'https://vimore.cfd',
    cleartext: false,
    allowNavigation: [
      'vimore.cfd',
      '*.vimore.cfd',
      'mediatechliberia.online',
      '*.mediatechliberia.online',
    ],
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
