# Changelog

## [v0.1.221] - 2026-08-01
### Added
- Epigenetic Stress Memory engine enabling heritable trauma traits that bypass classic mutation.
- Chemotaxis & Pheromone Navigation allowing organisms to follow and lay chemical trails.
- 3D Phenotype Constellation Visualizer and Genetic Drift Heatmap UI overlays.
- Real-time Epigenome state tracking within the Global Simulation Context.
- Dynamic object pooling for chemical particle emitters.
- Epigenetic profile JSON exporter for analyzing external simulation data.
- "Epigenetic Swarm" world configuration preset.
- Interactive error recovery overlay for catching and displaying unhandled render exceptions.

### Fixed
- Static asset binding errors and web worker path resolution bugs in packaged applications.
- Sub-pixel boundary flickering caused by non-clamped pheromone values.
- Float32Array GC thrashing by implementing zero-allocation pheromone evaporation loops.

### Changed
- Converted simulation canvas to isolated rendering layers (Grid Layer, Trail Layer, Bot Layer) for optimized draw-calls.
- Polished holo-deck CSS for glassmorphism UI element borders on high DPI screens.


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
