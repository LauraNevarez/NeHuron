import {NativeModules, Platform} from 'react-native';

const Native = NativeModules.BlockerModule;
const isAndroid = Platform.OS === 'android' && !!Native;

const BlockerNative = {
  isAccessibilityEnabled: async () => (isAndroid ? Native.isAccessibilityEnabled() : false),
  isOverlayEnabled: async () => (isAndroid ? Native.isOverlayEnabled() : false),
  openAccessibilitySettings: () => isAndroid && Native.openAccessibilitySettings(),
  openOverlaySettings: () => isAndroid && Native.openOverlaySettings(),
  setBlockedPackages: async packages => (isAndroid ? Native.setBlockedPackages(packages) : null),
  startBlocking: async () => (isAndroid ? Native.startBlocking() : null),
  stopBlocking: async () => (isAndroid ? Native.stopBlocking() : null),

  hasAllPermissions: async () => {
    if (!isAndroid) return false;
    const [a, o] = await Promise.all([Native.isAccessibilityEnabled(), Native.isOverlayEnabled()]);
    return a && o;
  },
};

export default BlockerNative;
