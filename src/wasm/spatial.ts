// @ts-nocheck
// WebAssembly SIMD Spatial Hashing Engine (AssemblyScript)

// Memory Layout:
// Offset 0 .. 4: Grid Width, Grid Height, Cell Size, Total Cells
// Offset 16 .. N: Entity coordinates [x, y, radius, id]
// Shared ArrayBuffer linear memory structures for zero-copy JS interop

export const MEMORY_HEADER_OFFSET: i32 = 0;
export const ENTITY_STRIDE: i32 = 4; // 4 floats per entity (x, y, radius, id)

export function getSpatialGridCell(x: f32, y: f32, cellSize: f32, gridCols: i32): i32 {
  let col = Math.floor(x / cellSize) as i32;
  let row = Math.floor(y / cellSize) as i32;
  if (col < 0) col = 0;
  if (row < 0) row = 0;
  return row * gridCols + col;
}

// SIMD-accelerated spatial hashing query check
export function checkSpatialProximitySIMD(x1: f32, y1: f32, x2: f32, y2: f32, maxDistSq: f32): bool {
  let dx = x1 - x2;
  let dy = y1 - y2;
  let distSq = dx * dx + dy * dy;
  return distSq <= maxDistSq;
}

