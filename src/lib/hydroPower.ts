/**
 * Micro and Small Hydroelectric Power Generation Calculator
 * 
 * Formula: P = η * ρ * g * Q * H
 * where:
 * P = Power output (Watts)
 * η = Efficiency of the turbine and generator (decimal, typically 0.5 to 0.85 for micro/small hydro)
 * ρ = Density of water (1000 kg/m³)
 * g = Acceleration due to gravity (9.81 m/s²)
 * Q = Flow rate (m³/s)
 * H = Effective head/height (m)
 */

/**
 * Hydro power classification by capacity
 */
export const hydroClassification = {
  pico: { maxPower: 5, name: "ピコ水力" },         // < 5 kW
  micro: { maxPower: 100, name: "マイクロ水力" },   // 5-100 kW
  mini: { maxPower: 1000, name: "ミニ水力" },      // 100-1000 kW
  small: { maxPower: 10000, name: "小水力" },      // 1-10 MW
};

/**
 * Turbine types with their characteristics
 */
export const turbineTypes = [
  {
    id: "turgo",
    name: "ターゴインパルス水車",
    description: "ピコ発電に最適な小型水車。低～中落差、超低流量でも発電可能です。DIYにも向いています。",
    minHead: 1,
    maxHead: 30,
    minFlow: 0.001,
    maxFlow: 0.05,
    efficiencyCurve: (normalizedFlow: number) => {
      // Turgo impulse turbines work well with very low flow rates
      if (normalizedFlow < 0.1) return 0.45 + normalizedFlow * 2;
      return 0.65 + normalizedFlow * 0.2;
    }
  },
  {
    id: "waterwheel",
    name: "オーバーショット水車",
    description: "伝統的な上掛け水車。超低流量・低落差のピコ発電に適しています。自作も比較的容易です。",
    minHead: 0.5,
    maxHead: 10,
    minFlow: 0.002,
    maxFlow: 0.1,
    efficiencyCurve: (normalizedFlow: number) => {
      // Traditional waterwheels have lower but consistent efficiency
      return 0.5 + normalizedFlow * 0.15;
    }
  },
  {
    id: "pelton",
    name: "ペルトン水車",
    description: "高落差・低流量に適しています。山間部の小さな水路に最適です。",
    minHead: 20,
    maxHead: 200,
    minFlow: 0.01,
    maxFlow: 0.5,
    efficiencyCurve: (normalizedFlow: number) => {
      // Pelton turbines maintain high efficiency across a wide flow range
      if (normalizedFlow < 0.1) return 0.4 + normalizedFlow * 3;
      if (normalizedFlow > 0.9) return 0.85 - (normalizedFlow - 0.9) * 0.5;
      return 0.7 + normalizedFlow * 0.15;
    }
  },
  {
    id: "crossflow",
    name: "クロスフロー水車",
    description: "中～低落差、中～高流量に適しています。幅広い条件で使用可能です。",
    minHead: 2,
    maxHead: 40,
    minFlow: 0.02,
    maxFlow: 5,
    efficiencyCurve: (normalizedFlow: number) => {
      // Cross-flow turbines have good part-flow efficiency
      if (normalizedFlow < 0.2) return 0.3 + normalizedFlow * 1.5;
      return 0.6 + normalizedFlow * 0.2;
    }
  },
  {
    id: "kaplan",
    name: "カプラン水車",
    description: "低落差・高流量に適しています。河川や用水路に最適です。",
    minHead: 1.5,
    maxHead: 20,
    minFlow: 0.3,
    maxFlow: 30,
    efficiencyCurve: (normalizedFlow: number) => {
      // Kaplan turbines have high peak efficiency but drop off at low flows
      if (normalizedFlow < 0.3) return 0.2 + normalizedFlow * 1.5;
      return 0.65 + normalizedFlow * 0.2;
    }
  },
  {
    id: "francis",
    name: "フランシス水車",
    description: "中落差・中流量に適しています。汎用性が高く、多くの条件で使用できます。",
    minHead: 10,
    maxHead: 100,
    minFlow: 0.1,
    maxFlow: 10,
    efficiencyCurve: (normalizedFlow: number) => {
      // Francis turbines have high peak efficiency but less part-flow efficiency
      if (normalizedFlow < 0.4) return 0.3 + normalizedFlow * 1.0;
      if (normalizedFlow > 0.8) return 0.7 + (normalizedFlow - 0.8) * 0.75;
      return 0.7;
    }
  },
  {
    id: "archimedes",
    name: "アルキメデススクリュー",
    description: "超低落差・中流量に適しています。魚に優しい設計で生態系への影響が少ないです。",
    minHead: 0.5,
    maxHead: 5,
    minFlow: 0.1,
    maxFlow: 5,
    efficiencyCurve: (normalizedFlow: number) => {
      // Archimedes screws have consistent efficiency across flow ranges
      return 0.65 + normalizedFlow * 0.1;
    }
  }
];

