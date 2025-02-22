<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
      <h2 class="text-2xl font-semibold text-gray-800">Find: {{ targetCountry?.name }}</h2>
      <div class="flex items-center space-x-4">
        <div class="text-lg font-medium text-gray-700">Score: {{ score }}</div>
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
    <game-map
        ref="gameMap"
        @country-click="handleCountryClick"
        :selected-language="selectedLanguage"
    />
    <game-modes
        v-model:gameMode="currentGameMode"
        @update:gameMode="handleGameModeChange"
    />
  </div>
</template>

<script setup>
import {ref, computed, onMounted, watch} from 'vue'
import {useStore} from 'vuex'
import GameMap from './GameMap.vue'
import GameModes from './GameModes.vue'

const props = defineProps(['selectedLanguage'])

const store = useStore()
const score = computed(() => store.state.score)
const targetCountry = ref(null)
const countries = ref([])
const filteredCountries = ref([])
const currentGameMode = ref('all')
const gameMap = ref(null)

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

// Helper functions for filtering
const sortByPopulation = (countries) => {
  return [...countries].sort((a, b) => (b.properties.POP_EST || 0) - (a.properties.POP_EST || 0))
}

const sortByGDP = (countries) => {
  return [...countries].sort((a, b) => (b.properties.GDP_MD || 0) - (a.properties.GDP_MD || 0))
}

const filterByContinent = (countries, ...continents) => {
  return countries.filter(country =>
      continents.some(continent =>
          country.properties.CONTINENT === continent ||
          country.properties.SUBREGION?.includes(continent)
      )
  )
}

const filterCountries = () => {
  const filterStrategy = filterStrategies[currentGameMode.value] || filterStrategies.all
  filteredCountries.value = filterStrategy(countries.value)
  generateNewTarget()
}

const handleGameModeChange = () => {
  filterCountries()
}

const generateNewTarget = () => {
  if (filteredCountries.value.length > 0) {
    const randomIndex = Math.floor(Math.random() * filteredCountries.value.length)
    targetCountry.value = {
      name: filteredCountries.value[randomIndex].properties[props.selectedLanguage],
      id: filteredCountries.value[randomIndex].id
    }
  }
}

const handleCountryClick = (feature, callback) => {
  const isCorrect = feature.properties[props.selectedLanguage] === targetCountry.value.name
  if (isCorrect) {
    store.dispatch('handleCorrectAnswer')
    generateNewTarget()
  }
  callback?.(isCorrect)
}

const loadCountries = async () => {
  try {
    const response = await fetch('/ne_10m_admin_0_countries_lakes_no_antarktika.json')
    const data = await response.json()
    countries.value = data.features
    filterCountries()
  } catch (error) {
    console.error('Error loading countries:', error)
  }
}

const showCountry = () => {
  if (targetCountry.value && gameMap.value) {
    gameMap.value.highlightCountry(targetCountry.value, 3000, '#ff4444')

    // generateNewTarget after 1 second
    setTimeout(() => {
      generateNewTarget()
    }, 1000)
  }
}

onMounted(loadCountries)
watch(() => props.selectedLanguage, loadCountries)
</script>