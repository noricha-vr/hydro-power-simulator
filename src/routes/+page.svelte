<script lang="ts">
	import { 
		calculateHydroPower, 
		calculateAnnualEnergy, 
		estimateHomesPowered, 
		getHydroClassification,
		calculateTurbineEfficiency,
		turbineTypes
	} from '$lib/hydroPower';
	import { onMount } from 'svelte';
	import PowerChart from '$lib/components/PowerChart.svelte';
	import EfficiencyChart from '$lib/components/EfficiencyChart.svelte';
	import AnnualEnergyChart from '$lib/components/AnnualEnergyChart.svelte';
	import CO2ReductionChart from '$lib/components/CO2ReductionChart.svelte';
	import TurbineEfficiencyChart from '$lib/components/TurbineEfficiencyChart.svelte';
	import TurbineSelector from '$lib/components/TurbineSelector.svelte';
	import EconomicsChart from '$lib/components/EconomicsChart.svelte';

	// Default values - adjusted for micro/small hydro
	let flowRate = 0.5; // m³/s
	let head = 10; // meters
	let efficiency = 0.75; // 75%
	
	// 稼働時間の設定
	let annualOperationRate = 95; // 年間稼働率 (%)
	let operatingHours = 8760; // hours per year (calculated)
	
	let averageHomeConsumption = 3500; // kWh per year
	let electricityPrice = 36; // JPY per kWh (FIT price for small hydro)
	
	// Selected turbine
	let selectedTurbineId = "crossflow";
	
	// Results
	let powerOutput = 0; // kW
	let annualEnergy = 0; // MWh
	let homesPowered = 0;
	let hydroClass = { name: "", maxPower: 0 };
	let actualEfficiency = 0;
	
	// 水流量のリットル単位換算
	$: flowRateLiters = flowRate * 1000; // m³/s to L/s

	// 稼働時間の計算 (年間稼働率から)
	$: operatingHours = Math.round((annualOperationRate / 100) * 8760);
	
	// 異なる時間単位での発電量計算
	$: powerOutputMinute = powerOutput * (1/60); // kWh in 1 minute
	$: powerOutputHour = powerOutput; // kWh in 1 hour
	$: powerOutputDay = powerOutput * 24; // kWh in 1 day
	$: powerOutputWeek = powerOutput * 24 * 7; // kWh in 7 days
	$: powerOutputMonth = powerOutput * 24 * 30; // kWh in 1 month (approx)

	// Calculate results on load and when inputs change
	$: {
		// Get selected turbine
		const selectedTurbine = turbineTypes.find(t => t.id === selectedTurbineId);
		
		// Calculate actual efficiency based on turbine type and flow conditions
		actualEfficiency = selectedTurbine 
			? calculateTurbineEfficiency(selectedTurbine, flowRate)
			: efficiency;
		
		// Calculate results
		powerOutput = calculateHydroPower(flowRate, head, actualEfficiency);
		annualEnergy = calculateAnnualEnergy(powerOutput, operatingHours);
		homesPowered = estimateHomesPowered(annualEnergy, averageHomeConsumption);
		hydroClass = getHydroClassification(powerOutput);
	}

	// 入力値の制限を処理する関数
	function handleFlowRateChange(value: number) {
		flowRate = Math.max(0, value);
	}

	function handleHeadChange(value: number) {
		head = Math.max(0, value);
	}

	function handleOperationRateChange(value: number) {
		annualOperationRate = Math.min(100, Math.max(0, value));
	}

	// Format number with commas and specified decimal places
	function formatNumber(num: number, decimals: number = 2): string {
		return num.toLocaleString('en-US', { 
			minimumFractionDigits: decimals,
			maximumFractionDigits: decimals
		});
	}
	
	// Active tab for visualization
	let activeTab = "power";
</script>

