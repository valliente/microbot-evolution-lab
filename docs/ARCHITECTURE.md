# Microbot Evolution Lab - System Architecture

## Overview Architecture (v0.1.227)

```
                       +-----------------------------------+
                       |         React 18 Dashboard        |
                       | (ControlPanel, Roster, 3D GRN)    |
                       +-----------------------------------+
                                         |
                                         v
                       +-----------------------------------+
                       |      MicrobotEngine Core Loop     |
                       +-----------------------------------+
                                   /           \
                                  /             \
                                 v               v
               +-----------------------+   +------------------------+
               |  OrganelleEngine      |   |  MicroBiomeManager     |
               |  (Chloroplasts,       |   |  (Swamps, Radiation,   |
               |   Mitochondria, mDNA) |   |   Thermal Vents)       |
               +-----------------------+   +------------------------+
                                 \               /
                                  v             v
                       +-----------------------------------+
                       | HTML5 Canvas & WebGL 3D Overlay   |
                       +-----------------------------------+
```
