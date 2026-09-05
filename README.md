# Microbot Evolution Lab

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-brightgreen.svg)](https://valliente.github.io/microbot-evolution-lab/)
[![Release](https://img.shields.io/badge/Release-v0.1.227-cyan.svg)](https://github.com/valliente/microbot-evolution-lab/releases/tag/v0.1.227)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)

An interactive, high-performance 2D Autonomous Artificial Life & Genetic Evolution Simulation built with React 18, TypeScript, HTML5 Canvas, and WebGL overlays.

Features horizontal gene transfer (conjugation pili and transduction), fluid shear stress fields, and a 3D cladistic phylogeny visualizer.

---

## Live Demo & Releases

- **Online Simulation**: [https://valliente.github.io/microbot-evolution-lab/](https://valliente.github.io/microbot-evolution-lab/)
- **Release Packages (v0.1.227)**: [Standalone Executables & APKs](https://github.com/valliente/microbot-evolution-lab/releases/tag/v0.1.227)

---

## Key Capabilities

- **Autonomous Rule-Based Steering**:
  Microbots evaluate their surrounding environment dynamically using vector steering behaviors to wander, seek food, evade hazards, and reproduce.
- **Natural Selection & Genetic Inheritance**:
  Upon reaching peak battery charge, microbots undergo asexual reproduction. Offspring inherit mutated biological traits:
  - **Speed & Agility** ($1.0 - 5.0\text{ px/frame}$)
  - **Sensory Vision Radius** ($60 - 260\text{ px}$)
  - **Energy Efficiency** ($0.6\times - 2.5\times$)
  - **Color Hue Alignment** ($0^\circ - 360^\circ\text{ HSL}$)
  - **Turn Rate & Steering Precision**
- **Spatial Hash Grid Optimization ($O(1)$)**:
  Uses a uniform spatial hash grid to perform proximity lookups and collision checks across hundreds of active entities at 60 FPS without $O(N^2)$ slowdown.
- **Interactive Spawner & Roster Telemetry**:
  - **Canvas Click**: Click anywhere on the simulation grid to drop 5 energy points under the cursor.
  - **Microbot Roster**: Search, sort, and inspect microbots by Generation, Battery, Age, or Offspring count.
- **Continuous Ecosystem Equilibration**:
  Automated population minimum safeguards against extinction events, stabilizing long-term generational tracking.
- **Multi-Format Standalone Desktop Distribution**:
  Bundled with Windows Defender-verified HTML Application (`MicrobotEvolutionLab.hta`), native C# executable (`MicrobotEvolutionLab.exe`), batch launcher (`PLAY.bat`), and portable archive.

---

## Telemetry & Simulation Controls

| Control / Action | Description |
| :--- | :--- |
| **`SELECT BOT MENU`** | Opens an interactive roster popup to search, sort, and lock telemetry onto any microbot. |
| **`+20 FOOD`** | Injects 20 energy particles onto the simulation grid. |
| **`+10 BOTS`** | Spawns 10 baseline microbots with randomized initial traits. |
| **`+HAZARD`** | Places a localized damage hazard zone to test evolutionary survival and evasion. |
| **`AUTO DEMO`** | Cycles telemetry camera tracking across surviving microbots every 5 seconds. |
| **`SPEED SELECTOR`** | Adjusts simulation clock rate from slow-motion (`0.05x`) up to accelerated (`5.0x`). |

---

## Architecture & System Layout

```
microbot-evolution-lab/
├── src/
│   ├── components/
│   │   ├── Canvas/
│   │   │   └── SimulationCanvas.tsx   # 60 FPS High-DPI Canvas Rendering Engine
│   │   └── UI/
│   │       ├── ControlPanel.tsx       # Real-time Parameter Sliders & Toggles
│   │       ├── Header.tsx             # Interactive Playback Controls & Action Buttons
│   │       ├── InspectorPanel.tsx     # Live Selected Bot Telemetry Dashboard
│   │       ├── PopulationChart.tsx    # Live Canvas Sparkline Population Graph
│   │       ├── RosterModal.tsx        # Searchable Microbot Selection Roster Menu
│   │       └── StatsDashboard.tsx     # Population, Birth, Death & Trait Cards
│   ├── simulation/
│   │   ├── MicrobotEngine.ts          # Core Physics, Lifecycle & Mutation Loop
│   │   ├── SpatialGrid.ts             # O(1) Spatial Hash Grid Collision Lookups
│   │   ├── steering.ts                # Steering Vector Physics (Wander, Seek, Evade)
│   │   └── types.ts                   # TypeScript Interfaces & State Schemas
│   ├── utils/
│   │   └── storage.ts                 # LocalStorage Persistence Layer
│   ├── App.tsx                        # Main Workspace Layout & State Sync
│   └── index.css                      # Glassmorphic CSS Design System
├── build-exe.js                       # Compiles Native C# Windows Executable via csc.exe
├── build-hta.js                       # Generates Defender-Verified HTML Application (.hta)
├── PLAY.bat                           # One-Click Windows Batch Runner
└── vite.singlefile.config.ts          # Bundles Standalone Single-File Distribution
```

---

## Local Development & Compilation

### Prerequisites
- Node.js 18+ and `npm`

### Quick Start

```bash
# 1. Clone repository
git clone https://github.com/valliente/microbot-evolution-lab.git
cd microbot-evolution-lab

# 2. Install dependencies
npm install

# 3. Launch dev server
npm run dev
```

### Build Standalone Executables

```bash
# Build web production bundle
npm run build

# Build single-file bundle & HTA application
npm run build:package

# Compile native C# Windows executable (MicrobotEvolutionLab.exe)
npm run build:exe
```

---

## License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.
