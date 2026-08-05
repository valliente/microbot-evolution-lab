import { describe, it, expect } from 'vitest';
import { Guardrails } from '../physics/Guardrails';
import { safeSqrt, safeAtan2, normalizeVector, clamp } from '../physics';

describe('Zero-Failure Guardrails & Math Safety Wrappers', () => {
  it('handles NaN and negative values in safeSqrt', () => {
    expect(safeSqrt(NaN)).toBe(0);
    expect(safeSqrt(-25)).toBe(0);
    expect(safeSqrt(16)).toBe(4);
  });

  it('handles NaN in safeAtan2', () => {
    expect(safeAtan2(NaN, 5)).toBe(0);
    expect(safeAtan2(5, NaN)).toBe(0);
    expect(safeAtan2(NaN, NaN)).toBe(0);
  });

  it('prevents division by zero in safeDiv', () => {
    const g = Guardrails.getInstance();
    expect(g.safeDiv(100, 0, 42)).toBe(42);
    expect(g.safeDiv(NaN, 5, 0)).toBe(0);
  });

  it('clamps vector magnitude and sanitizes NaN positions', () => {
    const g = Guardrails.getInstance();
    const pos = g.sanitizePosition(NaN, Infinity, 800, 600);
    expect(pos.x).toBe(400);
    expect(pos.y).toBe(600);

    const norm = normalizeVector(0, 0);
    expect(norm.x).toBe(0);
    expect(norm.y).toBe(0);
  });
});
