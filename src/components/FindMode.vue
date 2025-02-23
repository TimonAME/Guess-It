<template>
  <div class="fixed top-4 w-fit mx-auto left-0 right-0 flex flex-col gap-2 items-center z-10">
    <div class="bg-white/90 backdrop-blur-sm text-sm rounded-lg px-4 py-3 shadow-lg border border-sunset-100/20">
      <div class="flex items-center gap-4 justify-between mb-3">
        <button @click="toggleHints"
                class="px-4 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors">
          {{ showHints ? 'Hide Hints' : 'Hints' }}
        </button>
        <button @click="handleSkip"
                class="px-4 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
          Skip
        </button>
        <button @click="showCountry"
                class="px-4 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors">
          Show
        </button>
        <button @click="handleRestart"
                class="px-4 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors">
          Restart
        </button>
      </div>

      <div v-if="showHints" class="flex items-center gap-4 justify-between text-sunset-gray mb-3">
        <span class="mr-4">Continent: <strong>{{ hints?.continent }}</strong></span>
        <span>Population: <strong>{{ formatNumber(hints?.population) }}</strong></span>
      </div>

      <div class="flex items-center justify-between">
        <div class="text-sunset-gray">
          <span>
            ({{ gameStats.foundCountries }}/{{ gameStats.totalCountries }} found)
          </span>
        </div>
        <div class="text-sunset-gray">
          Accuracy: {{ calculateAccuracy() }}%
        </div>
      </div>
    </div>

    <div v-if="gameStats.foundCountries !== gameStats.totalCountries || gameStats.totalCountries === 0" class="bg-white/90 backdrop-blur-sm rounded-lg px-6 py-3 shadow-lg border border-sunset-100/20 text-center">
      <h2 class="text-center justify-center text-2xl font-semibold text-sunset-gray max-w-[40vw]">
        {{ targetCountry?.name || 'Loading...' }}
      </h2>
    </div>

    <div v-if="gameStats.foundCountries === gameStats.totalCountries && gameStats.totalCountries !== 0"
         class="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-lg flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>
      <span>Round Complete! Click Restart to play again.</span>
    </div>
  </div>

  <div class="fixed top-4 left-4 z-10">
    <game-modes
        v-model:gameMode="currentGameMode"
        @update:gameMode="handleGameModeChange"
    />
  </div>

  <game-map
      ref="gameMap"
      @country-click="handleCountryClick"
      :selected-language="selectedLanguage"
  />
</template>

<script setup>
import {ref, computed, onMounted, watch} from 'vue'
import GameMap from './GameMap.vue'
import GameModes from './GameModes.vue'

const props = defineProps(['selectedLanguage'])
const gameMap = ref(null)
const targetCountry = ref(null)
const currentGameMode = ref('all')
const showHints = ref(false)
const hints = ref(null)
const countries = ref([])

const gameStats = ref({
  totalCountries: 0,
  foundCountries: 0,
  attempts: 0,
  correctAttempts: 0,
  remainingCountries: [],
  foundList: []
})

const calculateAccuracy = () => {
  return gameStats.value.attempts === 0 ? 100 :
      Math.round((gameStats.value.correctAttempts / gameStats.value.attempts) * 100)
}

const handleCountryClick = (feature, callback) => {
  const isAlreadyFound = gameStats.value.foundList.some(
      country => country.properties[props.selectedLanguage] === feature.properties[props.selectedLanguage]
  )
  if (isAlreadyFound) return

  gameStats.value.attempts++
  const isCorrect = feature.properties[props.selectedLanguage] === targetCountry.value?.name
  if (isCorrect) {
    gameStats.value.correctAttempts++
    handleCorrectGuess(feature)
  }
  callback?.(isCorrect)
}

const handleCorrectGuess = (feature = null) => {
  const foundCountry = gameStats.value.remainingCountries.find(
      c => c.properties[props.selectedLanguage] === targetCountry.value.name
  )

  gameStats.value.foundCountries++
  gameStats.value.remainingCountries = gameStats.value.remainingCountries.filter(
      c => c.properties[props.selectedLanguage] !== targetCountry.value.name
  )
  gameStats.value.foundList.push(foundCountry)

  // Keep the country highlighted
  if (feature && gameMap.value) {
    gameMap.value.highlightCountry(targetCountry.value, 0, '#42b983')
  }

  // Wait a bit before showing next country
  setTimeout(() => {
    generateNewTarget()
  }, 100)
}

const handleSkip = () => {
  if (!targetCountry.value) return
  gameStats.value.attempts++
  generateNewTarget()
}

const generateNewTarget = () => {
  if (gameStats.value.remainingCountries.length === 0) {
    targetCountry.value = null
    return
  }

  const randomIndex = Math.floor(Math.random() * gameStats.value.remainingCountries.length)
  const country = gameStats.value.remainingCountries[randomIndex]
  targetCountry.value = {
    name: country.properties[props.selectedLanguage],
    id: country.id
  }
  hints.value = {
    continent: country.properties.CONTINENT,
    population: country.properties.POP_EST,
  }
}

const showCountry = () => {
  if (targetCountry.value && gameMap.value) {
    gameMap.value.highlightCountry(targetCountry.value, 0, '#ff4444', true)
    handleCorrectGuess()
  }
}

const handleRestart = () => {
  // Reset game stats
  gameStats.value = {
    ...gameStats.value,
    foundCountries: 0,
    attempts: 0,
    correctAttempts: 0,
    remainingCountries: [...gameStats.value.foundList, ...gameStats.value.remainingCountries],
    foundList: []
  }

  // Reset map colors
  if (gameMap.value) {
    gameMap.value.resetMapColors()
  }

  generateNewTarget()
}

const toggleHints = () => {
  showHints.value = !showHints.value
}

const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num)
}

const loadCountries = async () => {
  try {
    const response = await fetch('/Guess-It/ne_10m_admin_0_countries_lakes_no_antarktika.json')
    const data = await response.json()
    // Filter out Vatican City
    countries.value = data.features.filter(country =>
        country.properties.ADMIN !== 'Vatican' &&
        country.properties.NAME !== 'Vatican City'
    )
    handleGameModeChange()
  } catch (error) {
    console.error('Error loading countries:', error)
  }
}

const handleGameModeChange = () => {
  const filterStrategy = filterStrategies[currentGameMode.value] || filterStrategies.all
  const filteredCountries = filterStrategy(countries.value)

  gameStats.value = {
    totalCountries: filteredCountries.length,
    foundCountries: 0,
    skippedAttempts: 0,
    remainingCountries: filteredCountries,
    foundList: []
  }

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