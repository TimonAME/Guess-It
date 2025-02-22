<template>
  <div class="space-y-6">
    <!-- Mode Selection -->
    <div class="bg-white p-4 rounded-lg shadow-sm">
      <div class="flex items-center gap-4">
        <button
            @click="currentTrainingMode = 'hover'"
            :class="[
            'px-4 py-2 rounded-md transition-colors',
            currentTrainingMode === 'hover'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          Hover Mode
        </button>
        <button
            @click="currentTrainingMode = 'find'"
            :class="[
            'px-4 py-2 rounded-md transition-colors',
            currentTrainingMode === 'find'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          Find Country Mode
        </button>
      </div>
    </div>

    <!-- Hover Mode UI -->
    <div v-if="currentTrainingMode === 'hover'" class="bg-white p-4 rounded-lg shadow-sm">
      <div class="flex justify-between">
        <div>
          <div class="mb-4 text-lg font-medium text-gray-800">
            Hover over countries to see their names
          </div>
          <div v-if="hoveredCountry" class="text-xl font-semibold text-gray-900">
            {{ hoveredCountry }}
          </div>
        </div>
        <div v-if="clickedCountryInfo" class="text-right flex gap-2">
          <div>
            <div class="text-lg font-medium text-gray-800">Country Information</div>
            <div class="text-gray-700">{{ clickedCountryInfo.name }} - Name</div>
            <div class="text-gray-700">{{ clickedCountryInfo.continent }} - Continent</div>
            <div class="text-gray-700">{{ formatNumber(clickedCountryInfo.population) }} - Population</div>
          </div>
          <button
              @click="closeCountryInfo"
              class="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            X
          </button>
        </div>
      </div>
    </div>

    <!-- Find Mode UI -->
    <div v-if="currentTrainingMode === 'find'" class="bg-white p-4 rounded-lg shadow-sm">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-semibold text-gray-800">Find: {{ targetCountry?.name }}</h2>
          <div v-if="showHints" class="mt-2 text-gray-600">
            <div>Continent: {{ hints?.continent }}</div>
            <div>Population: {{ formatNumber(hints?.population) }}</div>
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <button
              @click="toggleHints"
              class="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            {{ showHints ? 'Hide Hints' : 'Show Hints' }}
          </button>
          <button
              @click="generateNewTarget"
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Skip
          </button>
          <button
              @click="showCountry"
              class="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            Show
          </button>
        </div>
      </div>
    </div>

    <!-- Game Map -->
    <game-map
        ref="gameMap"
        @country-click="handleCountryClick"
        @country-hover="handleCountryHover"
        :selected-language="selectedLanguage"
    />

    <!-- Game Modes Selection -->
    <game-modes
        v-if="currentTrainingMode === 'find'"
        v-model:gameMode="currentGameMode"
        @update:gameMode="handleGameModeChange"
    />
  </div>
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
    const response = await fetch('/ne_10m_admin_0_countries_lakes.json')
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