<div class="container">
	<header>
		<h1>マイクロ・小水力発電シミュレーター</h1>
		<p>水流のパラメータを入力して、小規模水力発電の可能性を探ります。</p>
	</header>

	<div class="card">
		<h2>入力パラメータ</h2>
		
		<div class="parameter-grid">
			<div class="parameter-card water-flow">
				<div class="parameter-icon">
					<svg viewBox="0 0 24 24" width="31" height="31">
						<path fill="currentColor" d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
					</svg>
				</div>
				<div class="parameter-content">
					<label for="flowRate">水流量 (m³/秒)</label>
					<div class="slider-with-input">
						<input 
							type="range" 
							id="flowRateSlider" 
							bind:value={flowRate} 
							min="0.001" 
							max="5"
							step="0.001"
							on:input={(e) => handleFlowRateChange(parseFloat((e.target as HTMLInputElement).value))}
						/>
						<input 
							type="number" 
							id="flowRate" 
							bind:value={flowRate} 
							min="0.001" 
							max="30"
							step="0.001"
							on:input={(e) => handleFlowRateChange(parseFloat((e.target as HTMLInputElement).value))}
						/>
					</div>
					<div class="value-range">
						<span>0.001</span>
						<span class="current-value">{flowRate.toFixed(3)}</span>
						<span>5.000</span>
					</div>
					<div class="flow-rate-conversion">
						<span class="conversion-value">{formatNumber(flowRateLiters, 1)} L/秒</span>
					</div>
					<div class="input-hint">マイクロ水力発電では通常 0.01～5 m³/秒程度</div>
				</div>
			</div>

			<div class="parameter-card water-head">
				<div class="parameter-icon">
					<svg viewBox="0 0 24 24" width="24" height="24">
						<path fill="currentColor" d="M12,3L2,12H5V20H19V12H22L12,3M12,8.5C14.34,8.5 16.46,9.43 18,10.94L16.8,12.12C15.58,10.91 13.88,10.17 12,10.17C10.12,10.17 8.42,10.91 7.2,12.12L6,10.94C7.54,9.43 9.66,8.5 12,8.5Z" />
					</svg>
				</div>
				<div class="parameter-content">
					<label for="head">有効落差 (メートル)</label>
					<div class="slider-with-input">
						<input 
							type="range" 
							id="headSlider" 
							bind:value={head} 
							min="0.1" 
							max="100"
							step="0.1"
							on:input={(e) => handleHeadChange(parseFloat((e.target as HTMLInputElement).value))}
						/>
						<input 
							type="number" 
							id="head" 
							bind:value={head} 
							min="0.1" 
							max="200"
							step="0.1"
							on:input={(e) => handleHeadChange(parseFloat((e.target as HTMLInputElement).value))}
						/>
					</div>
					<div class="value-range">
						<span>0.1</span>
						<span class="current-value">{head.toFixed(1)}</span>
						<span>100</span>
					</div>
					<div class="input-hint">マイクロ水力発電では通常 1～100 メートル程度</div>
				</div>
			</div>

			<div class="parameter-card operating-hours">
				<div class="parameter-icon">
					<svg viewBox="0 0 24 24" width="24" height="24">
						<path fill="currentColor" d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z" />
					</svg>
				</div>
				<div class="parameter-content">
					<label for="operatingHours">稼働時間設定</label>
					<div class="operating-time-settings">
						<div class="time-setting">
							<label for="annualOperationRate">年間稼働率 (%)</label>
							<div class="slider-with-input">
								<input 
									type="range" 
									id="annualOperationRateSlider" 
									bind:value={annualOperationRate} 
									min="0" 
									max="100"
									step="1"
									on:input={(e) => handleOperationRateChange(parseInt((e.target as HTMLInputElement).value))}
								/>
								<input 
									type="number" 
									id="annualOperationRate" 
									bind:value={annualOperationRate} 
									min="0" 
									max="100"
									step="1"
									on:input={(e) => handleOperationRateChange(parseInt((e.target as HTMLInputElement).value))}
								/>
							</div>
							<div class="value-range">
								<span>0%</span>
								<span class="current-value">{annualOperationRate}%</span>
								<span>100%</span>
							</div>
						</div>
					</div>
					<div class="annual-hours">
						<span>年間稼働時間: </span>
						<span class="current-value">{operatingHours}</span>
						<span> 時間</span>
					</div>
					<div class="input-hint">水力発電は連続運転が基本ですが、メンテナンスや水量不足などで稼働できない期間があります。<br>最大: 8,760時間 (24時間 × 365日 = 100%稼働)</div>
				</div>
			</div>

			<div class="parameter-card home-consumption">
				<div class="parameter-icon">
					<svg viewBox="0 0 24 24" width="24" height="24">
						<path fill="currentColor" d="M10,2V4H14V2H10M11,8H13V6H11V8M10,22V20H14V22H10M11,16H13V14H11V16M11,12H13V10H11V12M18,2V4H22V2H18M19,8H21V6H19V8M18,22V20H22V22H18M19,16H21V14H19V16M19,12H21V10H19V12M2,2V4H6V2H2M3,8H5V6H3V8M2,22V20H6V22H2M3,16H5V14H3V16M3,12H5V10H3V12Z" />
					</svg>
				</div>
				<div class="parameter-content">
					<label for="homeConsumption">一般家庭の年間平均消費電力 (kWh/年)</label>
					<div class="slider-with-input">
						<input 
							type="range" 
							id="homeConsumptionSlider" 
							bind:value={averageHomeConsumption} 
							min="1000" 
							max="6000" 
							step="100"
						/>
						<input 
							type="number" 
							id="homeConsumption" 
							bind:value={averageHomeConsumption} 
							min="1000" 
							step="100"
						/>
					</div>
					<div class="value-range">
						<span>1000</span>
						<span class="current-value">{averageHomeConsumption}</span>
						<span>6000</span>
					</div>
					<div class="input-hint">日本の一般家庭の平均: 約3,500kWh/年</div>
				</div>
			</div>

			<div class="parameter-card electricity-price">
				<div class="parameter-icon">
					<svg viewBox="0 0 24 24" width="24" height="24">
						<path fill="currentColor" d="M12.5,3C17.15,3 21.08,6.03 22.47,10.22L20.1,11C19.05,7.81 16.04,5.5 12.5,5.5C8.46,5.5 5.13,8.46 5.13,12C5.13,15.54 8.46,18.5 12.5,18.5C16.04,18.5 19.05,16.19 20.1,13L22.47,13.78C21.08,17.97 17.15,21 12.5,21C7.25,21 3,16.75 3,11.5C3,6.25 7.25,2 12.5,2V3Z" />
					</svg>
				</div>
				<div class="parameter-content">
					<label for="electricityPrice">売電価格 (円/kWh)</label>
					<div class="slider-with-input">
						<input 
							type="range" 
							id="electricityPriceSlider" 
							bind:value={electricityPrice} 
							min="10" 
							max="50" 
							step="0.5"
						/>
						<input 
							type="number" 
							id="electricityPrice" 
							bind:value={electricityPrice} 
							min="10" 
							max="100"
							step="0.1"
						/>
					</div>
					<div class="value-range">
						<span>10</span>
						<span class="current-value">{electricityPrice.toFixed(1)}</span>
						<span>50</span>
					</div>
					<div class="input-hint">FIT制度での小水力発電の買取価格: 約34～36円/kWh</div>
				</div>
			</div>
		</div>
	</div>
	
	<div class="card">
		<h2>水車タイプの選択</h2>
		<TurbineSelector 
			{head} 
			{flowRate} 
			bind:selectedTurbineId
		/>
	</div>

	<div class="card results">
		<h2>計算結果</h2>
		
		<div class="classification-banner">
			<div class="classification-label">発電規模分類:</div>
			<div class="classification-value">{hydroClass.name}</div>
		</div>

		<div class="results-grid">
			<div class="result-section power-section">
				<h3>発電出力と発電量</h3>
				
				<div class="result-main-value">
					<div class="main-value-label">発電出力:</div>
					<div class="main-value">{formatNumber(powerOutput)} kW</div>
				</div>
				
				<div class="result-sub-grid">
					<div class="period-header">期間</div>
					<div class="period-header">発電量</div>
					
					<div class="period-label">1分:</div>
					<div class="period-value">{formatNumber(powerOutputMinute)} kWh</div>
					
					<div class="period-label">1時間:</div>
					<div class="period-value">{formatNumber(powerOutputHour)} kWh</div>
					
					<div class="period-label">1日:</div>
					<div class="period-value">{formatNumber(powerOutputDay)} kWh</div>
					
					<div class="period-label">7日:</div>
					<div class="period-value">{formatNumber(powerOutputWeek)} kWh</div>
					
					<div class="period-label">1ヶ月:</div>
					<div class="period-value">{formatNumber(powerOutputMonth)} kWh</div>
				</div>
				
				<div class="result-main-value annual-energy">
					<div class="main-value-label">年間発電量:</div>
					<div class="main-value">{formatNumber(annualEnergy)} MWh</div>
					<div class="main-value-sub">({formatNumber(annualEnergy * 1000)} kWh/年)</div>
				</div>
			</div>
			
			<div class="result-section efficiency-section">
				<h3>効率と性能</h3>
				
				<div class="result-main-value">
					<div class="main-value-label">水車効率:</div>
					<div class="main-value">{formatNumber(actualEfficiency * 100, 1)}%</div>
				</div>
				
				<div class="result-main-value">
					<div class="main-value-label">一般家庭供給可能数:</div>
					<div class="main-value">{formatNumber(homesPowered, 0)} 世帯</div>
				</div>
				
				<div class="result-main-value">
					<div class="main-value-label">二酸化炭素削減量:</div>
					<div class="main-value">{formatNumber(annualEnergy * 0.5, 1)} トン/年</div>
					<div class="sub-note">※火力発電と比較した場合の概算値</div>
				</div>
			</div>
		</div>
	</div>

	<div class="card">
		<h2>データ可視化</h2>
		
		<div class="tabs">
			<button 
				class="tab-button {activeTab === 'power' ? 'active' : ''}" 
				on:click={() => activeTab = 'power'}
			>
				発電出力
			</button>
			<button 
				class="tab-button {activeTab === 'turbine' ? 'active' : ''}" 
				on:click={() => activeTab = 'turbine'}
			>
				水車効率
			</button>
			<button 
				class="tab-button {activeTab === 'energy' ? 'active' : ''}" 
				on:click={() => activeTab = 'energy'}
			>
				発電量
			</button>
			<button 
				class="tab-button {activeTab === 'economics' ? 'active' : ''}" 
				on:click={() => activeTab = 'economics'}
			>
				経済性
			</button>
			<button 
				class="tab-button {activeTab === 'environment' ? 'active' : ''}" 
				on:click={() => activeTab = 'environment'}
			>
				環境影響
			</button>
		</div>
		
		<div class="tab-content">
			{#if activeTab === 'power'}
				<div class="visualization-section">
					<h3>発電出力の関係性</h3>
					<PowerChart flowRate={flowRate} head={head} efficiency={actualEfficiency} />
				</div>
				
				<div class="visualization-section">
					<h3>効率と発電出力の関係</h3>
					<EfficiencyChart flowRate={flowRate} head={head} efficiency={actualEfficiency} />
				</div>
			{:else if activeTab === 'turbine'}
				<div class="visualization-section">
					<h3>水車効率曲線</h3>
					<TurbineEfficiencyChart selectedTurbineId={selectedTurbineId} flowRate={flowRate} />
				</div>
			{:else if activeTab === 'energy'}
				<div class="visualization-section">
					<h3>月間発電量予測</h3>
					<AnnualEnergyChart powerOutput={powerOutput} operatingHours={operatingHours} />
				</div>
			{:else if activeTab === 'economics'}
				<div class="visualization-section">
					<h3>経済性評価</h3>
					<EconomicsChart 
						powerKW={powerOutput} 
						annualEnergyMWh={annualEnergy} 
						selectedTurbineId={selectedTurbineId}
						electricityPrice={electricityPrice}
					/>
				</div>
			{:else if activeTab === 'environment'}
				<div class="visualization-section">
					<h3>環境への影響</h3>
					<CO2ReductionChart annualEnergy={annualEnergy} />
				</div>
			{/if}
		</div>
	</div>

	<div class="card">
		<h2>マイクロ・小水力発電について</h2>
		<div class="info-section">
			<h3>発電規模の分類</h3>
			<div class="classification-table">
				<div class="classification-row header">
					<div class="classification-cell">分類</div>
					<div class="classification-cell">発電出力</div>
					<div class="classification-cell">主な用途</div>
				</div>
				<div class="classification-row">
					<div class="classification-cell">ピコ水力</div>
					<div class="classification-cell">5kW未満</div>
					<div class="classification-cell">個人宅、小規模施設</div>
				</div>
				<div class="classification-row">
					<div class="classification-cell">マイクロ水力</div>
					<div class="classification-cell">5kW～100kW</div>
					<div class="classification-cell">集落、小規模事業所</div>
				</div>
				<div class="classification-row">
					<div class="classification-cell">ミニ水力</div>
					<div class="classification-cell">100kW～1,000kW</div>
					<div class="classification-cell">地域供給、小規模売電</div>
				</div>
				<div class="classification-row">
					<div class="classification-cell">小水力</div>
					<div class="classification-cell">1,000kW～10,000kW</div>
					<div class="classification-cell">売電事業、地域供給</div>
				</div>
			</div>
		</div>
		
		<div class="info-section">
			<h3>主な水車タイプと特徴</h3>
			<p>水車の選定は、有効落差と水流量に基づいて行います。適切な水車を選ぶことで、効率を最大化できます。</p>
			<ul>
				<li><strong>ペルトン水車</strong>: 高落差・低流量に適しています。山間部の小さな水路に最適です。</li>
				<li><strong>クロスフロー水車</strong>: 中～低落差、中～高流量に適しています。幅広い条件で使用可能です。</li>
				<li><strong>カプラン水車</strong>: 低落差・高流量に適しています。河川や用水路に最適です。</li>
				<li><strong>フランシス水車</strong>: 中落差・中流量に適しています。汎用性が高く、多くの条件で使用できます。</li>
				<li><strong>アルキメデススクリュー</strong>: 超低落差・中流量に適しています。魚に優しい設計で生態系への影響が少ないです。</li>
			</ul>
		</div>
		
		<div class="info-section">
			<h3>設置場所の例</h3>
			<ul>
				<li><strong>農業用水路</strong>: 既存の灌漑用水路を利用した発電</li>
				<li><strong>小河川・渓流</strong>: 山間部の小さな河川や渓流を利用</li>
				<li><strong>上下水道施設</strong>: 水道管の落差を利用した発電</li>
				<li><strong>工場排水</strong>: 工場からの排水を利用した発電</li>
				<li><strong>温泉排水</strong>: 温泉施設からの排水を利用</li>
			</ul>
		</div>
		
		<div class="info-section">
			<h3>発電量の計算式</h3>
			<div class="formula-explanation">
				<div class="formula-box">
					<p class="formula">P = η × ρ × g × Q × H</p>
				</div>
				
				<div class="formula-meaning">
					<h4>計算式の意味をわかりやすく説明すると…</h4>
					<p>水力発電の仕組みは、<strong>「高いところから落ちる水の力」</strong>を利用して電気を作ることです。</p>
					
					<div class="formula-components">
						<div class="component">
							<span class="symbol">P</span>
							<span class="description">発電出力（ワット）- 作り出せる電気の量</span>
						</div>
						
						<div class="component">
							<span class="symbol">η</span>
							<span class="description">効率 - 水の力がどれだけ電気に変わるか（0～1の数字）</span>
						</div>
						
						<div class="component">
							<span class="symbol">ρ</span>
							<span class="description">水の密度 - 1リットルの水は1キログラム（1000 kg/m³）</span>
						</div>
						
						<div class="component">
							<span class="symbol">g</span>
							<span class="description">重力加速度 - 物が落ちる速さ（9.81 m/s²）</span>
						</div>
						
						<div class="component">
							<span class="symbol">Q</span>
							<span class="description">水の流量 - 1秒間に流れる水の量（m³/秒）</span>
						</div>
						
						<div class="component">
							<span class="symbol">H</span>
							<span class="description">有効落差 - 水が落ちる高さ（メートル）</span>
						</div>
					</div>
				</div>
				
				<div class="formula-example">
					<h4>計算例</h4>
					<p>例えば、次のような条件で計算してみましょう：</p>
					<ul>
						<li>水の流量(Q): 0.5 m³/秒（お風呂約2.5杯分の水が毎秒流れる量）</li>
						<li>落差(H): 10 メートル（3階建ての建物くらいの高さ）</li>
						<li>効率(η): 0.75（水の力の75%が電気になる）</li>
					</ul>
					<p>計算すると：P = 0.75 × 1000 × 9.81 × 0.5 × 10 = <strong>36,787.5 ワット</strong> ≈ <strong>36.8 キロワット</strong></p>
					<p>これは一般家庭約10軒分の電力をまかなえる量です！</p>
				</div>
				
				<div class="formula-visual">
					<div class="visual-container">
						<div class="water-flow">
							<div class="water-level">水の高さ (H)</div>
							<div class="arrow-down">↓</div>
							<div class="turbine">水車</div>
							<div class="generator">発電機</div>
							<div class="electricity">電気 (P)</div>
						</div>
						<div class="flow-rate">
							<div class="arrow-right">→</div>
							<div class="flow-text">水の流れ (Q)</div>
						</div>
					</div>
					<p class="visual-caption">水の高さ(H)と流量(Q)が大きいほど、より多くの電気が作れます。<br>効率(η)が良いほど、水の力をより多く電気に変換できます。</p>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	:global(body) {
		background-color: #f5f7fa;
		color: #333;
		font-family: 'Helvetica Neue', Arial, sans-serif;
		line-height: 1.6;
		margin: 0;
		padding: 0;
	}

	.container {
		max-width: 1000px;
		margin: 0 auto;
		padding: 20px;
	}

	header {
		text-align: center;
		margin-bottom: 30px;
	}

	h1 {
		color: #2c3e50;
		font-size: 2.2rem;
		margin-bottom: 10px;
	}

	h2 {
		color: #2c3e50;
		font-size: 1.5rem;
		margin-bottom: 20px;
		border-bottom: 2px solid #eee;
		padding-bottom: 10px;
	}

	h3 {
		color: #2c3e50;
		font-size: 1.2rem;
		margin-bottom: 15px;
	}

	.card {
		background-color: white;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
		padding: 25px;
		margin-bottom: 25px;
	}

	label {
		display: block;
		margin-bottom: 8px;
		font-weight: 500;
	}

	input[type="number"] {
		width: 100%;
		padding: 10px;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 16px;
	}
	
	.input-hint {
		font-size: 0.8rem;
		color: #666;
		margin-top: 5px;
	}

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
		background: #3498db;
		border-radius: 50%;
		cursor: pointer;
	}

	.results {
		background-color: #f8f9fa;
	}
	
	.classification-banner {
		display: flex;
		align-items: center;
		background-color: #ebf5fb;
		padding: 12px 20px;
		border-radius: 8px;
		margin-bottom: 25px;
		box-shadow: 0 2px 5px rgba(0,0,0,0.05);
	}
	
	.classification-label {
		font-weight: 600;
		margin-right: 10px;
		color: #2c3e50;
		font-size: 1.1rem;
	}
	
	.classification-value {
		font-size: 1.3rem;
		font-weight: 700;
		color: #3498db;
	}
	
	.results-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 25px;
	}
	
	.result-section {
		background-color: white;
		border-radius: 10px;
		padding: 20px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.05);
	}
	
	.result-section h3 {
		margin-top: 0;
		margin-bottom: 20px;
		color: #2c3e50;
		font-size: 1.2rem;
		padding-bottom: 10px;
		border-bottom: 2px solid #f1f1f1;
	}
	
	.power-section {
		border-left: 5px solid #3498db;
	}
	
	.efficiency-section {
		border-left: 5px solid #2ecc71;
	}
	
	.result-main-value {
		display: flex;
		align-items: baseline;
		margin-bottom: 20px;
		flex-wrap: wrap;
	}
	
	.main-value-label {
		font-weight: 500;
		color: #555;
		margin-right: 10px;
		min-width: 120px;
	}
	
	.main-value {
		font-weight: 700;
		color: #2980b9;
		font-size: 1.4rem;
	}
	
	.annual-energy {
		margin-top: 25px;
		padding-top: 15px;
		border-top: 1px dashed #ddd;
	}
	
	.main-value-sub {
		color: #7f8c8d;
		font-size: 0.9rem;
		margin-left: 10px;
	}
	
	.result-sub-grid {
		display: grid;
		grid-template-columns: 100px 1fr;
		gap: 10px;
		align-items: center;
		background-color: #f8f9fa;
		padding: 15px;
		border-radius: 8px;
		margin-top: 5px;
	}
	
	.period-header {
		font-weight: 600;
		color: #555;
		font-size: 0.9rem;
		padding-bottom: 5px;
		margin-bottom: 5px;
		border-bottom: 1px solid #e0e0e0;
	}
	
	.period-label {
		color: #666;
		font-size: 1rem;
		text-align: right;
		padding-right: 10px;
	}
	
	.period-value {
		font-weight: 600;
		color: #2980b9;
		font-size: 1.05rem;
	}
	
	.sub-note {
		font-size: 0.8rem;
		color: #7f8c8d;
		margin-top: 5px;
		font-style: italic;
	}
	
	@media (max-width: 768px) {
		.results-grid {
			grid-template-columns: 1fr;
		}
		
		.result-main-value {
			flex-direction: column;
			align-items: flex-start;
		}
		
		.main-value-label {
			margin-bottom: 5px;
		}
		
		.main-value-sub {
			margin-left: 0;
			margin-top: 5px;
		}
	}
	
	.tabs {
		display: flex;
		flex-wrap: wrap;
		border-bottom: 1px solid #ddd;
		margin-bottom: 20px;
	}
	
	.tab-button {
		background: none;
		border: none;
		padding: 10px 20px;
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 500;
		color: #555;
		transition: all 0.2s ease;
		border-bottom: 3px solid transparent;
		margin-right: 5px;
	}
	
	.tab-button:hover {
		color: #3498db;
	}
	
	.tab-button.active {
		color: #3498db;
		border-bottom-color: #3498db;
	}
	
	.tab-content {
		padding: 10px 0;
	}

	.visualization-section {
		margin-bottom: 30px;
	}

	.visualization-section:last-child {
		margin-bottom: 0;
	}
	
	.info-section {
		margin-bottom: 25px;
		padding-bottom: 20px;
		border-bottom: 1px solid #eee;
	}
	
	.info-section:last-child {
		border-bottom: none;
		margin-bottom: 0;
		padding-bottom: 0;
	}
	
	.classification-table {
		width: 100%;
		border-collapse: collapse;
		margin: 15px 0;
		font-size: 0.9rem;
	}
	
	.classification-row {
		display: flex;
		border-bottom: 1px solid #eee;
	}
	
	.classification-row.header {
		background-color: #f8f9fa;
		font-weight: 600;
	}
	
	.classification-cell {
		padding: 10px;
		flex: 1;
	}
	
	.classification-cell:first-child {
		flex: 0.8;
		font-weight: 500;
	}

	ul {
		margin-left: 20px;
		margin-bottom: 15px;
	}

	li {
		margin-bottom: 5px;
	}

	@media (max-width: 768px) {
		.container {
			padding: 15px;
		}
		
		.card {
			padding: 20px;
		}
		
		h1 {
			font-size: 1.8rem;
		}
		
		h2 {
			font-size: 1.3rem;
		}
		
		.tabs {
			flex-direction: column;
			border-bottom: none;
		}
		
		.tab-button {
			width: 100%;
			text-align: left;
			border-bottom: 1px solid #ddd;
			margin-bottom: 5px;
		}
		
		.tab-button.active {
			border-left: 3px solid #3498db;
			border-bottom-color: #ddd;
			padding-left: 17px;
		}
		
		.classification-row {
			flex-direction: column;
		}
		
		.classification-cell {
			padding: 8px 10px;
		}
		
		.classification-cell:not(:last-child) {
			border-bottom: 1px solid #f5f5f5;
		}
	}

	.visual-caption {
		font-size: 0.9rem;
		color: #555;
		margin-top: 10px;
	}
	
	/* 発電量計算式の説明スタイル */
	.formula-explanation {
		background-color: #f8f9fa;
		border-radius: 8px;
		padding: 20px;
		margin-top: 15px;
	}
	
	.formula-box {
		background-color: #e8f4fc;
		border-radius: 6px;
		padding: 15px;
		text-align: center;
		margin-bottom: 20px;
	}
	
	.formula {
		font-size: 1.5rem;
		font-weight: bold;
		color: #2980b9;
		margin: 0;
	}
	
	.formula-meaning {
		margin-bottom: 25px;
	}
	
	.formula-meaning h4 {
		color: #2c3e50;
		margin-bottom: 10px;
	}
	
	.formula-components {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 15px;
		margin-top: 15px;
	}
	
	.component {
		display: flex;
		align-items: center;
		background-color: white;
		padding: 10px 15px;
		border-radius: 6px;
		box-shadow: 0 1px 3px rgba(0,0,0,0.1);
	}
	
	.symbol {
		font-weight: bold;
		font-size: 1.2rem;
		color: #3498db;
		margin-right: 15px;
		min-width: 30px;
	}
	
	.description {
		font-size: 0.9rem;
	}
	
	.formula-example {
		background-color: #eafaf1;
		border-radius: 6px;
		padding: 15px;
		margin-bottom: 25px;
	}
	
	.formula-example h4 {
		color: #27ae60;
		margin-bottom: 10px;
	}
	
	.formula-example ul {
		margin-bottom: 15px;
	}
	
	.formula-visual {
		text-align: center;
	}
	
	.visual-container {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-bottom: 15px;
		gap: 20px;
	}
	
	.water-flow {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
	}
	
	.water-level {
		background-color: #3498db;
		color: white;
		padding: 8px 15px;
		border-radius: 4px;
	}
	
	.arrow-down {
		font-size: 1.5rem;
		color: #3498db;
	}
	
	.turbine {
		background-color: #f39c12;
		color: white;
		padding: 8px 15px;
		border-radius: 4px;
	}
	
	.generator {
		background-color: #9b59b6;
		color: white;
		padding: 8px 15px;
		border-radius: 4px;
	}
	
	.electricity {
		background-color: #e74c3c;
		color: white;
		padding: 8px 15px;
		border-radius: 4px;
	}
	
	.flow-rate {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	
	.arrow-right {
		font-size: 1.5rem;
		color: #3498db;
	}
	
	.flow-text {
		background-color: #3498db;
		color: white;
		padding: 8px 15px;
		border-radius: 4px;
	}
	
	/* 入力パラメータのスタイル */
	.parameter-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 20px;
	}
	
	.parameter-card {
		background-color: white;
		border-radius: 10px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
		padding: 20px;
		display: flex;
		transition: all 0.3s ease;
		border-left: 4px solid #3498db;
	}
	
	.parameter-card:hover {
		transform: translateY(-3px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}
	
	.parameter-icon {
		margin-right: 15px;
		color: #3498db;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		background-color: #ebf5fb;
		border-radius: 8px;
	}
	
	.parameter-content {
		flex: 1;
	}
	
	.water-flow {
		border-left-color: #3498db;
	}
	
	.water-flow .parameter-icon {
		background-color: #ebf5fb;
		color: #3498db;
	}
	
	.water-head {
		border-left-color: #2ecc71;
	}
	
	.water-head .parameter-icon {
		background-color: #eafaf1;
		color: #2ecc71;
	}
	
	.operating-hours {
		border-left-color: #9b59b6;
	}
	
	.operating-hours .parameter-icon {
		background-color: #f4ecf7;
		color: #9b59b6;
	}
	
	.home-consumption {
		border-left-color: #e67e22;
	}
	
	.home-consumption .parameter-icon {
		background-color: #fef5e7;
		color: #e67e22;
	}
	
	.electricity-price {
		border-left-color: #e74c3c;
	}
	
	.electricity-price .parameter-icon {
		background-color: #fdedec;
		color: #e74c3c;
	}
	
	.slider-with-input {
		display: flex;
		align-items: center;
		gap: 10px;
		margin: 10px 0;
	}
	
	.slider-with-input input[type="range"] {
		flex: 1;
		-webkit-appearance: none;
		appearance: none;
		height: 6px;
		background: #ddd;
		border-radius: 3px;
		outline: none;
	}
	
	.slider-with-input input[type="range"]::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 18px;
		height: 18px;
		background: #3498db;
		border-radius: 50%;
		cursor: pointer;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
	}
	
	.slider-with-input input[type="range"]::-moz-range-thumb {
		width: 18px;
		height: 18px;
		background: #3498db;
		border-radius: 50%;
		cursor: pointer;
		border: none;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
	}
	
	.slider-with-input input[type="number"] {
		width: 80px;
		text-align: center;
	}
	
	.value-range {
		display: flex;
		justify-content: space-between;
		font-size: 0.8rem;
		color: #777;
		margin-bottom: 5px;
	}
	
	.current-value {
		font-weight: bold;
		color: #3498db;
		background-color: #ebf5fb;
		padding: 2px 8px;
		border-radius: 10px;
	}
	
	.water-head .current-value {
		color: #2ecc71;
		background-color: #eafaf1;
	}
	
	.operating-hours .current-value {
		color: #9b59b6;
		background-color: #f4ecf7;
	}
	
	.home-consumption .current-value {
		color: #e67e22;
		background-color: #fef5e7;
	}
	
	.electricity-price .current-value {
		color: #e74c3c;
		background-color: #fdedec;
	}
	
	@media (max-width: 768px) {
		.parameter-grid {
			grid-template-columns: 1fr;
		}
		
		.slider-with-input {
			flex-direction: column;
			align-items: stretch;
		}
		
		.slider-with-input input[type="number"] {
			width: 100%;
		}
	}
	
	/* 新しいスタイル */
	.flow-rate-conversion {
		text-align: center;
		margin: 5px 0;
	}
	
	.conversion-value {
		font-weight: bold;
		color: #3498db;
		background-color: #ebf5fb;
		padding: 4px 10px;
		border-radius: 12px;
		font-size: 0.9rem;
	}
	
	.operating-time-settings {
		display: flex;
		flex-direction: column;
		gap: 15px;
		margin-bottom: 10px;
	}
	
	.time-setting {
		background-color: rgba(255, 255, 255, 0.5);
		padding: 10px;
		border-radius: 6px;
	}
	
	.time-setting label {
		font-size: 0.9rem;
		margin-bottom: 5px;
	}
	
	.annual-hours {
		text-align: center;
		margin: 10px 0;
		font-size: 0.9rem;
	}
	
	.annual-hours .current-value {
		font-size: 1.1rem;
	}
	
	@media (max-width: 768px) {
		.operating-time-settings {
			flex-direction: column;
		}
		
		.time-setting {
			width: 100%;
		}
	}
	
	.power-output-periods {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 10px;
		margin-top: 10px;
		background-color: #f8f9fa;
		padding: 10px;
		border-radius: 6px;
	}
	
	.period-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 8px;
		background-color: white;
		border-radius: 4px;
		box-shadow: 0 1px 3px rgba(0,0,0,0.05);
	}
	
	.period-label {
		font-size: 0.8rem;
		color: #666;
		margin-bottom: 4px;
	}
	
	.period-value {
		font-weight: 600;
		color: #2980b9;
	}
</style>
