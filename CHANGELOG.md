# Changelog

## [0.1.207] - Beta Release

### Added
- **Quantum Genetic Engine**: Microbots now utilize quantum allele superposition for high-variance mutation probabilities during specific events.
- **Disaster Suite**: Introduced `RADIATION_STORM` and `MAGNETIC_INVERSION` events.
- **Telemetry Charts**: Added dynamic charts for biome population and genetic diversity.
- **Data Export**: Added JSON/CSV export capabilities for genome data and session telemetry.
- **Presets**: New 'Quantum Apex' and 'Disaster Sandbox' configurations for diverse testing.
- **Error Recovery**: Interactive error overlay to elegantly handle worker threading exceptions.

### Changed
- Refactored canvas background rendering with dynamic tinting corresponding to seasonal/disaster transitions.
- Improved spatial grid logic with biome bounds lookup testing.
- Optimized object allocation using memory pooling to eliminate micro-stutters.

### Fixed
- Stabilized file pathing resolution in packaged execution environments (`MicrobotEvolutionLab.exe`).
- Silenced erratic audio loops in `SpatialAudioSynth`.
