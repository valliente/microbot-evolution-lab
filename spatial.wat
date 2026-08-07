(module
 (type $0 (func (param f32 f32 f32 i32) (result i32)))
 (type $1 (func (param f32 f32 f32 f32 f32) (result i32)))
 (global $src/wasm/spatial/MEMORY_HEADER_OFFSET i32 (i32.const 0))
 (global $src/wasm/spatial/ENTITY_STRIDE i32 (i32.const 4))
 (memory $0 0)
 (export "MEMORY_HEADER_OFFSET" (global $src/wasm/spatial/MEMORY_HEADER_OFFSET))
 (export "ENTITY_STRIDE" (global $src/wasm/spatial/ENTITY_STRIDE))
 (export "getSpatialGridCell" (func $src/wasm/spatial/getSpatialGridCell))
 (export "checkSpatialProximitySIMD" (func $src/wasm/spatial/checkSpatialProximitySIMD))
 (export "memory" (memory $0))
 (func $src/wasm/spatial/getSpatialGridCell (param $0 f32) (param $1 f32) (param $2 f32) (param $3 i32) (result i32)
  (local $4 i32)
  (local $5 i32)
  local.get $1
  local.get $2
  f32.div
  f64.promote_f32
  f64.floor
  i32.trunc_sat_f64_s
  local.set $4
  local.get $0
  local.get $2
  f32.div
  f64.promote_f32
  f64.floor
  i32.trunc_sat_f64_s
  local.tee $5
  i32.const 0
  i32.lt_s
  if (result i32)
   i32.const 0
  else
   local.get $5
  end
  local.get $4
  i32.const 0
  local.get $4
  i32.const 0
  i32.ge_s
  select
  local.get $3
  i32.mul
  i32.add
 )
 (func $src/wasm/spatial/checkSpatialProximitySIMD (param $0 f32) (param $1 f32) (param $2 f32) (param $3 f32) (param $4 f32) (result i32)
  local.get $0
  local.get $2
  f32.sub
  local.tee $0
  local.get $0
  f32.mul
  local.get $1
  local.get $3
  f32.sub
  local.tee $0
  local.get $0
  f32.mul
  f32.add
  local.get $4
  f32.le
 )
)
