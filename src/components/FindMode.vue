<template>
  <div class="fixed sm:top-4 bottom-4 w-fit h-fit mx-auto left-0 right-0 flex flex-col gap-2 items-center z-10">
    <div class="sm:order-1 order-4 bg-white/90 backdrop-blur-sm text-sm rounded-lg px-4 py-3 shadow-lg border border-sunset-100/20">
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
                class="px-4 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors">
          Show
        </button>
        <button @click="resetGame"
                class="px-4 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors">
          Restart
        </button>
      </div>

      <div class="flex items-center justify-between">
        <ScoreCounter :value="gameStats.foundCountries" :total="gameStats.totalCountries" />
        <AccuracyCounter :value="calculateAccuracy()" />
      </div>
    </div>

    <HintsDisplay v-if="showHints" :hints="hints" class="sm:order-2 order-3" />

    <div v-if="gameStats.foundCountries !== gameStats.totalCountries || gameStats.totalCountries === 0"
         class="sm:order-3 order-2 bg-white/90 backdrop-blur-sm rounded-lg px-6 py-3 shadow-lg border border-sunset-100/20 text-center">
      <h2 class="text-center justify-center text-2xl font-semibold text-sunset-gray select-text">
        {{ targetCountry?.localizedName || 'Loading...' }}
      </h2>
    </div>

    <!-- Game Complete Message -->
    <RoundCompleteDisplay class="sm:order-4 order-1" @click="resetGame" v-if="gameStats.foundCountries === gameStats.totalCountries && gameStats.totalCountries !== 0" />
  </div>

  <!-- Game Zone Selector -->
  <GameZoneSelector
      :zones="gameZones"
      :current-zone="currentGameZone"
      @select="selectGameZone"
  />

  <game-map
      ref="gameMap"
      @country-click="handleCountryClick"
      :selected-language="selectedLanguage"
      :current-game-zone="currentGameZone"
  />
</template>

<script setup>
import {nextTick, onMounted, ref, watch} from 'vue'
import GameMap from './GameMap.vue'
import gameZoneData from '@/assets/gameZones.json'
import countryCapitalData from '@/assets/country-by-capital-city.json'
import ScoreCounter from "@/components/ScoreCounter.vue";
import AccuracyCounter from "@/components/AccuracyCounter.vue";
import RoundCompleteDisplay from "@/components/RoundCompleteDisplay.vue";
import HintsDisplay from "@/components/HintsDisplay.vue";
import {useMapStore} from '@/stores/mapStore'
import GameZoneSelector from "@/components/GameZoneSelector.vue";
import {useZoneProgressStore} from '@/stores/zoneProgressStore'

const mapStore = useMapStore()
const props = defineProps(['selectedLanguage'])
const gameMap = ref(null)
const targetCountry = ref(null)
const showHints = ref(false)
const hints = ref(null)
const countries = ref([])
const gameZones = ref(gameZoneData)
const currentGameZone = ref(null)
const currentGameZoneKey = ref(null)
const countryCapitals = ref(countryCapitalData)
const zoneProgressStore = useZoneProgressStore()
const gameMode = 'find';

const gameStats = ref({
  totalCountries: 0,       // Total countries in current mode
  foundCountries: 0,       // Number of found countries
  attempts: 0,             // Total attempts
  correctAttempts: 0,      // Correct attempts
  foundList: [],           // Array of found ADMIN names
  shownCountries: [],      // Array of countries that were shown (skipped)
})

// Calculate accuracy based on correct attempts and total attempts for the Accuracy Display
const calculateAccuracy = () => {
  if (gameStats.value.attempts === 0) return 0;

  return Math.round((gameStats.value.correctAttempts / gameStats.value.attempts) * 100);
}

// Country click handler from GameMap
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

// Correct guess handler
const handleCorrectGuess = () => {
  gameStats.value.foundCountries++
  gameStats.value.foundList.push(targetCountry.value.adminName)

  setTimeout(() => {
    generateNewTarget()
  }, 100)
}

const selectGameZone = (modeKey) => {
  currentGameZone.value = gameZones.value[modeKey]
  currentGameZoneKey.value = modeKey

  // Zuerst Map zurücksetzen
  if (gameMap.value) {
    gameMap.value.resetMapColors()
  }

  // Prüfe auf gespeicherten Fortschritt
  const savedProgress = zoneProgressStore.loadProgress(gameMode)
  if (savedProgress.lastZone !== null && savedProgress.lastZone === modeKey) {
    gameStats.value = savedProgress.gameStats

    // generate new target
    generateNewTarget()

    // Verzögere die Neueinfärbung
    nextTick(() => {
      recolorCountries()
    })
  } else {
    resetGame()
  }

  nextTick(() => {
    if (gameMap.value) {
      gameMap.value.zoomToCountries(currentGameZone.value.countries)
    }
  })
}

