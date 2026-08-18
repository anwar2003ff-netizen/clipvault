import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'app.clipvault.mobile',
  appName: 'ClipVault',
  webDir: 'dist',
  backgroundColor: '#0B0B0D',
  android: {
    allowMixedContent: false,
  },
}

export default config
