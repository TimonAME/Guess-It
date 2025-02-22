<template>
  <div class="fixed top-4 left-0 right-0 flex justify-center items-center z-10">
    <div class="bg-white/90 backdrop-blur-sm rounded-lg px-6 py-3 shadow-lg border border-sunset-100/20 text-center">
      <h2 class="text-center justify-center text-2xl font-semibold text-sunset-gray">
        {{ targetCountry?.name || 'Loading...' }}
      </h2>
    </div>
  </div>

  <game-map
      ref="gameMap"
      @country-click="handleCountryClick"
      :selected-language="selectedLanguage"
  />

  <div class="fixed bottom-4 left-0 right-0 flex justify-center items-center gap-4 z-10">
    <div class="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-2 shadow-lg border border-sunset-100/20 flex items-center gap-4">
      <button @click="toggleHints"
              class="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors">
        {{ showHints ? 'Hide Hints' : 'Hints' }}
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

  <game-modes
      v-model:gameMode="currentGameMode"
      @update:gameMode="handleGameModeChange"
  />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import GameMap from './GameMap.vue'
import GameModes from './GameModes.vue'

const props = defineProps(['selectedLanguage'])
const gameMap = ref(null)
const targetCountry = ref(null)
const currentGameMode = ref('all')
const showHints = ref(false)
const hints = ref(null)
const countries = ref([])
const filteredCountries = ref([])


const handleCountryClick = (feature, callback) => {
  const isCorrect = feature.properties[props.selectedLanguage] === targetCountry.value?.name
  if (isCorrect) {
    generateNewTarget()
  }
  callback?.(isCorrect)
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
    generateNewTarget()

  } catch (error) {
    console.error('Error loading countries:', error)
  }
}

const handleGameModeChange = () => {
  // Apply filtering based on game mode
  const filterStrategy = filterStrategies[currentGameMode.value] || filterStrategies.all
  filteredCountries.value = filterStrategy(countries.value)
  generateNewTarget()
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


onMounted(loadCountries)
watch(() => props.selectedLanguage, loadCountries)
</script>