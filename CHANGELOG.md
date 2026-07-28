# Changelog

## [v0.1.208] - 2026-07-28
### Added
- Sub-stepping Continuous Collision Detection (CCD) for high-speed microbots.
- Auto-restart sequence (3 strikes) for Web Workers on error.
- Unit and integration testing suites for physics, memory, and genetics.
- ISO 8601 formatting for CSV telemetry export timestamps.

### Fixed
- NaN position errors caused by zero-velocity vector normalization.
- Microbots clipping through boundaries at high simulation speeds.
- Off-by-one generation counting in lineage tree tracking.
- Out-of-bounds chromosome mutations exceeding strict lower/upper bounds.
- UI state freeze in Bot Data Hub when the tracked bot dies.
- Speed scrubber value not syncing correctly with actual simulation tick rate.
- Inactive canvas event listeners leaking memory on simulation reset.
- Orphaned Web Worker contexts persisting in memory across simulation resets.
- Ghost audio hums left behind from improper AudioContext teardown.
- Scrollbar clipping on high-DPI screens inside floating UI panels.
- JSON preset loading crashes from legacy formatted configurations.
- Multi-layer redraw flickering in SimulationCanvas.
- Path resolution for static assets (workers) when running in packaged bundles.

### Changed
- Refined delta-time calculations in MicrobotEngine to prevent massive jumps on tab resume.
- Optimized Quadtree node splitting to prevent N-squared bottlenecks when entities occupy identical coordinates.
- Throttled React state updates in TelemetryManager using requestAnimationFrame to avoid render thrashing.
- Tweaked glowing border drop-shadows and dark slate contrast variables.
- Improved accordion click responsiveness and hover transition states.