/**
 * Get suitable turbine types for given head and flow rate
 * 
 * @param head - Effective head/height in meters (m)
 * @param flowRate - Water flow rate in cubic meters per second (m³/s)
 * @returns Array of suitable turbine types
 */
export function getSuitableTurbines(head: number, flowRate: number): typeof turbineTypes {
  return turbineTypes.filter(turbine => 
    head >= turbine.minHead && 
    head <= turbine.maxHead && 
    flowRate >= turbine.minFlow && 
    flowRate <= turbine.maxFlow
  );
}

/**
 * Get the most efficient turbine for given conditions
 * 
 * @param head - Effective head/height in meters (m)
 * @param flowRate - Water flow rate in cubic meters per second (m³/s)
 * @returns The most suitable turbine type or undefined if none are suitable
 */
export function getMostEfficientTurbine(head: number, flowRate: number): typeof turbineTypes[0] | undefined {
  const suitableTurbines = getSuitableTurbines(head, flowRate);
  if (suitableTurbines.length === 0) return undefined;
  
  // Calculate efficiency for each turbine
  const turbineEfficiencies = suitableTurbines.map(turbine => {
    const normalizedFlow = (flowRate - turbine.minFlow) / (turbine.maxFlow - turbine.minFlow);
    const efficiency = turbine.efficiencyCurve(Math.min(1, Math.max(0, normalizedFlow)));
    return { turbine, efficiency };
  });
  
  // Return the turbine with highest efficiency
  return turbineEfficiencies.reduce((best, current) => 
    current.efficiency > best.efficiency ? current : best
  , turbineEfficiencies[0]).turbine;
}

/**
 * Calculate the turbine efficiency based on the turbine type and flow conditions
 * 
 * @param turbineType - The turbine type
 * @param flowRate - Water flow rate in cubic meters per second (m³/s)
 * @returns Efficiency as a decimal between 0 and 1
 */
export function calculateTurbineEfficiency(turbineType: typeof turbineTypes[0], flowRate: number): number {
  const normalizedFlow = (flowRate - turbineType.minFlow) / (turbineType.maxFlow - turbineType.minFlow);
  return turbineType.efficiencyCurve(Math.min(1, Math.max(0, normalizedFlow)));
}

/**
 * Calculate the hydroelectric power output in kilowatts
 * 
 * @param flowRate - Water flow rate in cubic meters per second (m³/s)
 * @param head - Effective head/height in meters (m)
 * @param efficiency - Turbine and generator efficiency (decimal between 0 and 1)
 * @returns Power output in kilowatts (kW)
 */
export function calculateHydroPower(
  flowRate: number,
  head: number,
  efficiency: number = 0.75
): number {
  const waterDensity = 1000; // kg/m³
  const gravity = 9.81; // m/s²
  
  // Power in watts
  const power = efficiency * waterDensity * gravity * flowRate * head;
  
  // Convert to kilowatts
  return power / 1000;
}

