export class ThreadManager {
  private worker: Worker | null = null;
  private isSupported: boolean;

  constructor() {
    this.isSupported = typeof window !== 'undefined' && typeof window.Worker !== 'undefined';
  }

  public initWorker(workerScriptUrl: string): void {
    if (!this.isSupported) return;
    try {
      this.worker = new Worker(workerScriptUrl);
    } catch (e) {
      console.warn('Worker initialization fallback:', e);
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
