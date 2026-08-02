import { describe, it, expect, vi } from 'vitest';
import { spatialAudio } from '../audio/SpatialAudioSynth';

describe('Spatial Audio Synth', () => {
  it('should initialize correctly as muted', () => {
    expect(spatialAudio.getMuted()).toBe(true);
  });

  it('should toggle mute state', () => {
    const isMuted = spatialAudio.getMuted();
    const newState = spatialAudio.toggleMute();
    expect(newState).toBe(!isMuted);
  });

  it('should handle play commands safely without throwing when muted or in headless environments', () => {
    // Should not throw
    expect(() => {
      spatialAudio.playSpeciationEvent(400);
      spatialAudio.playExtinctionEvent(100);
      spatialAudio.playAmbientDrone(1, 0.5);
    }).not.toThrow();
  });
});
