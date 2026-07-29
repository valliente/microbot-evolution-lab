(module
 (type $0 (func (param f32 f32 f32 f32) (result f32)))
 (type $1 (func (param f32 f32 f32 f32 f32) (result f32)))
 (type $2 (func (param i32 i32)))
 (memory $0 0)
 (export "calcDistance" (func $src/wasm/physics/calcDistance))
 (export "calcDistSq" (func $src/wasm/physics/calcDistSq))
 (export "resolveCollision" (func $src/wasm/physics/resolveCollision))
 (export "bulkResolve" (func $src/wasm/physics/bulkResolve))
 (export "memory" (memory $0))
 (func $src/wasm/physics/resolveCollision (param $0 f32) (param $1 f32) (param $2 f32) (param $3 f32) (param $4 f32) (result f32)
  local.get $2
  local.get $0
  f32.sub
  local.tee $0
  local.get $0
  f32.mul
  local.get $3
  local.get $1
  f32.sub
  local.tee $0
  local.get $0
  f32.mul
  f32.add
  local.tee $0
  f32.const 0
  f32.gt
  local.get $0
  local.get $4
  local.get $4
  f32.mul
  f32.lt
  i32.and
  if
   local.get $0
   f64.promote_f32
   f64.sqrt
   f32.demote_f64
   return
  end
  f32.const -1
 )
 (func $src/wasm/physics/calcDistance (param $0 f32) (param $1 f32) (param $2 f32) (param $3 f32) (result f32)
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
  f64.promote_f32
  f64.sqrt
  f32.demote_f64
 )
 (func $src/wasm/physics/calcDistSq (param $0 f32) (param $1 f32) (param $2 f32) (param $3 f32) (result f32)
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
 )
 (func $src/wasm/physics/bulkResolve (param $0 i32) (param $1 i32)
 )
)
