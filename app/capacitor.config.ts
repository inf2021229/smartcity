import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'Smart City',
  webDir: 'dist',
  plugins: {
    Keyboard: {
      resize: 'none',           // or 'body' if you prefer
    },
  },
};

export default config;
