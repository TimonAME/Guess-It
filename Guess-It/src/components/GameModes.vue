<template>
  <div class="w-full mb-6 bg-white rounded-lg shadow-sm">
    <div class="p-4 border-b">
      <h3 class="text-lg font-semibold text-gray-800">Game Settings</h3>
    </div>
    <div class="p-4">
      <!-- Display Selected Game Mode -->
      <div class="mb-4 text-lg font-medium text-gray-800">
        Playing: {{ gameModeOptions[selectedGameMode] }}
      </div>

      <!-- Game Mode Selection Grid -->
      <div class="grid grid-flow-col grid-rows-10 gap-2">
        <div
            v-for="(label, value) in gameModeOptions"
            :key="value"
            @click="selectGameMode(value)"
            class="px-4 py-1 rounded-md cursor-pointer hover:bg-gray-100 transition-colors "
        >
          {{ label }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['update:gameMode', 'update:difficulty'])

const selectedGameMode = ref('all')

const gameModeOptions = {
  'all': 'All Countries',
  'europe_continent': 'Continent Europe',
  'asia_continent': 'Continent Asia',
  'africa_continent': 'Continent Africa',
  'americas_continent': 'Continent Americas',
  'oceania_continent': 'Continent Oceania',
  'top200_population': 'Top 200 by Population',
  'top100_population': 'Top 100 by Population',
  'top50_population': 'Top 50 by Population',
  'top20_population': 'Top 20 by Population',
  'top200_gdp': 'Top 200 by GDP',
  'top100_gdp': 'Top 100 by GDP',
  'top50_gdp': 'Top 50 by GDP',
  'top20_gdp': 'Top 20 by GDP',
}

const selectGameMode = (value) => {
  selectedGameMode.value = value
  emit('update:gameMode', selectedGameMode.value)
}
</script>