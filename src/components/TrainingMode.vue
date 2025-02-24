<template>
  <div class="fixed top-4 left-0 right-0 mx-auto w-fit flex justify-center items-center z-10">
    <div class="sm:order-2 order-2 bg-white/90 backdrop-blur-sm rounded-lg px-6 py-3 shadow-lg border border-sunset-100/20 text-center">
      <h2 class="text-center justify-center text-2xl font-semibold text-sunset-gray">
        {{ hoveredCountry || 'Hover / Click a country' }}
      </h2>
    </div>
  </div>



  <game-map
      ref="gameMap"
      @country-click="handleCountryClick"
      @country-hover="handleCountryHover"
      :selected-language="selectedLanguage"
  />

  <!-- Clicked Country Info -->
  <div v-if="clickedCountryInfo"
       class="fixed bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-sunset-100/20 z-10">
    <div class="flex items-start gap-4">
      <div>
        <div class="text-lg font-medium text-sunset-gray mb-2">Country Information</div>
        <div class="text-sunset-gray">{{ clickedCountryInfo.name }}</div>
        <div class="text-sunset-gray">{{ clickedCountryInfo.continent }}</div>
        <div class="text-sunset-gray">Population: {{ formatNumber(clickedCountryInfo.population) }}</div>
      </div>
      <button @click="closeCountryInfo"
              class="text-sunset-gray hover:text-sunset-400">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import GameMap from './GameMap.vue'

const props = defineProps(['selectedLanguage'])
const hoveredCountry = ref(null)
const clickedCountryInfo = ref(null)

const handleCountryHover = (feature) => {
  hoveredCountry.value = feature.properties[props.selectedLanguage]
}

const handleCountryClick = (feature) => {
  clickedCountryInfo.value = {
    name: feature.properties[props.selectedLanguage],
    continent: feature.properties.CONTINENT,
    population: feature.properties.POP_EST,
  }
}

const closeCountryInfo = () => {
  clickedCountryInfo.value = null
}

const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num)
}
</script>