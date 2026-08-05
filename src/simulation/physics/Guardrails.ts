import { Microbot, Vector2D } from '../types';

export class Guardrails {
  private static instance: Guardrails;

  private constructor() {}

  public static getInstance(): Guardrails {
    if (!Guardrails.instance) {
      Guardrails.instance = new Guardrails();
    }
    return Guardrails.instance;
  }

  public safeSqrt(val: number): number {
    if (isNaN(val) || val <= 0) return 0;
    return Math.sqrt(val);
  }

  public safeAtan2(y: number, x: number): number {
    if (isNaN(y) || isNaN(x)) return 0;
    return Math.atan2(y, x);
  }

  public safeDiv(numerator: number, denominator: number, fallback: number = 0): number {
    if (isNaN(numerator) || isNaN(denominator) || denominator === 0) return fallback;
    const result = numerator / denominator;
    return isFinite(result) ? result : fallback;
  }

  public clampVector(vec: Vector2D, maxMag: number = 1000): Vector2D {
    const x = isNaN(vec.x) || !isFinite(vec.x) ? 0 : vec.x;
    const y = isNaN(vec.y) || !isFinite(vec.y) ? 0 : vec.y;
    const mag = this.safeSqrt(x * x + y * y);
    if (mag > maxMag) {
      const scale = maxMag / mag;
      return { x: x * scale, y: y * scale };
    }
    return { x, y };
  }

  public sanitizePosition(x: number, y: number, boundsWidth: number, boundsHeight: number): { x: number; y: number } {
    let cleanX = isNaN(x) || !isFinite(x) ? boundsWidth / 2 : x;
    let cleanY = isNaN(y) || !isFinite(y) ? boundsHeight / 2 : y;
    cleanX = Math.max(0, Math.min(boundsWidth, cleanX));
    cleanY = Math.max(0, Math.min(boundsHeight, cleanY));
    return { x: cleanX, y: cleanY };
  }

  public sanitizeMicrobotState(bot: Microbot, boundsWidth: number, boundsHeight: number): void {
    const pos = this.sanitizePosition(bot.x, bot.y, boundsWidth, boundsHeight);
    bot.x = pos.x;
    bot.y = pos.y;
    bot.vx = isNaN(bot.vx) || !isFinite(bot.vx) ? 0 : Math.max(-10, Math.min(10, bot.vx));
    bot.vy = isNaN(bot.vy) || !isFinite(bot.vy) ? 0 : Math.max(-10, Math.min(10, bot.vy));
    bot.speed = isNaN(bot.speed) || !isFinite(bot.speed) ? 2.0 : Math.max(0.5, Math.min(10, bot.speed));
    bot.battery = isNaN(bot.battery) || !isFinite(bot.battery) ? bot.maxBattery : Math.max(0, Math.min(bot.maxBattery, bot.battery));
  }
}
