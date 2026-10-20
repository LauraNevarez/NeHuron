import {NativeModules, Platform} from 'react-native';

const Native = NativeModules.BlockerModule;
const isAndroid = Platform.OS === 'android' && !!Native;

const BlockerNative = {
  isAccessibilityEnabled: async () => (isAndroid ? Native.isAccessibilityEnabled() : false),
  isOverlayEnabled: async () => (isAndroid ? Native.isOverlayEnabled() : false),
  isBatteryOptimizationIgnored: async () => (isAndroid && Native.isBatteryOptimizationIgnored ? Native.isBatteryOptimizationIgnored() : true),
  requestIgnoreBatteryOptimization: () => isAndroid && Native.requestIgnoreBatteryOptimization && Native.requestIgnoreBatteryOptimization(),
  openAccessibilitySettings: () => isAndroid && Native.openAccessibilitySettings(),
  openOverlaySettings: () => isAndroid && Native.openOverlaySettings(),
  setBlockedPackages: async packages => (isAndroid ? Native.setBlockedPackages(packages) : null),
  startBlocking: async () => (isAndroid ? Native.startBlocking() : null),
  stopBlocking: async () => (isAndroid ? Native.stopBlocking() : null),
  setGraceBreak: async minutes => (isAndroid && Native.setGraceBreak ? Native.setGraceBreak(minutes) : null),
  endGraceBreak: async () => (isAndroid && Native.endGraceBreak ? Native.endGraceBreak() : null),
  pickImage: async () => (isAndroid && Native.pickImage ? Native.pickImage() : null),

  hasAllPermissions: async () => {
    if (!isAndroid) return false;
    const [a, o] = await Promise.all([Native.isAccessibilityEnabled(), Native.isOverlayEnabled()]);
    return a && o;
  },
};

export default BlockerNative;
