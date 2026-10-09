<script lang="ts">
  import { onMount } from 'svelte';
  import { Chart, registerables } from 'chart.js';
  import { calculateHydroPower } from '$lib/hydroPower';

  // Register all Chart.js components
  Chart.register(...registerables);

  // Props
  export let flowRate: number;
  export let head: number;
  export let efficiency: number;

  let canvas: HTMLCanvasElement;
  let chart: Chart;

  // Generate data for the chart
  function generateChartData() {
    const efficiencyData = [];
    
    // Generate data points for efficiency vs power output
    for (let i = 0; i <= 10; i++) {
      const currentEfficiency = i / 10;
      efficiencyData.push({
        x: currentEfficiency * 100, // Display as percentage
        y: calculateHydroPower(flowRate, head, currentEfficiency)
      });
    }

    // Add current efficiency point
    const currentPoint = {
      x: efficiency * 100,
      y: calculateHydroPower(flowRate, head, efficiency)
    };

    return { efficiencyData, currentPoint };
  }

  // Create or update the chart
  function createOrUpdateChart() {
    const { efficiencyData, currentPoint } = generateChartData();

    if (chart) {
      chart.data.datasets[0].data = efficiencyData;
      chart.data.datasets[1].data = [currentPoint];
      chart.update();
    } else if (canvas) {
      chart = new Chart(canvas, {
        type: 'line',
        data: {
          datasets: [
            {
              label: '効率と発電出力の関係',
              data: efficiencyData,
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              tension: 0.4,
              pointRadius: 0,
              pointHoverRadius: 5
            },
            {
              label: '現在の効率',
              data: [currentPoint],
              borderColor: 'rgba(54, 162, 235, 1)',
              backgroundColor: 'rgba(54, 162, 235, 1)',
              pointRadius: 8,
              pointHoverRadius: 10,
              showLine: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'linear',
              position: 'bottom',
              title: {
                display: true,
                text: '効率 (%)',
                font: {
                  size: 14
                }
              },
              min: 0,
              max: 100,
              ticks: {
                stepSize: 10
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            y: {
              title: {
                display: true,
                text: '発電出力 (kW)',
                font: {
                  size: 14
                }
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                title: function(tooltipItems) {
                  return `効率: ${(tooltipItems[0].parsed.x ?? 0).toFixed(0)}%`;
                },
                label: function(context) {
                  return `発電出力: ${(context.parsed.y ?? 0).toFixed(2)} kW`;
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
  $: if (chart && (flowRate || head || efficiency)) {
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
