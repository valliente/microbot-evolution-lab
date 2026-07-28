export function sanitizePath(relativePath: string): string {
  // Determine if running in a packaged Electron/Tauri/NW.js context
  const isPackaged = 
    window.location.protocol === 'file:' || 
    window.location.href.includes('app.asar') ||
    window.location.protocol === 'tauri:';

  if (!isPackaged) {
    return relativePath;
  }

  // Sanitize for file:// context where absolute paths break
  let cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
  
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
