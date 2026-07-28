import { resolveWorkerUrl } from '../../utils/pathSanitizer';

export class ThreadManager {
  private worker: Worker | null = null;
  private isSupported: boolean;

  constructor() {
    this.isSupported = typeof window !== 'undefined' && typeof window.Worker !== 'undefined';
  }

  public initWorker(workerScriptUrl: string): void {
    if (!this.isSupported) return;
    try {
      // Use relative URL resolution for Vite dev + packaged file:// compatibility
      const resolvedUrl = resolveWorkerUrl(workerScriptUrl);
      this.worker = new Worker(resolvedUrl, { type: 'module' });
    } catch (e) {
      // Fallback: try direct URL (non-module) for legacy bundlers
      try {
        this.worker = new Worker(workerScriptUrl);
      } catch (e2) {
        console.warn('Worker initialization fallback:', e2);
      }
    }
  }

  public postTask(type: string, payload: any): void {
    if (this.worker) {
      this.worker.postMessage({ type, payload });
    }
  }

  public terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}
