<template>
  <div class="fixed sm:top-4 bottom-4 w-fit h-fit mx-auto left-0 right-0 flex flex-col gap-2 items-center z-10">
    <!-- Control Panel -->
    <div class="sm:order-1 order-3 bg-white/90 backdrop-blur-sm text-sm rounded-lg px-4 py-3 shadow-lg border border-sunset-100/20">
      <div class="flex items-center gap-4 justify-between mb-3">
        <input
            type="text"
            v-model="countryInput"
            @keyup.enter="checkCountry"
            placeholder="Type a country name..."
            class="px-4 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            :disabled="gameStats.foundCountries === gameStats.totalCountries"
        />
        <button @click="handleRestart"
                class="px-4 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors">
          Restart
        </button>
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

    <!-- Game Complete Message -->
    <div v-if="gameStats.foundCountries === gameStats.totalCountries && gameStats.totalCountries !== 0"
         class="sm:order-3 order-1 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-lg flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>
      <span>Round Complete! Click Restart to play again.</span>
    </div>
  </div>

  <!-- Game Modes -->
  <div class="fixed top-4 left-4 h-fit z-10">
    <game-modes
        v-model:gameMode="currentGameMode"
        @update:gameMode="handleGameModeChange"
    />
  </div>

  <!-- Map -->
  <game-map
      ref="gameMap"
      :selected-language="selectedLanguage"
  />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import GameMap from './GameMap.vue'
import GameModes from './GameModes.vue'

const props = defineProps(['selectedLanguage'])
const gameMap = ref(null)
const countryInput = ref('')
const currentGameMode = ref('all')
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

const checkCountry = () => {
  if (!countryInput.value.trim()) return

  gameStats.value.attempts++
  const normalizedInput = countryInput.value.trim().toLowerCase()

  const foundCountry = gameStats.value.remainingCountries.find(
      country => country.properties[props.selectedLanguage].toLowerCase() === normalizedInput
  )

  if (foundCountry) {
    gameStats.value.correctAttempts++
    gameStats.value.foundCountries++
    gameStats.value.remainingCountries = gameStats.value.remainingCountries.filter(
        c => c.properties[props.selectedLanguage].toLowerCase() !== normalizedInput
    )
    gameStats.value.foundList.push(foundCountry)

    // Highlight and zoom to the found country
    if (gameMap.value) {
      const countryData = {
        name: foundCountry.properties[props.selectedLanguage],
        id: foundCountry.id
      }
      gameMap.value.highlightCountry(countryData, 0, '#42b983')
    }
  }

  countryInput.value = ''
}

const handleRestart = () => {
  const filterStrategy = filterStrategies[currentGameMode.value] || filterStrategies.all
  const filteredCountries = filterStrategy(countries.value)

  gameStats.value = {
    totalCountries: filteredCountries.length,
    foundCountries: 0,
    attempts: 0,
    correctAttempts: 0,
    remainingCountries: filteredCountries,
    foundList: []
  }

  if (gameMap.value) {
    gameMap.value.resetMapColors()
  }

  countryInput.value = ''
}

const loadCountries = async () => {
  try {
    const response = await fetch('/Guess-It/ne_10m_admin_0_countries_lakes_no_antarktika.json')
    const data = await response.json()
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
  handleRestart()
}

const filterStrategies = {
  top200_population: (countries) => sortByPopulation(countries).slice(0, 200),
  top100_population: (countries) => sortByPopulation(countries).slice(0, 100),
  top50_population: (countries) => sortByPopulation(countries).slice(0, 50),
  top20_population: (countries) => sortByPopulation(countries).slice(0, 20),
  top200_gdp: (countries) => sortByGDP(countries).slice(0, 200),
  top100_gdp: (countries) => sortByGDP(countries).slice(0, 100),
  top50_gdp: (countries) => sortByGDP(countries).slice(0, 50),
  top20_gdp: (countries) => sortByGDP(countries).slice(0, 20),
  europe_continent: (countries) => filterByContinent(countries, 'Europe'),
  asia_continent: (countries) => filterByContinent(countries, 'Asia'),
  africa_continent: (countries) => filterByContinent(countries, 'Africa'),
  americas_continent: (countries) => filterByContinent(countries, 'North America', 'South America'),
  oceania_continent: (countries) => filterByContinent(countries, 'Oceania'),
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
watch(() => props.selectedLanguage, handleGameModeChange)
</script>