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
                class="px-4 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors">
          Restart
        </button>
      </div>

      <div class="flex items-center justify-between">
        <ScoreCounter :value="gameStats.foundCountries" :total="gameStats.totalCountries" />
        <AccuracyCounter :value="calculateAccuracy()" />
      </div>
    </div>

    <!-- Game Complete Message -->
    <RoundCompleteDisplay class="sm:order-3 order-1" @click="handleRestart" v-if="gameStats.foundCountries === gameStats.totalCountries && gameStats.totalCountries !== 0" />
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

  <!-- Map -->
  <game-map
      ref="gameMap"
      :selected-language="selectedLanguage"
      :current-game-mode="currentGameMode"
      @country-click="handleCountryClick"
  />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import GameMap from './GameMap.vue'
import gameModeData from '@/assets/gameModes.json'
import ScoreCounter from "@/components/ScoreCounter.vue";
import AccuracyCounter from "@/components/AccuracyCounter.vue";
import RoundCompleteDisplay from "@/components/RoundCompleteDisplay.vue";
import { useMapStore } from '@/stores/mapStore'

const mapStore = useMapStore()
const props = defineProps(['selectedLanguage'])
const gameMap = ref(null)
const countryInput = ref('')
const isGameModesOpen = ref(false)
const gameModes = ref(gameModeData)
const currentGameMode = ref(null)
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
  if (gameStats.value.attempts === 0) return 0;

  return Math.round((gameStats.value.correctAttempts / gameStats.value.attempts) * 100);
}

const checkCountry = () => {
  if (!countryInput.value.trim()) return

  gameStats.value.attempts++

  const normalizedInput = countryInput.value.trim().toLowerCase()

  const foundCountry = gameStats.value.remainingCountries.find(country => {
    return Object.entries(country.properties)
        .filter(([key]) => key.startsWith('NAME_'))
        .some(([_, value]) => String(value).toLowerCase() === normalizedInput);
  });

  if (foundCountry) {
    gameStats.value.correctAttempts++
    gameStats.value.foundCountries++
    gameStats.value.remainingCountries = gameStats.value.remainingCountries.filter(
        c => c.properties[props.selectedLanguage].toLowerCase() !== normalizedInput
    )
    gameStats.value.foundList.push(foundCountry)

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

const selectGameMode = (modeKey) => {
  currentGameMode.value = gameModes.value[modeKey]
  isGameModesOpen.value = false
  handleRestart()
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

  countryInput.value = ''
}

const loadCountries = () => {
  if (mapStore.countriesData.features.length) {
    countries.value = mapStore.countriesData.features

    // Select first game mode as default
    const firstModeKey = Object.keys(gameModes.value)[0]
    selectGameMode(firstModeKey)
  }
}

watch(() => mapStore.countriesData.features.length, (newLength) => {
  if (newLength > 0) loadCountries()
})

onMounted(() => {
  if (mapStore.countriesData.features.length) loadCountries()
})

watch(() => props.selectedLanguage, handleRestart)

const handleCountryClick = ({ feature }) => {
  if (gameStats.value.foundList.includes(feature.properties.ADMIN)) return

  gameStats.value.attempts++
  const isCorrect = feature.properties.ADMIN === targetCountry.value?.adminName

  if (isCorrect) {
    gameStats.value.correctAttempts++
    gameMap.value.highlightCountry({
      name: targetCountry.value.localizedName
    }, 0, '#42b983')
    handleCorrectGuess()
  } else {
    gameMap.value.highlightCountry({
      name: feature.properties[props.selectedLanguage]
    }, 1000, '#ff4444')
  }
}

const handleCorrectGuess = () => {
  gameStats.value.foundCountries++
  gameStats.value.remainingCountries = gameStats.value.remainingCountries.filter(
      adminName => adminName !== targetCountry.value.adminName
  )
  gameStats.value.foundList.push(targetCountry.value.adminName)

  setTimeout(() => {
    generateNewTarget()
  }, 100)
}

const generateNewTarget = () => {
  if (gameStats.value.remainingCountries.length === 0) {
    targetCountry.value = null
    return
  }

  const randomIndex = Math.floor(Math.random() * gameStats.value.remainingCountries.length)
  const adminName = gameStats.value.remainingCountries[randomIndex]
  const country = countries.value.find(c => c.properties.ADMIN === adminName)

  const capital = countryCapitals.value.find(c => c.country === adminName)?.city || 'Unknown'
  const flag = `https://flagsapi.com/${country.properties.ISO_A2}/flat/64.png`

  targetCountry.value = {
    localizedName: country.properties[props.selectedLanguage],
    adminName: adminName,
    id: country.properties.ISO_A3
  }

  hints.value = {
    continent: country.properties.CONTINENT,
    population: country.properties.POP_EST,
    flag: flag,
    capital: capital
  }
}
</script>