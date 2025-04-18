<template>
  <div class="fixed sm:top-4 bottom-4 w-fit h-fit mx-auto left-0 right-0 flex flex-col gap-2 items-center z-10">
    <div class="sm:order-1 order-4 bg-white/90 backdrop-blur-sm text-sm rounded-lg px-4 py-3 shadow-lg border border-sunset-100/20">
      <div class="flex items-center gap-4 justify-between mb-3">
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

    <div v-if="gameStats.foundCountries !== gameStats.totalCountries || gameStats.totalCountries === 0"
         class="sm:order-3 order-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-3 shadow-lg border border-sunset-100/20 text-center">
      <img
          v-if="targetCountry"
          :src="`https://flagcdn.com/w160/${targetCountry.iso.toLowerCase()}.png`"
          :srcset="`https://flagcdn.com/w320/${targetCountry.iso.toLowerCase()}.png 2x`"
          width="160"
          class="mx-auto shadow"
          alt="Country Flag"
      />
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
import ScoreCounter from "@/components/ScoreCounter.vue"
import AccuracyCounter from "@/components/AccuracyCounter.vue"
import RoundCompleteDisplay from "@/components/RoundCompleteDisplay.vue"
import {useMapStore} from '@/stores/mapStore'
import GameZoneSelector from "@/components/GameZoneSelector.vue"
import {useZoneProgressStore} from '@/stores/zoneProgressStore'

const mapStore = useMapStore()
const props = defineProps(['selectedLanguage'])
const gameMap = ref(null)
const targetCountry = ref(null)
const countries = ref([])
const gameZones = ref(gameZoneData)
const currentGameZone = ref(null)
const currentGameZoneKey = ref(null)
const zoneProgressStore = useZoneProgressStore()
const gameMode = 'flag'

const gameStats = ref({
  totalCountries: 0,
  foundCountries: 0,
  attempts: 0,
  correctAttempts: 0,
  foundList: [],
  shownCountries: []
})

const calculateAccuracy = () => {
  if (gameStats.value.attempts === 0) return 0
  return Math.round((gameStats.value.correctAttempts / gameStats.value.attempts) * 100)
}

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
  gameStats.value.foundList.push(targetCountry.value.adminName)

  setTimeout(() => {
    generateNewTarget()
  }, 100)
}

const selectGameZone = (modeKey) => {
  currentGameZone.value = gameZones.value[modeKey]
  currentGameZoneKey.value = modeKey

  if (gameMap.value) {
    gameMap.value.resetMapColors()
  }

  const savedProgress = zoneProgressStore.loadProgress(gameMode)
  if (savedProgress.lastZone !== null && savedProgress.lastZone === modeKey) {
    gameStats.value = savedProgress.gameStats
    generateNewTarget()
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

  targetCountry.value = {
    localizedName: country.properties[props.selectedLanguage],
    adminName: country.properties.ADMIN,
    iso: country.properties.ISO_A2_EH
  }

  if (gameStats.value.attempts > 0) {
    zoneProgressStore.saveProgress(gameMode, currentGameZoneKey.value, gameStats.value)
  }
}

const showCountry = () => {
  if (targetCountry.value && gameMap.value) {
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

const recolorCountries = () => {
  nextTick(() => {
    gameMap.value.recolorCountries(gameStats.value.foundList, gameStats.value.shownCountries)
  })
}

const loadCountries = () => {
  if (mapStore.countriesData.features.length) {
    countries.value = mapStore.countriesData.features

    const savedProgress = zoneProgressStore.loadProgress(gameMode)
    if (savedProgress.lastZone !== null) {
      const lastGameZone = savedProgress.lastZone
      selectGameZone(lastGameZone)
    } else {
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

  nextTick(() => {
    setTimeout(() => {
      if (gameMap.value) {
        recolorCountries()
      }
    }, 200)
  })
})

watch(() => props.selectedLanguage, () => {
  if (!currentGameZone.value || !countries.value.length) return

  if (targetCountry.value) {
    const country = countries.value.find(c => c.properties.ADMIN === targetCountry.value.adminName)
    if (country) {
      targetCountry.value.localizedName = country.properties[props.selectedLanguage]
    }
  }
})
</script>