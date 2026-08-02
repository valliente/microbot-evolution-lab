export const getAssetPath = (path: string): string => {
  // Enforce dynamic relative path resolution for Android/Capacitor
  // In Capacitor, the base URL can vary.
  const isAndroid = typeof window !== 'undefined' && (window as any).Capacitor?.isNative;
  
  if (path.startsWith('/')) {
    path = path.slice(1);
  }
  
  if (isAndroid) {
    return `public/assets/${path}`; // Capacitor typically serves from public or android_asset
  }
  return `./${path}`; // Relative for standard web deployments
};