/**
 * Calculate annual energy production in megawatt-hours (MWh)
 * 
 * @param powerKW - Power output in kilowatts (kW)
 * @param operatingHours - Annual operating hours
 * @returns Annual energy in megawatt-hours (MWh)
 */
export function calculateAnnualEnergy(
  powerKW: number,
  operatingHours: number = 8760 // Default: 24 hours * 365 days
): number {
  // MWh = kW * hours / 1000
  return (powerKW * operatingHours) / 1000;
}

/**
 * Estimate the number of homes that can be powered
 * 
 * @param annualEnergyMWh - Annual energy in megawatt-hours
 * @param averageHomeConsumption - Average home consumption in kWh per year
 * @returns Number of homes that can be powered
 */
export function estimateHomesPowered(
  annualEnergyMWh: number,
  averageHomeConsumption: number = 3500 // kWh/year, typical household
): number {
  return Math.floor((annualEnergyMWh * 1000) / averageHomeConsumption);
}

/**
 * Calculate economic metrics for the hydro power project
 * 
 * @param powerKW - Power output in kilowatts (kW)
 * @param annualEnergyMWh - Annual energy in megawatt-hours (MWh)
 * @param electricityPrice - Electricity price in JPY per kWh
 * @param turbineType - Type of turbine used
 * @returns Economic metrics including costs, revenue, and payback period
 */
export function calculateEconomics(
  powerKW: number,
  annualEnergyMWh: number,
  electricityPrice: number = 36, // JPY per kWh (FIT price for small hydro in Japan)
  turbineType: string = "crossflow"
): {
  initialCost: number;
  annualRevenue: number;
  annualMaintenanceCost: number;
  paybackPeriod: number;
  roi20Year: number;
} {
  // Initial cost estimation (very simplified)
  // Costs decrease per kW as system size increases
  let costPerKW = 0;
  if (powerKW < 5) {
    costPerKW = 2000000; // 200万円/kW for pico hydro
  } else if (powerKW < 100) {
    costPerKW = 1500000; // 150万円/kW for micro hydro
  } else {
    costPerKW = 1000000; // 100万円/kW for mini/small hydro
  }
  
  // Adjust cost based on turbine type
  const turbineCostMultiplier = {
    turgo: 0.9,
    waterwheel: 0.8,
    pelton: 1.2,
    crossflow: 1.0,
    kaplan: 1.3,
    francis: 1.4,
    archimedes: 1.1
  };
  
  const multiplier = turbineCostMultiplier[turbineType as keyof typeof turbineCostMultiplier] || 1.0;
  
  const initialCost = powerKW * costPerKW * multiplier;
  
  // Annual revenue
  const annualRevenue = annualEnergyMWh * 1000 * electricityPrice;
  
  // Annual maintenance cost (typically 2-5% of initial cost)
  const annualMaintenanceCost = initialCost * 0.03;
  
  // Annual net revenue
  const annualNetRevenue = annualRevenue - annualMaintenanceCost;
  
  // Payback period in years
  const paybackPeriod = initialCost / annualNetRevenue;
  
  // ROI over 20 years
  const roi20Year = ((annualNetRevenue * 20) - initialCost) / initialCost;
  
  return {
    initialCost,
    annualRevenue,
    annualMaintenanceCost,
    paybackPeriod,
    roi20Year
  };
}

/**
 * Get hydro power classification based on power output
 * 
 * @param powerKW - Power output in kilowatts (kW)
 * @returns Classification object with name and max power
 */
export function getHydroClassification(powerKW: number): { name: string; maxPower: number } {
  if (powerKW < hydroClassification.pico.maxPower) {
    return hydroClassification.pico;
  } else if (powerKW < hydroClassification.micro.maxPower) {
    return hydroClassification.micro;
  } else if (powerKW < hydroClassification.mini.maxPower) {
    return hydroClassification.mini;
  } else {
    return hydroClassification.small;
  }
} 
