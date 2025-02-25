<script lang="ts">
  import { onMount } from 'svelte';
  import { Chart, registerables } from 'chart.js';
  import { calculateHydroPower, calculateAnnualEnergy } from '$lib/hydroPower';

  // Register all Chart.js components
  Chart.register(...registerables);

  // Props
  export let powerOutput: number;
  export let operatingHours: number;

  let canvas: HTMLCanvasElement;
  let chart: Chart;

  // Generate data for the chart
  function generateChartData() {
    const monthlyData = [];
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    
    // Calculate monthly energy production (simplified - equal distribution)
    const monthlyHours = operatingHours / 12;
    const monthlyEnergy = calculateAnnualEnergy(powerOutput, monthlyHours);
    
    // Generate data for each month
    for (let i = 0; i < 12; i++) {
      monthlyData.push({
        month: monthNames[i],
        energy: monthlyEnergy
      });
    }

    return monthlyData;
  }

  // Create or update the chart
  function createOrUpdateChart() {
    const monthlyData = generateChartData();

    if (chart) {
      chart.data.labels = monthlyData.map(d => d.month);
      chart.data.datasets[0].data = monthlyData.map(d => d.energy);
      chart.update();
    } else if (canvas) {
      chart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: monthlyData.map(d => d.month),
          datasets: [
            {
              label: '月間発電量 (MWh)',
              data: monthlyData.map(d => d.energy),
              backgroundColor: 'rgba(54, 162, 235, 0.7)',
              borderColor: 'rgba(54, 162, 235, 1)',
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
                text: '発電量 (MWh)',
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
                  return `発電量: ${context.parsed.y.toFixed(2)} MWh`;
                }
              }
            },
            legend: {
              position: 'top',
              labels: {
                font: {
                  size: 12
                }
              }
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
  $: if (chart && (powerOutput || operatingHours)) {
    createOrUpdateChart();
  }
</script>

<div class="chart-container">
  <canvas bind:this={canvas} height="250"></canvas>
</div>

<style>
  .chart-container {
    width: 100%;
    height: 250px;
    margin: 20px 0;
  }
</style> 
