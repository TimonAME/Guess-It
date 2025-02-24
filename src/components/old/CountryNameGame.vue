<template>
  <div class="space-y-6">
    <div class="bg-white p-4 rounded-lg shadow-sm">
      <div class="flex justify-between items-center mb-4">
        <div class="space-x-4">
          <span class="text-lg font-medium">Found: {{ foundCountries.length }}/{{ totalCountries }}</span>
          <span class="text-lg font-medium">Time: {{ formatTime(timer) }}</span>
        </div>
        <div class="space-x-2">
          <button
              @click="startNewGame"
              class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            New Game
          </button>
          <button
              @click="giveUp"
              class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Give Up
          </button>
        </div>
      </div>

      <div class="relative">
        <input
            v-model="userInput"
            @input="handleInput"
            :placeholder="gameActive ? 'Type a country name...' : 'Press New Game to start'"
            class="w-full px-4 py-2 border rounded-md"
            :disabled="!gameActive"
            ref="inputField"
        />
        <div
            v-if="suggestions.length > 0"
            class="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          <div
              v-for="suggestion in suggestions"
              :key="suggestion"
              @click="selectSuggestion(suggestion)"
              class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          >
            {{ suggestion }}
          </div>
        </div>
      </div>
    </div>

    <game-map
        ref="gameMap"
        :selected-language="selectedLanguage"
    />

    <!-- Game Over Modal -->
    <div v-if="showGameOver" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 class="text-2xl font-bold mb-4">Game Over!</h2>
        <p class="mb-2">Time taken: {{ formatTime(timer) }}</p>
        <p class="mb-4">Countries found: {{ foundCountries.length }}/{{ totalCountries }}</p>
        <div class="flex justify-end space-x-2">
          <button
              @click="showGameOver = false"
              class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
          <button
              @click="startNewGame"
              class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import GameMap from '../GameMap.vue'

const props = defineProps({
  selectedLanguage: {
    type: String,
    default: 'name'
  }
})

const gameMap = ref(null)
const inputField = ref(null)
const userInput = ref('')
const suggestions = ref([])
const countries = ref([])
const foundCountries = ref([])
const gameActive = ref(false)
const timer = ref(0)
const timerInterval = ref(null)
const showGameOver = ref(false)
const totalCountries = ref(0)

const loadCountries = async () => {
  try {
    const response = await fetch('/ne_10m_admin_0_countries_lakes.json')
    const data = await response.json()
    countries.value = data.features.map(f => ({
      name: f.properties[props.selectedLanguage],
      id: f.id
    }))
    totalCountries.value = countries.value.length
  } catch (error) {
    console.error('Error loading countries:', error)
  }
}

const startTimer = () => {
  timerInterval.value = setInterval(() => {
    timer.value++
  }, 1000)
}

const stopTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
}

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const handleInput = () => {
  if (!userInput.value.trim()) {
    suggestions.value = []
    return
  }

  const input = userInput.value.toLowerCase()
  suggestions.value = countries.value
      .filter(country =>
          !foundCountries.value.includes(country) &&
          country.name.toLowerCase().includes(input)
      )
      .map(country => country.name)
      .slice(0, 5)
}

const selectSuggestion = (countryName) => {
  const country = countries.value.find(c => c.name === countryName)
  if (country && !foundCountries.value.includes(country)) {
    foundCountries.value.push(country)
    gameMap.value?.highlightCountry(country)
    userInput.value = ''
    suggestions.value = []

    if (foundCountries.value.length === totalCountries.value) {
      endGame()
    }
  }
}

const startNewGame = () => {
  foundCountries.value = []
  timer.value = 0
  gameActive.value = true
  showGameOver.value = false
  userInput.value = ''
  suggestions.value = []

  // Reset map highlights
  if (gameMap.value) {
    countries.value.forEach(country => {
      gameMap.value.highlightCountry({ ...country, reset: true })
    })
  }

  startTimer()
  inputField.value?.focus()
}

const giveUp = () => {
  endGame()
}

const endGame = () => {
  gameActive.value = false
  stopTimer()
  showGameOver.value = true
}

onMounted(async () => {
  await loadCountries()
})

onUnmounted(() => {
  stopTimer()
})
</script>