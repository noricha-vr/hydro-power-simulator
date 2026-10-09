<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
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
    // Generate data points for flow rate vs power output
    const flowRateData = [];
    const maxFlowRate = flowRate * 2;
    for (let i = 0; i <= 20; i++) {
      const currentFlowRate = (maxFlowRate * i) / 20;
      flowRateData.push({
        x: currentFlowRate,
        y: calculateHydroPower(currentFlowRate, head, efficiency)
      });
    }

    // Generate data points for head vs power output
    const headData = [];
    const maxHead = head * 2;
    for (let i = 0; i <= 20; i++) {
      const currentHead = (maxHead * i) / 20;
      headData.push({
        x: currentHead,
        y: calculateHydroPower(flowRate, currentHead, efficiency)
      });
    }

    return { flowRateData, headData };
  }

  // Create or update the chart
  function createOrUpdateChart() {
    const { flowRateData, headData } = generateChartData();

    if (chart) {
      chart.data.datasets[0].data = flowRateData;
      chart.data.datasets[1].data = headData;
      chart.update();
    } else if (canvas) {
      chart = new Chart(canvas, {
        type: 'line',
        data: {
          datasets: [
            {
              label: '水流量と発電出力の関係',
              data: flowRateData,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              tension: 0.4,
              pointRadius: 3,
              pointHoverRadius: 5
            },
            {
              label: '有効落差と発電出力の関係',
              data: headData,
              borderColor: 'rgba(153, 102, 255, 1)',
              backgroundColor: 'rgba(153, 102, 255, 0.2)',
              tension: 0.4,
              pointRadius: 3,
              pointHoverRadius: 5
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
                text: '水流量 (m³/s) / 有効落差 (m)',
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
                  const datasetIndex = tooltipItems[0].datasetIndex;
                  if (datasetIndex === 0) {
                    return `水流量: ${(tooltipItems[0].parsed.x ?? 0).toFixed(2)} m³/s`;
                  } else {
                    return `有効落差: ${(tooltipItems[0].parsed.x ?? 0).toFixed(2)} m`;
                  }
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
  <canvas bind:this={canvas} height="300"></canvas>
</div>

<style>
  .chart-container {
    width: 100%;
    height: 300px;
    margin: 20px 0;
  }
</style> 