const handleSkip = () => {
  if (!targetCountry.value) return
  gameStats.value.attempts++
  generateNewTarget()
}

const generateNewTarget = () => {
  if (gameStats.value.foundCountries === gameStats.value.totalCountries) {
    targetCountry.value = null
    return
  }

  const remainingCountries = countries.value.filter(
      country => !gameStats.value.foundList.includes(country.properties.ADMIN) &&
          currentGameZone.value.countries.includes(country.properties.ADMIN)
  )

  const randomIndex = Math.floor(Math.random() * remainingCountries.length)
  const country = remainingCountries[randomIndex]

  const capital = countryCapitals.value.find(c => c.country === country.properties.ADMIN)?.city || 'Unknown'
  const flag = `https://flagsapi.com/${country.properties.ISO_A2}/flat/64.png`

  targetCountry.value = {
    localizedName: country.properties[props.selectedLanguage],
    adminName: country.properties.ADMIN,
    id: country.properties.ISO_A3
  }

  hints.value = {
    continent: country.properties.CONTINENT,
    population: country.properties.POP_EST,
    flag: flag,
    capital: capital
  }

  // save progress to store if an attempt is made
  if (gameStats.value.attempts > 0) {
    zoneProgressStore.saveProgress(gameMode, currentGameZoneKey.value, gameStats.value)
  }
}

const showCountry = () => {
  if (targetCountry.value && gameMap.value) {
    // Add the country to shownCountries array
    if (!gameStats.value.shownCountries) {
      gameStats.value.shownCountries = []
    }
    gameStats.value.shownCountries.push(targetCountry.value.adminName)

    gameMap.value.highlightCountry({
      name: targetCountry.value.localizedName
    }, 0, '#ff4444', true)
    handleCorrectGuess()
  }
}

const resetGame = () => {
  if (!currentGameZone.value || !countries.value.length) return

  const filteredCountries = countries.value
      .filter(country => currentGameZone.value.countries.includes(country.properties.ADMIN))
      .map(country => country.properties.ADMIN)

  gameStats.value = {
    totalCountries: filteredCountries.length,
    foundCountries: 0,
    attempts: 0,
    correctAttempts: 0,
    foundList: [],
    shownCountries: []
  }

  if (gameMap.value) {
    gameMap.value.resetMapColors()
  }

  generateNewTarget()
}

const toggleHints = () => {
  showHints.value = !showHints.value
}

const recolorCountries = () => {
  nextTick(() => {
    console.log("Find: Recoloring Countries from savegame")
    // TODO: on gamemode change countries dont get recolored
    gameMap.value.recolorCountries(gameStats.value.foundList, gameStats.value.shownCountries)
  })
}

const loadCountries = () => {
  if (mapStore.countriesData.features.length) {
    countries.value = mapStore.countriesData.features

    // load savegame from store if exists and preselect the last game zone
    const savedProgress = zoneProgressStore.loadProgress(gameMode)
    if (savedProgress.lastZone !== null) {
      console.log("Find: Retrieving saved progress")

      const lastGameZone = savedProgress.lastZone
      const lastSaveGame = savedProgress.gameStats

      selectGameZone(lastGameZone)
      gameStats.value = lastSaveGame
    } else {
      // Select first game mode as default
      const firstZoneKey = Object.keys(gameZones.value)[0]
      selectGameZone(firstZoneKey)
    }
  }
}

watch(() => mapStore.countriesData.features.length, (newLength) => {
  if (newLength > 0) loadCountries()
})

onMounted(() => {
  if (mapStore.countriesData.features.length) loadCountries()

  // Stelle sicher, dass die Karte vollständig gerendert ist, bevor recolorCountries aufgerufen wird.
  nextTick(() => {
    // zusätzliches Timeout, falls der GeoJSON Layer noch nicht bereit ist
    setTimeout(() => {
      if (gameMap.value) {
        recolorCountries()
      }
    }, 200)
  })
})

// language change handler:
watch(() => props.selectedLanguage, () => {
  if (!currentGameZone.value || !countries.value.length) return

  // Update target country's localized name if one exists
  if (targetCountry.value) {
    const country = countries.value.find(c => c.properties.ADMIN === targetCountry.value.adminName)
    if (country) {
      targetCountry.value.localizedName = country.properties[props.selectedLanguage]
    }
  }
})
</script>