export function sanitizePath(relativePath: string): string {
  // Determine if running in a packaged Electron/Tauri/NW.js context
  const isPackaged = 
    window.location.protocol === 'file:' || 
    window.location.href.includes('app.asar') ||
    window.location.protocol === 'tauri:';

  // Fix(build): implement dynamic import.meta.env pathing for packaged assets
  let cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;

  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) {
    const base = import.meta.env.BASE_URL;
    return base.endsWith('/') ? `${base}${cleanPath}` : `${base}/${cleanPath}`;
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
  const sanitizedPath = sanitizePath(workerPath);
  try {
    return new URL(sanitizedPath, import.meta.url).href;
  } catch (e) {
    // Fallback if URL resolution fails in bundled context
    return sanitizedPath;
  }
}
