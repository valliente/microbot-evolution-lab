import { resolveWorkerUrl } from '../../utils/pathSanitizer';

export class ThreadManager {
  private worker: Worker | null = null;
  private isSupported: boolean;
  private workerScriptUrl: string = '';
  private errorStrikes: number = 0;
  private maxStrikes: number = 3;

  constructor() {
    this.isSupported = typeof window !== 'undefined' && typeof window.Worker !== 'undefined';
  }

  public initWorker(workerScriptUrl: string): void {
    if (!this.isSupported || this.errorStrikes >= this.maxStrikes) return;
    this.workerScriptUrl = workerScriptUrl;
    try {
      const resolvedUrl = resolveWorkerUrl(workerScriptUrl);
      this.worker = new Worker(resolvedUrl, { type: 'module' });
    } catch (e) {
      try {
        this.worker = new Worker(workerScriptUrl);
      } catch (e2) {
        console.warn('Worker initialization fallback:', e2);
      }
    }

    if (this.worker) {
      this.worker.onerror = (err) => {
        console.error('Web Worker Error:', err);
        this.errorStrikes++;
        this.terminate();
        if (this.errorStrikes < this.maxStrikes) {
          console.log(`Restarting Worker (Strike ${this.errorStrikes}/${this.maxStrikes})...`);
          setTimeout(() => this.initWorker(this.workerScriptUrl), 1000);
        } else {
          console.error('Worker failed 3 times, giving up.');
        }
      };
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
