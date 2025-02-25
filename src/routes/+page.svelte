<script lang="ts">
	import { calculateHydroPower, calculateAnnualEnergy, estimateHomesPowered } from '$lib/hydroPower';
	import { onMount } from 'svelte';

	// Default values
	let flowRate = 5; // m³/s
	let head = 20; // meters
	let efficiency = 0.85; // 85%
	let operatingHours = 8760; // hours per year
	let averageHomeConsumption = 3500; // kWh per year

	// Results
	let powerOutput = 0; // kW
	let annualEnergy = 0; // MWh
	let homesPowered = 0;

	// Calculate results on load and when inputs change
	$: {
		// Ensure all values are positive
		flowRate = Math.max(0, flowRate);
		head = Math.max(0, head);
		efficiency = Math.min(1, Math.max(0, efficiency));
		operatingHours = Math.min(8760, Math.max(0, operatingHours));
		
		// Calculate results
		powerOutput = calculateHydroPower(flowRate, head, efficiency);
		annualEnergy = calculateAnnualEnergy(powerOutput, operatingHours);
		homesPowered = estimateHomesPowered(annualEnergy, averageHomeConsumption);
	}

	// Format number with commas and specified decimal places
	function formatNumber(num: number, decimals: number = 2): string {
		return num.toLocaleString('en-US', { 
			minimumFractionDigits: decimals,
			maximumFractionDigits: decimals
		});
	}
</script>

<div class="container">
	<header>
		<h1>水力発電シミュレーター</h1>
		<p>水流のパラメータを入力して、発電量を計算します。</p>
	</header>

	<div class="card">
		<h2>入力パラメータ</h2>

		<div class="form-group">
			<label for="flowRate">水流量 (m³/秒)</label>
			<input 
				type="number" 
				id="flowRate" 
				bind:value={flowRate} 
				min="0" 
				step="0.1"
			/>
		</div>

		<div class="form-group">
			<label for="head">有効落差 (メートル)</label>
			<input 
				type="number" 
				id="head" 
				bind:value={head} 
				min="0" 
				step="0.1"
			/>
		</div>

		<div class="form-group">
			<label for="efficiency">効率 ({(efficiency * 100).toFixed(0)}%)</label>
			<input 
				type="range" 
				id="efficiency" 
				bind:value={efficiency} 
				min="0" 
				max="1" 
				step="0.01"
				style="width: 100%;"
			/>
		</div>

		<div class="form-group">
			<label for="operatingHours">年間稼働時間</label>
			<input 
				type="number" 
				id="operatingHours" 
				bind:value={operatingHours} 
				min="0" 
				max="8760" 
				step="1"
			/>
		</div>

		<div class="form-group">
			<label for="homeConsumption">一般家庭の年間平均消費電力 (kWh/年)</label>
			<input 
				type="number" 
				id="homeConsumption" 
				bind:value={averageHomeConsumption} 
				min="1000" 
				step="100"
			/>
		</div>
	</div>

	<div class="card results">
		<h2>計算結果</h2>

		<div class="result-item">
			<p>発電出力: <span class="result-value">{formatNumber(powerOutput)} kW</span></p>
		</div>

		<div class="result-item">
			<p>年間発電量: <span class="result-value">{formatNumber(annualEnergy)} MWh</span></p>
			<p>({formatNumber(annualEnergy * 1000)} kWh/年)</p>
		</div>

		<div class="result-item">
			<p>一般家庭供給可能数: <span class="result-value">{formatNumber(homesPowered, 0)} 世帯</span></p>
		</div>

		<div class="result-item">
			<p>二酸化炭素削減量: <span class="result-value">{formatNumber(annualEnergy * 0.5, 1)} トン/年</span></p>
			<p class="small">※火力発電と比較した場合の概算値</p>
		</div>
	</div>

	<div class="card">
		<h2>水力発電について</h2>
		<p>水力発電は再生可能エネルギーのひとつで、水の流れを利用して電力を生み出します。水の位置エネルギーと運動エネルギーをタービンを通じて電気エネルギーに変換します。</p>
		<p>主な要素:</p>
		<ul>
			<li><strong>水流量 (m³/秒)</strong>: 単位時間あたりの水の流れる量</li>
			<li><strong>有効落差 (メートル)</strong>: 水がタービンに到達するまでの高低差</li>
			<li><strong>効率</strong>: タービンと発電機の効率（通常0.7～0.9）</li>
		</ul>
		<p>発電量の計算式: P = η × ρ × g × Q × H</p>
		<p>ここで、P = 出力(W)、η = 効率、ρ = 水の密度(1000 kg/m³)、g = 重力加速度(9.81 m/s²)、Q = 水流量(m³/s)、H = 有効落差(m)</p>
	</div>
</div>

<style>
	input[type="range"] {
		-webkit-appearance: none;
		appearance: none;
		height: 10px;
		background: #ddd;
		border-radius: 5px;
		outline: none;
	}

	input[type="range"]::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 20px;
		height: 20px;
		background: var(--primary-color);
		border-radius: 50%;
		cursor: pointer;
	}

	.small {
		font-size: 0.8em;
		color: #666;
	}

	ul {
		margin-left: 20px;
		margin-bottom: 15px;
	}

	li {
		margin-bottom: 5px;
	}
</style>
