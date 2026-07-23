# 🧬 Microbot Evolution Lab

A polished, high-performance, browser-based **2D Artificial Life & Genetic Evolution Simulation** built with **React 18**, **TypeScript**, **Vite**, and **HTML5 Canvas**.

The application runs 100% locally in the browser with no backend, database, or external API dependencies.

---

## 🌟 Concept

**Microbot Evolution Lab** simulates an ecosystem of small autonomous microbots navigating a 2D environment. Each microbot seeks out glowing green energy particles to replenish its battery, steers clear of dangerous red hazard zones, and reproduces upon collecting sufficient energy.

Every newborn microbot inherits traits from its parent subject to small random genetic mutations. Over successive generations, natural selection drives the population to evolve optimal balances of speed, vision range, and energy efficiency.

### Key Microbot Attributes
- **Unique Identifier**: E.g. `MB-0042`
- **Position & Direction**: 2D coordinate $(x, y)$ and heading vector $\theta$
- **Speed**: Trait determining maximum movement velocity
- **Turn Speed**: Trait determining maximum angular steering rate
- **Vision Radius**: Trait determining detection distance for energy & hazards
- **Battery Capacity & Level**: Current battery charge and maximum energy storage
- **Energy Efficiency**: Trait reducing battery consumption per distance moved
- **Age & Generation**: Frames lived and lineage generation depth
- **Parent ID & Offspring Count**: Genetic ancestry tracking
- **Visual Color (HSL)**: Inherited color hue mutated slightly across generations

---

## ⚡ Key Features

- **Spatial Hash Grid ($O(1)$ partitioning)**: Supports **300+ active entities at 60 FPS** without $O(N^2)$ collision slowdowns.
- **Rule-Based Steering**: Autonomous seeking, wandering, hazard evasion, and boundary correction without neural networks or ML overhead.
- **Genetic Trait Inheritance & Mutation**: Parent traits (speed, turn rate, vision radius, battery capacity, efficiency, hue) mutate stochastically upon asexual reproduction.
- **Interactive Microbot Inspector**: Click any microbot on the canvas to inspect its real-time telemetry, battery gauge, behavior state, and lineage.
- **Dark Scientific Dashboard**: Futuristic cyber UI with parameter sliders, visual toggles (vision radius, movement trails), live population chart, and metric cards.
- **Settings Persistence**: Config settings automatically persist via `localStorage`.
- **Standalone Offline Playable**: Can be built into a single portable HTML bundle (`dist-standalone/index.html`) or launched via double-clicking `run-microbot-lab.bat`.

---

## 🚀 Quick Start & Executable Launcher

### Option 1: Double-Click Launcher (Windows)
Double-click `run-microbot-lab.bat` in the project folder to launch the standalone simulation directly in your default browser.

### Option 2: Live Local Server
```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Open browser at http://localhost:5173
```

### Option 3: Production Build & Standalone HTML
```bash
# Standard distribution build
npm run build

# Build single self-contained playable HTML file
npm run build:single
```
The output file will be created in `dist-standalone/index.html`. You can send this single file to anyone to play offline instantly!

---

## 🎛️ Simulation Controls

| Parameter | Description | Range |
| :--- | :--- | :--- |
| **Start Population** | Initial number of microbots spawned on reset | `5 - 150` |
| **Max Population** | Hard ceiling for total active population | `50 - 500` |
| **Mutation Rate** | Variance percentage applied to offspring traits | `1% - 50%` |
| **Energy Spawn Rate** | Particles generated per second | `1.0 - 15.0/s` |
| **Battery Drain Rate** | Multiplier for movement battery consumption | `0.2x - 3.0x` |
| **Hazard Zones** | Number of damaging red hazard areas | `0 - 12` |
| **Simulation Speed** | Time multiplier | `0.5x - 5.0x` |
| **Vision Circles Toggle** | Renders translucent vision radii for all microbots | `On / Off` |
| **Trails Toggle** | Renders fading movement history paths | `On / Off` |

---

## 📁 Project Structure

```
microbot-evolution-lab/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages automated deployment workflow
├── public/                     # Favicon and static assets
├── src/
│   ├── components/
│   │   ├── Canvas/
│   │   │   ├── SimulationCanvas.tsx  # Canvas 2D engine & DPI rendering
│   │   │   └── PopulationChart.tsx   # Real-time population history graph
│   │   └── UI/
│   │       ├── ControlPanel.tsx      # Sidebar sliders & visual toggles
│   │       ├── Header.tsx            # Play/pause/step/speed bar
│   │       ├── InspectorPanel.tsx    # Selected microbot statistics
│   │       └── StatsDashboard.tsx    # Metric cards & live graph wrapper
│   ├── simulation/
│   │   ├── SpatialGrid.ts       # O(1) Spatial Hash Grid partitioning
│   │   ├── MicrobotEngine.ts    # Physics, steering, battery & evolution core
│   │   ├── steering.ts          # Rule-based vector steering algorithms
│   │   ├── color.ts             # HSL color inheritance & mutation
│   │   └── types.ts             # TypeScript interfaces
│   ├── utils/
│   │   └── storage.ts           # localStorage persistence helper
│   ├── App.tsx                  # Main layout integration
│   ├── index.css                # Global CSS & theme styles
│   └── main.tsx                 # React entry point
├── run-microbot-lab.bat         # Double-click launcher script for Windows
├── README.md                    # Documentation
├── LICENSE                      # MIT Open-Source License
├── package.json
└── vite.config.ts
```

---

## 🌐 Deploying to GitHub Pages

1. Push this repository to GitHub.
2. In your GitHub repository settings, navigate to **Pages** under **Code and automation**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Push any commit to the `main` branch. The included GitHub Workflow (`.github/workflows/deploy.yml`) will automatically build and publish your simulation!

---

## 📄 License

Distributed under the [MIT License](LICENSE). Free for academic, personal, and commercial use.
