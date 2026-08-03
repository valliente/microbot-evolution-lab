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

export const getWorkerPath = (workerFile: string): string => {
  return getAssetPath(`workers/${workerFile}`);
};

export const getShaderPath = (shaderFile: string): string => {
  return getAssetPath(`shaders/${shaderFile}`);
};

export const sanitizeAndroidPath = (uri: string): string => {
  if (uri.startsWith('file:///android_asset/')) {
    return uri.replace('file:///android_asset/', 'https://localhost/');
  }
  return uri;
};
