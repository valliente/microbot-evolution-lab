# Microbot Evolution Lab - Release Notes

## Version 0.1.206 (Production Release)

### 🔧 Critical Bug Fixes
- **Audio Engine Overhaul**: Fixed the corrupted oscillator loops causing weird pitch/buzzing noises during runtime. The audio engine now starts **muted by default**, rate-limits oscillator spawns (80ms cooldown), caps concurrent oscillators at 4, clamps frequencies to a sane 220–880 Hz range, and removes the ambient drone that caused persistent background buzzing.
- **Master Volume Control**: Added a dedicated master volume slider and quick mute/unmute toggle button in the header toolbar.

### ⚡ Performance Optimizations
- **Layered Canvas Rendering**: Split the static background grid into a cached offscreen canvas layer that only redraws on resize, eliminating per-frame grid redraw overhead.
- **Object Pool Expansion**: Added `trailPointPool` and `foodParticlePool` alongside the existing `rayPool` to reduce garbage collection hitches.
- **Quadtree Depth Guard**: Raised node capacity to 12 and added a max depth guard (8 levels) to prevent runaway recursive subdivision during high-population spikes.
- **React.memo Chart Optimization**: Wrapped `GeneticDiversityChart` in `React.memo` with `useMemo` to prevent unnecessary re-renders every animation frame.

### 🎨 UI Polish
- **Glassmorphism Enhancement**: Increased panel opacity to 0.82, sharpened border contrast to 0.30, added smooth hover glow transitions on both `.glass-panel` and `.glass-deck-pill` elements.
- **Accordion Animations**: Added smooth `max-height` + `opacity` CSS transitions to collapsible parameter sections.
- **Bioluminescent Trails**: Replaced flat movement trails with per-segment fading alpha gradients and thickening line widths.
- **Directional Heading Vectors**: Added a visible heading line ahead of each microbot for clearer movement direction visualization.

### 🧪 Testing
- Audio context initialization, mute state toggling, and volume clamping unit tests.
- Performance stress test: 100 engine ticks at max population to verify framerate stability.

## Version 0.1.205 (Production Release)
- Web Worker Multi-Threading & OffscreenCanvas rendering
- Epigenetic Gene Expression engine
- Symbiosis & Parasitism mechanics
- 3D Genetic Constellation Map with PNG export
