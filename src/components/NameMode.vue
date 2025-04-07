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

  <!-- Game Zone Selector -->
  <GameZoneSelector
      :zones="gameZones"
      :current-zone="currentGameZone"
      @select="selectGameZone"
  />

  <!-- Map -->
  <game-map
      ref="gameMap"
      :selected-language="selectedLanguage"
      :current-game-zone="currentGameZone"
  />
</template>

<script setup>
import {ref, onMounted, watch, nextTick} from 'vue'
import GameMap from './GameMap.vue'
import gameZoneData from '@/assets/gameZones.json'
import ScoreCounter from "@/components/ScoreCounter.vue";
import AccuracyCounter from "@/components/AccuracyCounter.vue";
import RoundCompleteDisplay from "@/components/RoundCompleteDisplay.vue";
import { useMapStore } from '@/stores/mapStore'
import GameZoneSelector from "@/components/GameZoneSelector.vue";
import { useZoneProgressStore } from '@/stores/zoneProgressStore'

const mapStore = useMapStore()
const zoneProgressStore = useZoneProgressStore()
const props = defineProps(['selectedLanguage'])
const gameMap = ref(null)
const countryInput = ref('')
const gameZones = ref(gameZoneData)
const currentGameZone = ref(null)
const currentGameZoneKey = ref(null)
const countries = ref([])
const gameMode = 'name';

const gameStats = ref({
  totalCountries: 0,
  foundCountries: 0,
  attempts: 0,
  correctAttempts: 0,
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

  // Check if the country exists in the current game zone and hasn't been found yet
  const foundCountry = countries.value.find(country =>
      currentGameZone.value.countries.includes(country.properties.ADMIN) &&
      !gameStats.value.foundList.includes(country.properties.ADMIN) &&
      Object.entries(country.properties)
          .filter(([key]) => key.startsWith('NAME_'))
          .some(([_, value]) => String(value).toLowerCase() === normalizedInput)
  );

  if (foundCountry) {
    gameStats.value.correctAttempts++
    gameStats.value.foundCountries++
    gameStats.value.foundList.push(foundCountry.properties.ADMIN)

    if (gameMap.value) {
      const countryData = {
        name: foundCountry.properties[props.selectedLanguage],
        id: foundCountry.id
      }
      gameMap.value.highlightCountry(countryData, 0, '#42b983')
    }

    // Save progress after successful guess
    zoneProgressStore.saveProgress(gameMode, currentGameZoneKey.value, gameStats.value)
  }

  countryInput.value = ''
}

const selectGameZone = (modeKey) => {
  currentGameZone.value = gameZones.value[modeKey]
  currentGameZoneKey.value = modeKey

  // Reset the map first
  if (gameMap.value) {
    gameMap.value.resetMapColors()
  }

  // Check for saved progress
  const savedProgress = zoneProgressStore.loadProgress(gameMode)
  if (savedProgress && savedProgress.lastZone === modeKey) {
    console.log("get save from store")
    gameStats.value = savedProgress.gameStats

    // Delay recoloring to ensure map is ready
    nextTick(() => {
      recolorCountries()
    })
  } else {
    console.log("reset")

    handleRestart()
  }

  nextTick(() => {
    if (gameMap.value) {
      gameMap.value.zoomToCountries(currentGameZone.value.countries)
    }
  })
}

const recolorCountries = () => {
  nextTick(() => {
    console.log("Recoloring Countries from savegame")
    if (gameMap.value && gameStats.value.foundList) {
      gameStats.value.foundList.forEach(adminName => {
        const country = countries.value.find(c => c.properties.ADMIN === adminName)
        if (country) {
          const countryData = {
            name: country.properties[props.selectedLanguage],
            id: country.id
          }
          gameMap.value.highlightCountry(countryData, 0, '#42b983')
        }
      })
    }
  })
}

const handleRestart = () => {
  if (!currentGameZone.value || !countries.value.length) return

  const filteredCountries = countries.value.filter(country =>
      currentGameZone.value.countries.includes(country.properties.ADMIN)
  )

  gameStats.value = {
    totalCountries: filteredCountries.length,
    foundCountries: 0,
    attempts: 0,
    correctAttempts: 0,
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

    // Load savegame from store if exists and preselect the last game zone
    const savedProgress = zoneProgressStore.loadProgress(gameMode)
    if (savedProgress && savedProgress.lastZone) {
      console.log("Retrieving saved progress")
      const lastGameZone = savedProgress.lastZone

      selectGameZone(lastGameZone)
    } else {
      // Select first game mode as default
      const firstModeKey = Object.keys(gameZones.value)[0]
      selectGameZone(firstModeKey)
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

// Watch for language changes
watch(() => props.selectedLanguage, () => {
  if (gameStats.value.foundList && gameMap.value) {
    gameMap.value.resetMapColors()
    recolorCountries()
  }
})
</script>