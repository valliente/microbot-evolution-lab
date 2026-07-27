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
  }
};
