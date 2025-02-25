<script lang="ts">
  import { onMount } from 'svelte';
  import { Chart, registerables } from 'chart.js';
  import { calculateEconomics } from '$lib/hydroPower';
  // @ts-ignore
  import annotationPlugin from 'chartjs-plugin-annotation';

  // Register all Chart.js components
  Chart.register(...registerables);

  // Props
  export let powerKW: number;
  export let annualEnergyMWh: number;
  export let selectedTurbineId: string;
  export let electricityPrice: number = 36; // JPY per kWh

  let canvas: HTMLCanvasElement;
  let chart: Chart;
  
  // Calculate economics
  $: economics = calculateEconomics(powerKW, annualEnergyMWh, electricityPrice, selectedTurbineId);
  
  // Format currency in Japanese Yen
  function formatCurrency(amount: number): string {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toLocaleString('ja-JP', { maximumFractionDigits: 2 })}百万円`;
    } else if (amount >= 10000) {
      return `${(amount / 10000).toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円`;
    } else {
      return `${amount.toLocaleString('ja-JP')}円`;
    }
  }

  // Generate data for the chart
  function generateChartData() {
    const years = 20;
    const cumulativeData = [];
    
    // Initial investment (negative cash flow)
    cumulativeData.push({
      x: 0,
      y: -economics.initialCost / 1000000 // Convert to millions for better display
    });
    
    // Calculate cumulative cash flow for each year
    let cumulativeCashFlow = -economics.initialCost;
    const annualNetRevenue = economics.annualRevenue - economics.annualMaintenanceCost;
    
    for (let year = 1; year <= years; year++) {
      cumulativeCashFlow += annualNetRevenue;
      cumulativeData.push({
        x: year,
        y: cumulativeCashFlow / 1000000 // Convert to millions for better display
      });
    }
    
    return cumulativeData;
  }

  // Create or update the chart
  function createOrUpdateChart() {
    const cumulativeData = generateChartData();
    
    // Find break-even point
    const breakEvenYear = economics.paybackPeriod;

    if (chart) {
      chart.data.datasets[0].data = cumulativeData;
      // @ts-ignore
      chart.options.plugins.annotation.annotations.breakEvenLine.value = breakEvenYear;
      chart.update();
    } else if (canvas) {
      chart = new Chart(canvas, {
        type: 'line',
        data: {
          datasets: [
            {
              label: '累積キャッシュフロー (百万円)',
              data: cumulativeData,
              borderColor: 'rgba(54, 162, 235, 1)',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              fill: true,
              tension: 0.4,
              pointRadius: 4,
              pointHoverRadius: 6
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
                text: '年数',
                font: {
                  size: 14
                }
              },
              ticks: {
                stepSize: 1
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            y: {
              title: {
                display: true,
                text: '累積キャッシュフロー (百万円)',
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
                  const year = tooltipItems[0].parsed.x;
                  return year === 0 ? '初期投資' : `${year}年目`;
                },
                label: function(context) {
                  return `累積キャッシュフロー: ${context.parsed.y.toFixed(1)}百万円`;
                }
              }
            },
            legend: {
              display: false
            },
            // @ts-ignore
            annotation: {
              annotations: {
                breakEvenLine: {
                  type: 'line',
                  xMin: breakEvenYear,
                  xMax: breakEvenYear,
                  borderColor: 'rgba(255, 99, 132, 0.8)',
                  borderWidth: 2,
                  borderDash: [6, 6],
                  label: {
                    display: true,
                    content: `投資回収: ${breakEvenYear.toFixed(1)}年`,
                    position: 'start',
                    backgroundColor: 'rgba(255, 99, 132, 0.8)',
                    font: {
                      size: 12
                    }
                  }
                },
                zeroLine: {
                  type: 'line',
                  yMin: 0,
                  yMax: 0,
                  borderColor: 'rgba(0, 0, 0, 0.3)',
                  borderWidth: 1
                }
              }
            }
          }
        }
      });
    }
  }

  onMount(() => {
    // Register annotation plugin
    Chart.register(annotationPlugin);
    createOrUpdateChart();
  });

  // Update chart when props change
  $: if (chart && (powerKW || annualEnergyMWh || selectedTurbineId || electricityPrice)) {
    createOrUpdateChart();
  }
</script>

<div class="economics-container">
  <div class="economics-summary">
    <div class="economics-item">
      <h4>初期投資</h4>
      <p class="value">{formatCurrency(economics.initialCost)}</p>
    </div>
    <div class="economics-item">
      <h4>年間収益</h4>
      <p class="value">{formatCurrency(economics.annualRevenue)}</p>
    </div>
    <div class="economics-item">
      <h4>年間維持費</h4>
      <p class="value">{formatCurrency(economics.annualMaintenanceCost)}</p>
    </div>
    <div class="economics-item">
      <h4>投資回収期間</h4>
      <p class="value">{economics.paybackPeriod.toFixed(1)}年</p>
    </div>
    <div class="economics-item">
      <h4>20年間ROI</h4>
      <p class="value">{(economics.roi20Year * 100).toFixed(1)}%</p>
    </div>
  </div>
  
  <div class="chart-container">
    <canvas bind:this={canvas} height="300"></canvas>
  </div>
</div>

<style>
  .economics-container {
    width: 100%;
    margin: 20px 0;
  }
  
  .economics-summary {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    margin-bottom: 20px;
    justify-content: space-between;
  }
  
  .economics-item {
    background-color: #f8f9fa;
    border-radius: 6px;
    padding: 12px 15px;
    min-width: 150px;
    flex: 1;
  }
  
  h4 {
    margin: 0 0 8px 0;
    font-size: 0.9rem;
    color: #555;
  }
  
  .value {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #2c3e50;
  }
  
  .chart-container {
    width: 100%;
    height: 300px;
  }
  
  @media (max-width: 768px) {
    .economics-summary {
      flex-direction: column;
    }
    
    .economics-item {
      width: 100%;
    }
  }
</style> 
