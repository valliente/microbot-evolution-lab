export interface WorkerMessage<T = any> {
  type: string;
  payload: T;
  requestId?: string;
}

export function createWorkerMessage<T>(type: string, payload: T, requestId?: string): WorkerMessage<T> {
  return { type, payload, requestId };
}
