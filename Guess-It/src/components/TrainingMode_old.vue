<template>
  <!-- Top Bar -->
  <div class="fixed top-4 left-0 right-0 flex justify-center items-center gap-4 z-10">
    <!-- Country Display -->
    <div class="bg-white/90 backdrop-blur-sm rounded-lg px-6 py-3 shadow-lg border border-sunset-100/20 text-center">
      <h2 class="text-center justify-center text-2xl font-semibold text-sunset-gray">
        {{ hoveredCountry || targetCountry?.name || 'Hover over a country' }}
      </h2>
    </div>

    <!-- Mode Selection -->

    <div class="relative" @mouseenter="isModeOpen = true" @mouseleave="isModeOpen = false">
      <button class="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg flex items-center gap-2 hover:bg-white/95 transition-all duration-200 border border-sunset-100/20">
        <span class="text-sunset-gray font-medium">
          {{ currentTrainingMode === 'hover' ? 'Hover Mode' : 'Find Mode' }}
        </span>
        <svg
            class="h-4 w-4 text-sunset-200 transform transition-transform duration-200"
            :class="isModeOpen ? 'rotate-180' : ''"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
          <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>


      <!-- Mode Dropdown -->
      <div v-show="isModeOpen"
           class="absolute right-0 w-48 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl py-1 border border-sunset-100/20">
        <button @click="setTrainingMode('hover')"
                class="w-full text-left px-4 py-2 text-sunset-gray hover:bg-sunset-100/10 transition-colors"
                :class="currentTrainingMode === 'hover' ? 'bg-sunset-100/20 text-sunset-400 font-medium' : ''">
          Hover Mode
        </button>
        <button @click="setTrainingMode('find')"
                class="w-full text-left px-4 py-2 text-sunset-gray hover:bg-sunset-100/10 transition-colors"
                :class="currentTrainingMode === 'find' ? 'bg-sunset-100/20 text-sunset-400 font-medium' : ''">
          Find Mode
        </button>
      </div>
    </div>


    <!-- Find Mode Controls -->
    <div v-if="currentTrainingMode === 'find'"
         class="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
      <div class="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-sunset-100/20 flex items-center gap-4">
        <button @click="toggleHints"
                class="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors">
          {{ showHints ? 'Hide Hints' : 'Show Hints' }}
        </button>
        <div v-if="showHints" class="text-sunset-gray">
          <span class="mr-4">Continent: {{ hints?.continent }}</span>
          <span>Population: {{ formatNumber(hints?.population) }}</span>
        </div>
        <button @click="generateNewTarget"
                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
          Skip
        </button>
        <button @click="showCountry"
                class="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors">
          Show
        </button>
      </div>
    </div>

    <!-- Clicked Country Info -->
    <div v-if="clickedCountryInfo"
         class="fixed top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-sunset-100/20">
      <div class="flex items-start gap-4">
        <div>
          <div class="text-lg font-medium text-sunset-gray mb-2">Country Information</div>
          <div class="text-sunset-gray">{{ clickedCountryInfo.name }}</div>
          <div class="text-sunset-gray">{{ clickedCountryInfo.continent }}</div>
          <div class="text-sunset-gray">{{ formatNumber(clickedCountryInfo.population) }}</div>
        </div>
        <button @click="closeCountryInfo"
                class="text-sunset-gray hover:text-sunset-400">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  </div>

  <game-map
      ref="gameMap"
      @country-click="handleCountryClick"
      @country-hover="handleCountryHover"
      :selected-language="selectedLanguage"
  />

  <game-modes
      v-if="currentTrainingMode === 'find'"
      v-model:gameMode="currentGameMode"
      @update:gameMode="handleGameModeChange"
  />

</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import GameMap from './GameMap.vue'
import GameModes from './GameModes.vue'

const props = defineProps(['selectedLanguage'])

const currentTrainingMode = ref('hover')
const hoveredCountry = ref(null)
const targetCountry = ref(null)
const currentGameMode = ref('all')
const showHints = ref(false)
const hints = ref(null)
const gameMap = ref(null)
const countries = ref([])
const filteredCountries = ref([])
const clickedCountryInfo = ref(null)
const isModeOpen = ref(false)

