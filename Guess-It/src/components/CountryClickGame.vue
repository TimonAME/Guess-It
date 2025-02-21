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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import GameMap from './GameMap.vue'

const props = defineProps(['selectedLanguage'])

const store = useStore()
const score = computed(() => store.state.score)
const targetCountry = ref(null)
const countries = ref([])

const generateNewTarget = () => {
  if (countries.value.length > 0) {
    const randomIndex = Math.floor(Math.random() * countries.value.length)
    targetCountry.value = countries.value[randomIndex]
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
    const response = await fetch('/ne_10m_admin_0_countries_lakes.json')
    const data = await response.json()
    countries.value = data.features.map(f => ({
      name: f.properties[props.selectedLanguage],
      id: f.id
    }))
    generateNewTarget()
  } catch (error) {
    console.error('Error loading countries:', error)
  }
}

// In the main component
const gameMap = ref(null) // Add this ref for the GameMap component

const showCountry = () => {
  if (targetCountry.value && gameMap.value) {
    console.log('Showing:', targetCountry.value.name)

    gameMap.value.highlightCountry(targetCountry)

    generateNewTarget()
  }
}

onMounted(loadCountries)
watch(() => props.selectedLanguage, loadCountries)
</script>