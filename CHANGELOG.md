# Changelog
# Microbot Evolution Lab Changelog

## [v0.1.226] - 2026-08-06
### Added
- **WASM SIMD Spatial Hashing**: AssemblyScript SIMD spatial grid partitioning (`spatial.wasm`) with zero-copy ArrayBuffer transfer pipeline between JS and WebAssembly.
- **Dynamic Phenotype Structural Morphing**: Gene-to-geometry structural morphing maps generating custom armor plates, thrust fins, and bioluminescent lure visual shaders.
- **Autonomous Sandbox Harness**: Automated harness runner for unattended 1,000-generation long runs with crash detection and state recovery.
- **Phenotype Inspector Modal**: Interactive UI modal inspecting active bot armor, fins, and lure glow metrics.
- **WASM Throughput & Memory Telemetry**: WASM Memory & Spatial Hash metrics gauge and Float32Array ring buffers.

## [v0.1.225] - 2026-08-05
### Added
- **Zero-Failure Boundary Guardrails**: Comprehensive NaN/Infinity safety wrappers (`safeSqrt`, `safeAtan2`, `safeDiv`, coordinate clamping) across math and physics vector operations.
- **Self-Healing Web Worker Recovery**: Automatic worker thread crash detection, strike reset, and state snapshot serialization/restoration.
- **Epigenetic Stress Memory**: Environmental stress-induced gene expression modulation algorithms with non-genetic inheritance decay for direct offspring.
- **3D Allele Frequency Topology**: Interactive WebGL/Three.js 3D surface mesh visualizer mapping population trait density with OrbitControls (pan, zoom, orbit).
- **Stability Telemetry & Exporters**: Float32Array ring buffers for real-time epigenetic metrics and dynamic JSON state exporters.

## [v0.1.224] - 2026-08-04
### Added
- **Genetic Speciation Barriers**: Implemented allele distance mating constraints based on multidimensional genomic thresholds.
- **Hybrid Infertility**: Added logic to apply reproductive penalties and infertility to hybrid offspring.
- **Pheromone Diffusion Gradients**: Introduced a grid-based pheromone system with dynamic chemical diffusion and decay rates.
- **Chemotaxis**: Microbots can now sense pheromone gradients and align their movement vectors toward chemical attraction peaks.
- **3D Fitness Landscape Visualizer**: Added interactive WebGL/Three.js 3D fitness landscape rendering for tracking reproductive success across genetic coordinates.
- **Performance Optimizations**: Implemented dynamic object pooling for chemical grid emitters and optimized raycasting using Float32Array buffers.
- **Error Recovery**: Added interactive error recovery overlay for WebGL context loss.

## [v0.1.223] - 2026-08-03
### Added
- **Neural Architecture Search (NAS)**: Implemented recurrent memory nodes, variable activation function mutations (ReLU, Sigmoid, Tanh, Linear), and dynamic layer depth evaluation.
- **Host-Symbiont Organelle Integration**: Added organelle absorption physics, photosynthetic & energy boost modulation, and maternal/symbiont mitochondrial DNA transmission.
- **3D Trophic Web Visualizer**: Interactive WebGL/Three.js 3D network space rendering Producer, Predator, and Decomposer nodes with camera controls (orbit, pan, zoom).
- **NAS Brain Inspector Panel**: UI inspector displaying real-time recurrent memory states and passive energy consumption penalties.
- **JSON Exporters**: Added dynamic exporters for NAS Brain architectures and organelle profiles.

### Changed
- Isolated 3D network overlays to dedicated render layers.
- Optimized NAS forward-pass calculations using `Float32Array` buffers.
- Polished glassmorphism panel translucency across mobile and high-DPI viewports.
- Enhanced Android asset protocol sanitization and path resolution.

## [v0.1.222] - 2026-08-02
### Added
- **Synthetic Physics Rulesets**: Introduced directional gravity wells and non-Newtonian fluid drag zones for dynamic environmental traversal.
- **Genetic Catalyst Zones**: Added zones that actively manipulate chromosome bounds and trigger real-time genomic mutations during traversal.
- **Spatial Acoustic Sonification**: Integrated Web Audio API 3D spatial panners for real-time auditory feedback based on entity states and environmental triggers.
- **3D Genomic Topology Visualizer**: Implemented WebGL/Three.js 3D inspection component for interactively rotating and examining DNA helices.
- **Advanced Export Utilities**: Added dynamic JSON exporters for Synthetic Ruleset profiles.

### Changed
- Refactored rendering layers to isolate synthetic zone overlays on a dedicated canvas context.
- Optimized rendering and acoustic performance via dynamic object pooling and Float32Array ring buffers.
- Polished UI glassmorphism panel translucency across Desktop and Android viewports.
- Hardened WebGL contexts with interactive recovery overlays for `webglcontextlost` events.

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
