<script lang="ts">
  import { onMount } from 'svelte';
  import { Chart, registerables } from 'chart.js';
  import { turbineTypes, calculateTurbineEfficiency } from '$lib/hydroPower';

  // Register all Chart.js components
  Chart.register(...registerables);

  // Props
  export let selectedTurbineId: string;
  export let flowRate: number;

  let canvas: HTMLCanvasElement;
  let chart: Chart;

  // Generate data for the chart
  function generateChartData() {
    // Get the selected turbine
    const selectedTurbine = turbineTypes.find(t => t.id === selectedTurbineId);
    if (!selectedTurbine) return { efficiencyData: [], currentPoint: null };

    // Generate efficiency curve data
    const efficiencyData = [];
    const points = 50;
    const minFlow = selectedTurbine.minFlow;
    const maxFlow = selectedTurbine.maxFlow;
    const flowRange = maxFlow - minFlow;

    for (let i = 0; i <= points; i++) {
      const currentFlow = minFlow + (flowRange * i) / points;
      const normalizedFlow = (currentFlow - minFlow) / flowRange;
      const efficiency = selectedTurbine.efficiencyCurve(normalizedFlow) * 100; // Convert to percentage
      
      efficiencyData.push({
        x: currentFlow,
        y: efficiency
      });
    }

    // Calculate current efficiency point
    const currentEfficiency = calculateTurbineEfficiency(selectedTurbine, flowRate) * 100;
    const currentPoint = {
      x: flowRate,
      y: currentEfficiency
    };

    return { efficiencyData, currentPoint };
  }

  // Create or update the chart
  function createOrUpdateChart() {
    const { efficiencyData, currentPoint } = generateChartData();
    if (!efficiencyData.length) return;

    if (chart) {
      chart.data.datasets[0].data = efficiencyData;
      if (currentPoint) {
        chart.data.datasets[1].data = [currentPoint];
      }
      chart.update();
    } else if (canvas) {
      chart = new Chart(canvas, {
        type: 'line',
        data: {
          datasets: [
            {
              label: '水車効率曲線',
              data: efficiencyData,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              tension: 0.4,
              pointRadius: 0,
              pointHoverRadius: 5
            },
            {
              label: '現在の効率',
              data: currentPoint ? [currentPoint] : [],
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 1)',
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
                text: '水流量 (m³/s)',
                font: {
                  size: 14
                }
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            y: {
              title: {
                display: true,
                text: '効率 (%)',
                font: {
                  size: 14
                }
              },
              min: 0,
              max: 100,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                title: function(tooltipItems) {
                  return `水流量: ${tooltipItems[0].parsed.x.toFixed(2)} m³/s`;
                },
                label: function(context) {
                  return `効率: ${context.parsed.y.toFixed(1)}%`;
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
  $: if (chart && (selectedTurbineId || flowRate)) {
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
