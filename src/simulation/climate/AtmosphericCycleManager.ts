export type WeatherState = 'TEMPERATE' | 'HEATWAVE' | 'GLACIAL_BLIZZARD' | 'ACID_RAIN' | 'HIGH_PRESSURE_GALE';

export interface AtmosphericCondition {
  weather: WeatherState;
  temperatureCelsius: number; // e.g. -20 to 60 °C
  humidityPercent: number;    // 0 - 100
  atmosphericPressure: number;// 0.8 to 1.5 atm
  cycleFrameCount: number;
}

export class AtmosphericCycleManager {
  public currentCondition: AtmosphericCondition = {
    weather: 'TEMPERATE',
    temperatureCelsius: 22,
    humidityPercent: 50,
    atmosphericPressure: 1.0,
    cycleFrameCount: 0
  };

  public cycleDurationFrames: number = 1800; // ~30 sec per cycle phase

  public updateAtmosphere(): void {
    this.currentCondition.cycleFrameCount++;
    if (this.currentCondition.cycleFrameCount % this.cycleDurationFrames === 0) {
      this.shiftWeather();
    }
  }

  public shiftWeather(): void {
    const states: WeatherState[] = ['TEMPERATE', 'HEATWAVE', 'GLACIAL_BLIZZARD', 'ACID_RAIN', 'HIGH_PRESSURE_GALE'];
    const idx = Math.floor(Math.random() * states.length);
    this.currentCondition.weather = states[idx];

    switch (this.currentCondition.weather) {
      case 'HEATWAVE':
        this.currentCondition.temperatureCelsius = 48;
        this.currentCondition.humidityPercent = 20;
        this.currentCondition.atmosphericPressure = 1.1;
        break;
      case 'GLACIAL_BLIZZARD':
        this.currentCondition.temperatureCelsius = -18;
        this.currentCondition.humidityPercent = 85;
        this.currentCondition.atmosphericPressure = 1.3;
        break;
      case 'ACID_RAIN':
        this.currentCondition.temperatureCelsius = 30;
        this.currentCondition.humidityPercent = 95;
        this.currentCondition.atmosphericPressure = 0.9;
        break;
      case 'HIGH_PRESSURE_GALE':
        this.currentCondition.temperatureCelsius = 15;
        this.currentCondition.humidityPercent = 60;
        this.currentCondition.atmosphericPressure = 1.45;
        break;
      default:
        this.currentCondition.temperatureCelsius = 22;
        this.currentCondition.humidityPercent = 50;
        this.currentCondition.atmosphericPressure = 1.0;
        break;
    }
  }

  public calculateThermalBatteryDrain(baseDrain: number): number {
    const temp = this.currentCondition.temperatureCelsius;
    // Extreme heat (>40°C) or cold (<0°C) increases battery drain
    let tempFactor = 1.0;
    if (temp > 35) tempFactor += (temp - 35) * 0.02;
    if (temp < 5) tempFactor += (5 - temp) * 0.025;
    return baseDrain * tempFactor;
  }

  public calculateThermalMobilityDrag(baseSpeed: number): number {
    const temp = this.currentCondition.temperatureCelsius;
    // Cold viscous drag slows mobility
    if (temp < 0) {
      return baseSpeed * Math.max(0.4, 1.0 + temp * 0.015);
    }
    return baseSpeed;
  }
}