const setTrainingMode = (mode) => {
  currentTrainingMode.value = mode
  isModeOpen.value = false
  if (mode === 'find') {
    generateNewTarget()
  }
}

const handleCountryHover = (feature) => {
  if (currentTrainingMode.value === 'hover') {
    hoveredCountry.value = feature.properties[props.selectedLanguage]
  }
}

const handleCountryClick = (feature, callback) => {
  if (currentTrainingMode.value === 'hover') {
    clickedCountryInfo.value = {
      name: feature.properties[props.selectedLanguage],
      continent: feature.properties.CONTINENT,
      population: feature.properties.POP_EST,
    }
  } else if (currentTrainingMode.value === 'find') {
    const isCorrect = feature.properties[props.selectedLanguage] === targetCountry.value?.name
    if (isCorrect) {
      generateNewTarget()
    }
    callback?.(isCorrect)
  }
}

const generateNewTarget = () => {
  if (filteredCountries.value.length > 0) {
    const randomIndex = Math.floor(Math.random() * filteredCountries.value.length)
    const country = filteredCountries.value[randomIndex]
    targetCountry.value = {
      name: country.properties[props.selectedLanguage],
      id: country.id
    }
    hints.value = {
      continent: country.properties.CONTINENT,
      population: country.properties.POP_EST,
    }
  }
}

const toggleHints = () => {
  showHints.value = !showHints.value
}

const showCountry = () => {
  if (targetCountry.value && gameMap.value) {
    gameMap.value.highlightCountry(targetCountry.value, 3000, '#ff4444')
    setTimeout(() => {
      generateNewTarget()
    }, 1000)
  }
}

const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num)
}

const loadCountries = async () => {
  try {
    const response = await fetch('/ne_10m_admin_0_countries_lakes_no_antarktika.json')
    const data = await response.json()
    countries.value = data.features
    filteredCountries.value = countries.value
    if (currentTrainingMode.value === 'find') {
      generateNewTarget()
    }
  } catch (error) {
    console.error('Error loading countries:', error)
  }
}

const handleGameModeChange = () => {
  // Apply filtering based on game mode
  const filterStrategy = filterStrategies[currentGameMode.value] || filterStrategies.all
  filteredCountries.value = filterStrategy(countries.value)
  if (currentTrainingMode.value === 'find') {
    generateNewTarget()
  }
}

const filterStrategies = {
  // Population-based filters
  top200_population: (countries) => sortByPopulation(countries).slice(0, 200),
  top100_population: (countries) => sortByPopulation(countries).slice(0, 100),
  top50_population: (countries) => sortByPopulation(countries).slice(0, 50),
  top20_population: (countries) => sortByPopulation(countries).slice(0, 20),

  // GDP-based filters
  top200_gdp: (countries) => sortByGDP(countries).slice(0, 200),
  top100_gdp: (countries) => sortByGDP(countries).slice(0, 100),
  top50_gdp: (countries) => sortByGDP(countries).slice(0, 50),
  top20_gdp: (countries) => sortByGDP(countries).slice(0, 20),

  // Continent-based filters
  europe_continent: (countries) => filterByContinent(countries, 'Europe'),
  asia_continent: (countries) => filterByContinent(countries, 'Asia'),
  africa_continent: (countries) => filterByContinent(countries, 'Africa'),
  americas_continent: (countries) => filterByContinent(countries, 'North America', 'South America'),
  oceania_continent: (countries) => filterByContinent(countries, 'Oceania'),

  // Default - all countries
  all: (countries) => countries
}

const sortByPopulation = (countries) => {
  return countries.slice().sort((a, b) => b.properties.POP_EST - a.properties.POP_EST)
}

const sortByGDP = (countries) => {
  return countries.slice().sort((a, b) => b.properties.GDP_MD_EST - a.properties.GDP_MD_EST)
}

const filterByContinent = (countries, ...continents) => {
  return countries.filter(country => continents.includes(country.properties.CONTINENT))
}

const closeCountryInfo = () => {
  clickedCountryInfo.value = null
}

onMounted(loadCountries)
watch(() => props.selectedLanguage, loadCountries)
watch(currentTrainingMode, (newMode) => {
  if (newMode === 'find') {
    generateNewTarget()
  }
})
</script>