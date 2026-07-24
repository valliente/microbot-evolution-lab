# Microbot Evolution Lab 🤖🧬

A 2D Autonomous Artificial Life & Genetic Evolution Simulation built in React, TypeScript, and HTML5 Canvas with $O(1)$ Spatial Hash Grid collision detection, rule-based steering vectors, asexual reproduction, trait mutation, and interactive telemetry controls.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Build: Success](https://img.shields.io/badge/Build-Passing-brightgreen.svg)

## 🌟 Key Features

- **Rule-Based Steering Engine**: Microbots wander, seek energy particles, evade hazard zones, and reproduce when fully charged.
- **Genetic Mutation & Inheritance**: Offspring inherit mutated traits including speed, turn rate, vision radius, battery capacity, energy efficiency, and color hue.
- **Interactive Mouse Spawner**: Click anywhere on the simulation grid to drop 5 green food dots under your cursor!
- **Interactive Microbot Selection Roster Menu**: Search, sort, and track active microbots by Generation, Battery %, Age, or Offspring count.
- **Multi-Format Windows Launchers**: Includes native `.hta` (HTML Application), `.exe` (C# Windows executable), batch runner (`PLAY.bat`), and `.zip` distribution package.
- **Infinite Ecosystem Safety Net**: Automated population minimum keeps microbot population alive indefinitely.

## 🚀 How to Run Locally

```bash
npm install
npm run dev
```

## 📦 Build Standalone Executables

```bash
npm run build:package
npm run build:exe
```
