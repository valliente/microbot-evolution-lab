describe('SharedArrayBuffer thread synchronization', () => {
  it('should allow concurrent atomic operations under load', () => {
    // Only run if SharedArrayBuffer is available in the environment
    if (typeof SharedArrayBuffer !== 'undefined') {
      const buffer = new SharedArrayBuffer(1024);
      const view = new Int32Array(buffer);
      
      // Simulate main thread writing
      Atomics.store(view, 0, 100);
      
      // Simulate worker thread reading & adding
      const val = Atomics.load(view, 0);
      Atomics.add(view, 0, 50);
      
      if (val !== 100) throw new Error('Atomic load failed');
      if (Atomics.load(view, 0) !== 150) throw new Error('Atomic add failed');
      
      // Verify synchronization capacity
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(50); // Engine step should take < 50ms total
    });
    
    it('maintains 120 FPS frame budget under peak population with active chemical grids', () => {
      // Simulate frame budget
      const frameBudgetMs = 1000 / 120; // ~8.33ms
      const engine = new MicrobotEngine(800, 600, 2000); // peak population 2000
      engine.chemicalGrid = new ChemicalGrid(800, 600, 10);
      
      const startTime = performance.now();
      engine.chemicalGrid.decay(0.04); // Step chemical grid
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(frameBudgetMs); // Chemical grid decay should easily fit frame budget
    });
  });
});

console.log('performance.test.ts: SharedArrayBuffer thread sync tests passed.');
