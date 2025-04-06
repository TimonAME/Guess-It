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
      @country-click="handleCountryClick"
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

const mapStore = useMapStore()
const props = defineProps(['selectedLanguage'])
const gameMap = ref(null)
const countryInput = ref('')
const gameZones = ref(gameZoneData)
const currentGameZone = ref(null)
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

const selectGameZone = (modeKey) => {
  currentGameZone.value = gameZones.value[modeKey]
  handleRestart()
  nextTick(() => {
    if (gameMap.value) {
      gameMap.value.zoomToCountries(currentGameZone.value.countries)
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
    const firstModeKey = Object.keys(gameZones.value)[0]
    selectGameZone(firstModeKey)
  }
}

watch(() => mapStore.countriesData.features.length, (newLength) => {
  if (newLength > 0) loadCountries()
})

onMounted(() => {
  if (mapStore.countriesData.features.length) loadCountries()
})

//watch(() => props.selectedLanguage, handleRestart)

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