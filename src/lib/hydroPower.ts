/**
 * Hydroelectric Power Generation Calculator
 * 
 * Formula: P = η * ρ * g * Q * H
 * where:
 * P = Power output (Watts)
 * η = Efficiency of the turbine and generator (decimal, typically 0.7 to 0.9)
 * ρ = Density of water (1000 kg/m³)
 * g = Acceleration due to gravity (9.81 m/s²)
 * Q = Flow rate (m³/s)
 * H = Effective head/height (m)
 */

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
  efficiency: number = 0.85
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
