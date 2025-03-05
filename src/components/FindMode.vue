<template>
  <div class="fixed sm:top-4 bottom-4 w-fit h-fit mx-auto left-0 right-0 flex flex-col gap-2 items-center z-10">
    <div class="sm:order-1 order-3 bg-white/90 backdrop-blur-sm text-sm rounded-lg px-4 py-3 shadow-lg border border-sunset-100/20">
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
        <!-- TODO: add better information (e.g. flag) -->
      </div>

      <div class="flex items-center justify-between">
        <ScoreCounter :value="gameStats.foundCountries" :total="gameStats.totalCountries" />
        <AccuracyCounter :value="calculateAccuracy()" />
      </div>
    </div>

    <div v-if="gameStats.foundCountries !== gameStats.totalCountries || gameStats.totalCountries === 0"
         class="sm:order-2 order-2 bg-white/90 backdrop-blur-sm rounded-lg px-6 py-3 shadow-lg border border-sunset-100/20 text-center">
      <h2 class="text-center justify-center text-2xl font-semibold text-sunset-gray">
        {{ targetCountry?.localizedName || 'Loading...' }}
      </h2>
    </div>

    <!-- Game Complete Message -->
    <RoundCompleteDisplay @click="handleRestart" v-if="gameStats.foundCountries === gameStats.totalCountries && gameStats.totalCountries !== 0" />
  </div>

  <!-- Game Mode Selector -->
  <div class="fixed top-4 left-4 h-fit z-10">
    <div
        class="relative"
        @mouseenter="isGameModesOpen = true"
        @mouseleave="isGameModesOpen = false"
        @click="isGameModesOpen = !isGameModesOpen"
    >
      <button
          class="h-full bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg flex items-center gap-2 hover:bg-white/95 transition-all duration-200 border border-sunset-100/20"
      >
        <span class="text-sunset-gray font-medium">{{ currentGameMode?.name || 'Select Mode' }}</span>
        <svg
            class="hidden sm:block h-4 w-4 text-sunset-200 transform transition-transform duration-200"
            :class="isGameModesOpen ? 'rotate-180' : ''"
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

      <div
          v-show="isGameModesOpen"
          class="absolute top-full left-0 w-64 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl max-h-96 overflow-y-auto border border-sunset-100/20"
      >
        <div class="py-2 space-y-1">
          <div v-for="(mode, key) in gameModes"
               :key="key"
               @click.stop="selectGameMode(key)"
               class="w-full text-left px-4 py-2 text-sunset-gray hover:bg-sunset-100/10 transition-colors"
               :class="currentGameMode?.name === mode.name ? 'bg-sunset-100/20 text-sunset-400 font-medium' : ''"
          >
            <div class="font-medium">{{ mode.name }}</div>
            <div class="text-sm opacity-80">{{ mode.description }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <game-map
      ref="gameMap"
      @country-click="handleCountryClick"
      :selected-language="selectedLanguage"
      :current-game-mode="currentGameMode"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import GameMap from './GameMap.vue'
import gameModeData from '@/assets/gameModes.json'
import ScoreCounter from "@/components/ScoreCounter.vue";
import AccuracyCounter from "@/components/AccuracyCounter.vue";
import RoundCompleteDisplay from "@/components/RoundCompleteDisplay.vue";

const props = defineProps(['selectedLanguage'])
const gameMap = ref(null)
const targetCountry = ref(null)
const showHints = ref(false)
const hints = ref(null)
const isGameModesOpen = ref(false)
const countries = ref([])
const gameModes = ref(gameModeData)
const currentGameMode = ref(null)

const gameStats = ref({
  totalCountries: 0,
  foundCountries: 0,
  attempts: 0,
  correctAttempts: 0,
  remainingCountries: [],
  foundList: []
})

const calculateAccuracy = () => {
  if (gameStats.value.attempts === 0) return 0;

  return Math.round((gameStats.value.correctAttempts / gameStats.value.attempts) * 100);
}

const handleCountryClick = (feature, callback) => {
  const isAlreadyFound = gameStats.value.foundList.some(
      country => country.properties.ADMIN === feature.properties.ADMIN
  )

  if (isAlreadyFound) return

  gameStats.value.attempts++
  // Compare using ADMIN (English name) for validation
  const isCorrect = feature.properties.ADMIN === targetCountry.value?.adminName

  if (isCorrect) {
    gameStats.value.correctAttempts++
    handleCorrectGuess(feature)
  }
  callback?.(isCorrect)
}

const handleCorrectGuess = (feature = null) => {
  const foundCountry = gameStats.value.remainingCountries.find(
      c => c.properties.ADMIN === targetCountry.value.adminName
  )

  gameStats.value.foundCountries++
  gameStats.value.remainingCountries = gameStats.value.remainingCountries.filter(
      c => c.properties.ADMIN !== targetCountry.value.adminName
  )
  gameStats.value.foundList.push(foundCountry)

  if (feature && gameMap.value) {
    gameMap.value.highlightCountry({
      name: targetCountry.value.localizedName
    }, 0, '#42b983')
  }

  setTimeout(() => {
    generateNewTarget()
  }, 100)
}

const selectGameMode = (modeKey) => {
  currentGameMode.value = gameModes.value[modeKey]
  isGameModesOpen.value = false
  handleRestart()
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
    localizedName: country.properties[props.selectedLanguage], // The display name in selected language
    adminName: country.properties.ADMIN,  // The official name used for validation
    id: country.properties.ISO_A3
  }

  hints.value = {
    continent: country.properties.CONTINENT,
    population: country.properties.POP_EST,
  }
}

const showCountry = () => {
  if (targetCountry.value && gameMap.value) {
    gameMap.value.highlightCountry({
      name: targetCountry.value.localizedName
    }, 0, '#ff4444', true)
    handleCorrectGuess()
  }
}

const handleRestart = () => {
  if (!currentGameMode.value || !countries.value.length) return

  const filteredCountries = countries.value.filter(country =>
      currentGameMode.value.countries.includes(country.properties.ADMIN)
  )

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
    countries.value = data.features

    // Select first game mode as default
    const firstModeKey = Object.keys(gameModes.value)[0]
    selectGameMode(firstModeKey)
  } catch (error) {
    console.error('Error loading countries:', error)
  }
}

onMounted(loadCountries)
watch(() => props.selectedLanguage, handleRestart)
</script>