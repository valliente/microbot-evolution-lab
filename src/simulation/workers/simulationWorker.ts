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
  }
};
