<template>
  <div class="z-10">
    <div
        class="relative game-modes-container"
        @mouseenter="isExpanded = true"
        @mouseleave="isExpanded = false"
    >
      <!-- Current Mode Display -->
      <div class="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-sunset-100/20 cursor-pointer">
        <div class="text-sunset-gray font-medium">
          {{ gameModeOptions[selectedGameMode] }}
        </div>
      </div>

      <!-- Expandable Options -->
      <div
          v-show="isExpanded"
          class="absolute bottom-full left-0 w-64 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-sunset-100/20 max-h-[80vh] overflow-y-auto"
      >
        <div class="p-2 space-y-1">
          <div
              v-for="(label, value) in gameModeOptions"
              :key="value"
              @click="selectGameMode(value)"
              class="px-3 py-2 rounded-md cursor-pointer text-sunset-gray transition-colors"
              :class="selectedGameMode === value ? 'bg-sunset-100/20 text-sunset-400 font-medium' : 'hover:bg-sunset-100/10'"
          >
            {{ label }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue'

const emit = defineEmits(['update:gameMode'])
const selectedGameMode = ref('all')
const isExpanded = ref(false)

const gameModeOptions = {
  'all': 'All Countries',
  'europe_continent': 'Europe',
  'asia_continent': 'Asia',
  'africa_continent': 'Africa',
  'americas_continent': 'Americas',
  'oceania_continent': 'Oceania',
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
  emit('update:gameMode', value)
  isExpanded.value = false
}
</script>

<style scoped>
.game-modes-container {
  min-width: 200px;
}

/* Custom scrollbar styling */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(242, 146, 29, 0.3);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgba(242, 146, 29, 0.5);
}
</style>