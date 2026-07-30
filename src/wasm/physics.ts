// @ts-nocheck
// WebAssembly Physics Core (AssemblyScript)

// Calculate fast Euclidean distance
export function calcDistance(x1: f32, y1: f32, x2: f32, y2: f32): f32 {
  let dx = x1 - x2;
  let dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy) as f32;
}

// Fast squared distance
export function calcDistSq(x1: f32, y1: f32, x2: f32, y2: f32): f32 {
  let dx = x1 - x2;
  let dy = y1 - y2;
  return (dx * dx + dy * dy) as f32;
}

// Check collision overlap and return distance or -1 if no collision
export function resolveCollision(x1: f32, y1: f32, x2: f32, y2: f32, radiusSum: f32): f32 {
  let dx = x2 - x1;
  let dy = y2 - y1;
  let distSq = dx * dx + dy * dy;
  if (distSq < radiusSum * radiusSum && distSq > 0) {
     return Math.sqrt(distSq) as f32;
  }
  return -1.0 as f32;
}

// Memory-shared bulk position resolver
export function bulkResolve(ptr: i32, count: i32): void {
  // Can be implemented if linear memory is passed
}
