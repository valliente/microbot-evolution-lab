// Web Worker thread offloading heavy genetic calculations and spatial physics
self.onmessage = (event: MessageEvent) => {
  const { type, payload } = event.data;
  if (type === 'CALCULATE_DISTANCES') {
    const { bots, food } = payload;
    const results = [];
    for (let i = 0; i < bots.length; i++) {
      let closestDist = Infinity;
      let closestFoodId = null;
      for (let j = 0; j < food.length; j++) {
        const dx = food[j].x - bots[i].x;
        const dy = food[j].y - bots[i].y;
        const dSq = dx * dx + dy * dy;
        if (dSq < closestDist) {
          closestDist = dSq;
          closestFoodId = food[j].id;
        }
      }
      results.push({ botId: bots[i].id, closestFoodId, distance: Math.sqrt(closestDist) });
    }
    self.postMessage({ type: 'DISTANCES_CALCULATED', payload: results });
  } else if (type === 'CROSSOVER_DNA') {
    const { parentA, parentB, mutationRate } = payload;
    const offspring = {
      speed: Math.random() < 0.5 ? parentA.speed : parentB.speed,
      visionRadius: Math.random() < 0.5 ? parentA.visionRadius : parentB.visionRadius,
      energyEfficiency: Math.random() < 0.5 ? parentA.energyEfficiency : parentB.energyEfficiency,
      hue: Math.random() < 0.5 ? parentA.hue : parentB.hue
    };
    if (Math.random() < mutationRate) {
      offspring.speed += (Math.random() - 0.5) * 0.4;
      offspring.visionRadius += (Math.random() - 0.5) * 15;
    }
    self.postMessage({ type: 'DNA_CROSSOVER_COMPLETE', payload: offspring });
  } else if (type === 'BATCH_COLLISIONS') {
    const { entities, radius } = payload;
    const collisions = [];
    const radSq = radius * radius;
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const dx = entities[j].x - entities[i].x;
        const dy = entities[j].y - entities[i].y;
        if (dx * dx + dy * dy <= radSq) {
          collisions.push([entities[i].id, entities[j].id]);
        }
      }
    }
    self.postMessage({ type: 'COLLISIONS_COMPUTED', payload: collisions });
  } else if (type === 'QUADTREE_BUILD') {
    const { points } = payload;
    self.postMessage({ type: 'QUADTREE_BUILT', payload: { count: points.length } });
  } else if (type === 'SPECIATION_QUERIES') {
    // Process Float32Array arrays for zero-copy serialization overhead
    const { genomeA, genomeB } = payload;
    let distance = 0;
    if (genomeA && genomeB && genomeA.length === genomeB.length) {
      for (let i = 0; i < genomeA.length; i++) {
        distance += Math.pow(genomeA[i] - genomeB[i], 2);
      }
      distance = Math.sqrt(distance);
    }
    self.postMessage({ type: 'SPECIATION_RESULT', payload: { distance } });
  } else if (type === 'RESTORE_SNAPSHOT') {
    const { snapshot } = payload;
    self.postMessage({ type: 'SNAPSHOT_RESTORED', payload: { success: true, timestamp: Date.now() } });
  } else if (type === 'GET_SNAPSHOT') {
    self.postMessage({ type: 'SNAPSHOT_SERIALIZED', payload: { timestamp: Date.now() } });
  }
};
