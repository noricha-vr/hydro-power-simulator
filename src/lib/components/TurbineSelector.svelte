<script lang="ts">
  import { turbineTypes, getSuitableTurbines } from '$lib/hydroPower';
  
  // Props
  export let head: number;
  export let flowRate: number;
  export let selectedTurbineId: string;
  
  // Get suitable turbines based on head and flow rate
  $: suitableTurbines = getSuitableTurbines(head, flowRate);
  
  // Set default turbine if none selected or current selection is not suitable
  $: {
    if (suitableTurbines.length > 0) {
      if (!selectedTurbineId || !suitableTurbines.some(t => t.id === selectedTurbineId)) {
        selectedTurbineId = suitableTurbines[0].id;
      }
    } else {
      // If no suitable turbines, select the first one as fallback
      selectedTurbineId = turbineTypes[0].id;
    }
  }
  
  // Get the selected turbine object
  $: selectedTurbine = turbineTypes.find(t => t.id === selectedTurbineId);
  
  // Check if a turbine is suitable for the current conditions
  function isSuitable(turbine: typeof turbineTypes[0]): boolean {
    return head >= turbine.minHead && 
           head <= turbine.maxHead && 
           flowRate >= turbine.minFlow && 
           flowRate <= turbine.maxFlow;
  }
</script>

<div class="turbine-selector">
  <h3>水車タイプの選択</h3>
  
  {#if suitableTurbines.length === 0}
    <div class="warning-message">
      <p>
        <strong>注意:</strong> 現在の水流量と有効落差の条件に最適な水車タイプがありません。
        条件を調整するか、以下から最も近い水車タイプを選択してください。
      </p>
    </div>
  {/if}
  
  <div class="turbine-options">
    {#each turbineTypes as turbine}
      <div 
        class="turbine-option {selectedTurbineId === turbine.id ? 'selected' : ''} {isSuitable(turbine) ? 'suitable' : 'unsuitable'}"
        on:click={() => selectedTurbineId = turbine.id}
      >
        <div class="turbine-header">
          <h4>{turbine.name}</h4>
          {#if isSuitable(turbine)}
            <span class="suitability-badge suitable">適合</span>
          {:else}
            <span class="suitability-badge unsuitable">不適合</span>
          {/if}
        </div>
        <p class="turbine-description">{turbine.description}</p>
        <div class="turbine-specs">
          <div class="spec-item">
            <span class="spec-label">落差範囲:</span>
            <span class="spec-value">{turbine.minHead}～{turbine.maxHead} m</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">流量範囲:</span>
            <span class="spec-value">{turbine.minFlow}～{turbine.maxFlow} m³/s</span>
          </div>
        </div>
      </div>
    {/each}
  </div>
  
  {#if selectedTurbine}
    <div class="selected-turbine-info">
      <h4>選択中: {selectedTurbine.name}</h4>
      <p>{selectedTurbine.description}</p>
    </div>
  {/if}
</div>

<style>
  .turbine-selector {
    margin-bottom: 30px;
  }
  
  h3 {
    margin-bottom: 15px;
    color: #2c3e50;
  }
  
  .warning-message {
    background-color: #fff3cd;
    color: #856404;
    padding: 12px 15px;
    border-radius: 6px;
    margin-bottom: 15px;
    font-size: 0.9rem;
  }
  
  .turbine-options {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
  }
  
  .turbine-option {
    background-color: #f8f9fa;
    border: 2px solid #eee;
    border-radius: 8px;
    padding: 15px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .turbine-option:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .turbine-option.selected {
    border-color: #3498db;
    background-color: #ebf5fb;
  }
  
  .turbine-option.suitable {
    border-left: 4px solid #2ecc71;
  }
  
  .turbine-option.unsuitable {
    border-left: 4px solid #e74c3c;
    opacity: 0.8;
  }
  
  .turbine-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .turbine-header h4 {
    margin: 0;
    font-size: 1rem;
    color: #2c3e50;
  }
  
  .suitability-badge {
    font-size: 0.7rem;
    padding: 3px 8px;
    border-radius: 12px;
    font-weight: 600;
  }
  
  .suitability-badge.suitable {
    background-color: #d4edda;
    color: #155724;
  }
  
  .suitability-badge.unsuitable {
    background-color: #f8d7da;
    color: #721c24;
  }
  
  .turbine-description {
    font-size: 0.85rem;
    color: #555;
    margin-bottom: 12px;
  }
  
  .turbine-specs {
    font-size: 0.8rem;
    background-color: #f1f1f1;
    padding: 8px 10px;
    border-radius: 4px;
  }
  
  .spec-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
  }
  
  .spec-label {
    color: #666;
  }
  
  .spec-value {
    font-weight: 500;
    color: #333;
  }
  
  .selected-turbine-info {
    margin-top: 20px;
    padding: 15px;
    background-color: #ebf5fb;
    border-radius: 6px;
    border-left: 4px solid #3498db;
  }
  
  .selected-turbine-info h4 {
    margin: 0 0 10px 0;
    color: #2c3e50;
  }
  
  .selected-turbine-info p {
    margin: 0;
    font-size: 0.9rem;
    color: #555;
  }
  
  @media (max-width: 768px) {
    .turbine-options {
      grid-template-columns: 1fr;
    }
  }
</style> 
