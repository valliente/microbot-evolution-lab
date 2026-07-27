export class OffscreenCanvasHelper {
  public static isSupported(): boolean {
    return typeof window !== 'undefined' && typeof (HTMLCanvasElement.prototype as any).transferControlToOffscreen === 'function';
  }

  public static createOffscreen(canvas: HTMLCanvasElement): any | null {
    if (this.isSupported()) {
      try {
        return (canvas as any).transferControlToOffscreen();
      } catch (e) {
        return null;
      }
    }
    return null;
  }
}
