import { sanitizePath } from './pathSanitizer';

/**
 * Resolves a dynamic asset URL (images, icons, etc.) for packaged execution contexts
 * such as Electron, Tauri, or NW.js, where absolute paths (e.g. /assets/...) break.
 */
export function resolveAssetUrl(assetPath: string): string {
  const sanitized = sanitizePath(assetPath);
  
  // Use Vite's import.meta.url to dynamically resolve the asset at runtime.
  // This ensures that the bundler preserves the relative structural integrity
  // of the URL in the final built bundle.
  try {
    return new URL(`../assets/${sanitized}`, import.meta.url).href;
  } catch (e) {
    console.warn(`Failed to resolve asset URL for: ${sanitized}`, e);
    // Fallback to relative string if URL construction fails
    return `./assets/${sanitized}`;
  }
}
