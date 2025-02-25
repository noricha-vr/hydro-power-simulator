<script lang="ts">
  import { onMount } from 'svelte';
  import { Chart, registerables } from 'chart.js';

  // Register all Chart.js components
  Chart.register(...registerables);

  // Props
  export let annualEnergy: number; // MWh

  let canvas: HTMLCanvasElement;
  let chart: Chart;

  // CO2 emission factors (kg CO2/kWh)
  const emissionFactors = {
    coal: 0.9,
    oil: 0.7,
    naturalGas: 0.4,
    hydro: 0.02
  };

  // Generate data for the chart
  function generateChartData() {
    // Convert MWh to kWh
    const annualEnergyKWh = annualEnergy * 1000;
    
    // Calculate CO2 emissions for different energy sources
    const data = [
      {
        label: '石炭火力',
        emission: annualEnergyKWh * emissionFactors.coal / 1000, // Convert to tons
        color: 'rgba(153, 102, 51, 0.8)'
      },
      {
        label: '石油火力',
        emission: annualEnergyKWh * emissionFactors.oil / 1000,
        color: 'rgba(128, 128, 128, 0.8)'
      },
      {
        label: '天然ガス',
        emission: annualEnergyKWh * emissionFactors.naturalGas / 1000,
        color: 'rgba(70, 130, 180, 0.8)'
      },
      {
        label: '水力発電',
        emission: annualEnergyKWh * emissionFactors.hydro / 1000,
        color: 'rgba(46, 204, 113, 0.8)'
      }
    ];

    // Calculate CO2 reduction compared to coal
    const reduction = data[0].emission - data[3].emission;

    return { data, reduction };
  }

  // Create or update the chart
  function createOrUpdateChart() {
    const { data, reduction } = generateChartData();

    if (chart) {
      chart.data.labels = data.map(d => d.label);
      chart.data.datasets[0].data = data.map(d => d.emission);
      chart.data.datasets[0].backgroundColor = data.map(d => d.color);
      chart.update();
    } else if (canvas) {
      chart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: data.map(d => d.label),
          datasets: [
            {
              label: 'CO2排出量 (トン/年)',
              data: data.map(d => d.emission),
              backgroundColor: data.map(d => d.color),
              borderColor: data.map(d => d.color.replace('0.8', '1')),
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'CO2排出量 (トン/年)',
                font: {
                  size: 14
                }
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `CO2排出量: ${context.parsed.y.toFixed(1)} トン/年`;
                }
              }
            },
            legend: {
              display: false
            }
          }
        }
      });
    }
  }

  onMount(() => {
    createOrUpdateChart();
  });

  // Update chart when props change
  $: if (chart && annualEnergy) {
    createOrUpdateChart();
  }

  // Calculate CO2 reduction
  $: co2Reduction = annualEnergy * 0.5; // Simplified calculation
</script>

<div class="chart-container">
  <h3>エネルギー源別CO2排出量比較</h3>
  <canvas bind:this={canvas} height="250"></canvas>
  <div class="reduction-info">
    <p>石炭火力発電と比較した場合のCO2削減量: <strong>{co2Reduction.toFixed(1)} トン/年</strong></p>
  </div>
</div>

<style>
  .chart-container {
    width: 100%;
    margin: 20px 0;
  }
  
  h3 {
    text-align: center;
    margin-bottom: 15px;
    font-size: 1.1rem;
    color: #333;
  }
  
  .reduction-info {
    margin-top: 15px;
    text-align: center;
    font-size: 0.9rem;
    color: #333;
    background-color: rgba(46, 204, 113, 0.1);
    padding: 10px;
    border-radius: 5px;
  }
  
  strong {
    color: #2ecc71;
  }
</style> 
