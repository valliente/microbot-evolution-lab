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

  public initWorker(workerScriptUrl: string | URL): void {
    if (!this.isSupported || this.errorStrikes >= this.maxStrikes) return;
    this.workerScriptUrl = typeof workerScriptUrl === 'string' ? workerScriptUrl : workerScriptUrl.href;
    try {
      const resolvedUrl = typeof workerScriptUrl === 'string' ? resolveWorkerUrl(workerScriptUrl) : workerScriptUrl;
      this.worker = new Worker(resolvedUrl, { type: 'module' });
    } catch (e) {
      try {
        this.worker = new Worker(this.workerScriptUrl);
      } catch (e2) {
        console.warn('Worker initialization fallback:', e2);
      }
    }

    if (this.worker) {
      this.worker.onerror = (err) => {
        console.error('Web Worker Error:', err);
        this.errorStrikes++;
        this.terminate();
        if (this.errorStrikes <= this.maxStrikes) {
          console.log(`Self-healing Worker Auto-Restarting (Attempt ${this.errorStrikes}/${this.maxStrikes})...`);
          setTimeout(() => {
            this.initWorker(this.workerScriptUrl);
            if (this.onWorkerRestarted) {
              this.onWorkerRestarted();
            }
          }, 500);
        } else {
          console.error('Worker exceeded max retry strikes, operating in main thread fallback.');
        }
      };
    }
  }

  public onWorkerRestarted?: () => void;

  public resetStrikes(): void {
    this.errorStrikes = 0;
  }

  private lastStateSnapshot: any = null;

  public saveSnapshot(snapshot: any): void {
    this.lastStateSnapshot = snapshot;
    this.postTask('RESTORE_SNAPSHOT', { snapshot });
  }

  public postTask(type: string, payload: any): void {
    if (type === 'RESTORE_SNAPSHOT') {
      this.lastStateSnapshot = payload.snapshot;
    }
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
