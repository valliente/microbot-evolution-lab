export function sanitizePath(relativePath: string): string {
  // Determine if running in a packaged Electron/Tauri/NW.js context
  const isPackaged = 
    window.location.protocol === 'file:' || 
    window.location.href.includes('app.asar') ||
    window.location.protocol === 'tauri:' ||
    window.location.href.includes('android_asset');

  // Fix(build): implement dynamic import.meta.env pathing for packaged assets
  let cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;

  // Android file & Capacitor asset protocol fix
  if (window.location.href.includes('android_asset') || window.location.origin === 'https://localhost' || window.location.protocol === 'file:' || window.location.protocol === 'capacitor:') {
    const basePath = window.location.href.split('index.html')[0];
    return basePath.endsWith('/') ? `${basePath}${cleanPath}` : `${basePath}/${cleanPath}`;
  }

  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) {
    const base = import.meta.env.BASE_URL;
    let resolved = base.endsWith('/') ? `${base}${cleanPath}` : `${base}/${cleanPath}`;
    if (resolved.startsWith('/')) resolved = '.' + resolved;
    return resolved;
  }

  if (!isPackaged) {
    return relativePath;
  }

  // Ensure we don't duplicate base paths in bundled environments
  if (cleanPath.startsWith('./')) {
    cleanPath = cleanPath.substring(2);
  }

  return cleanPath;
}

export function resolveWorkerUrl(workerPath: string): string {
  let sanitizedPath = sanitizePath(workerPath);
  if (sanitizedPath.startsWith('/')) {
    sanitizedPath = '.' + sanitizedPath;
  }
  try {
    const base = typeof window !== 'undefined' ? window.location.href : 'http://localhost';
    return new URL(sanitizedPath, base).href;
  } catch (e) {
    // Fallback if URL resolution fails in bundled context
    return sanitizedPath;
  }
}

export function resolveShaderUrl(shaderPath: string): string {
  const resolved = sanitizePath(shaderPath);
  if (resolved.startsWith('./')) return resolved;
  return resolved.startsWith('/') ? '.' + resolved : './' + resolved;
}

export function resolveWasmUrl(wasmPath: string): string {
  const clean = sanitizePath(wasmPath);
  if (typeof window !== 'undefined' && window.location.href.includes('android_asset')) {
    return clean.replace('file://', '');
  }
  return clean;
}
