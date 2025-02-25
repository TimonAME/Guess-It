<template>
  <div class="fixed sm:top-4 bottom-4 w-fit h-fit mx-auto left-0 right-0 flex flex-col gap-2 items-center z-10">
    <div class="sm:order-1 order-3 bg-white/90 backdrop-blur-sm text-sm rounded-lg px-3 py-3 shadow-lg border border-sunset-100/20">
      <div class="flex items-center gap-4 justify-evenly">
        <button @click="selectionMode = 'manual'; showManualInput = true"
                class="px-4 py-1 rounded-md transition-colors"
                :class="selectionMode === 'manual' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200' "
        >
          Manual Selection
        </button>
        <button @click="selectionMode = 'random'; showManualInput = false; handleNewCountries()"
                class="px-4 py-1 rounded-md transition-colors"
                :class="selectionMode === 'random' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200' "
        >
          Random Selection
        </button>
      </div>

      <div v-if="selectionMode === 'manual' && showManualInput" class="mt-3 grid grid-cols-2 gap-1">
        <div>
          <input
              v-model="manualCountry1"
              @input="searchCountry(manualCountry1, 'suggestions1')"
              type="text"
              placeholder="First Country"
              class="w-full px-3 py-2 border rounded-md"
          />
          <div v-if="suggestions1.length > 0" class="bg-white border rounded-md max-h-40 overflow-y-auto">
            <div
                v-for="suggestion in suggestions1"
                :key="suggestion.id"
                @click="selectCountry(suggestion, 'first')"
                class="px-3 py-1 hover:bg-gray-100 cursor-pointer"
            >
              {{ suggestion.properties[selectedLanguage] }}
            </div>
          </div>
        </div>
        <div>
          <input
              v-model="manualCountry2"
              @input="searchCountry(manualCountry2, 'suggestions2')"
              type="text"
              placeholder="Second Country"
              class="w-full px-3 py-2 border rounded-md"
          />
          <div v-if="suggestions2.length > 0" class="bg-white border rounded-md max-h-40 overflow-y-auto">
            <div
                v-for="suggestion in suggestions2"
                :key="suggestion.id"
                @click="selectCountry(suggestion, 'second')"
                class="px-3 py-1 hover:bg-gray-100 cursor-pointer"
            >
              {{ suggestion.properties[selectedLanguage] }}
            </div>
          </div>
        </div>
        <button
            @click="applyManualSelection"
            class="col-span-2 mt-2 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
        >
          Apply Selection
        </button>
      </div>
    </div>

    <div class="sm:order-2 order-2 bg-white/90 backdrop-blur-sm rounded-lg px-6 py-3 shadow-lg border border-sunset-100/20 text-center">
      <h2 class="text-center justify-center text-2xl font-semibold text-sunset-gray">
        <span class="text-blue-600">{{ startCountry?.name || 'Loading' }}</span>
        - <span class="text-red-600">{{ endCountry?.name || 'Loading' }}</span>
      </h2>
    </div>

    <!--
    <div v-if="gameStats.foundList.length > 0"
         class="sm:order-3 order-1 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-lg flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>
      <span>{{ gameStats.foundList.length }} countries found!</span>
    </div>
    -->
  </div>

  <div class="fixed bottom-4 w-fit h-fit mx-auto left-0 right-0 flex flex-col gap-2 items-center z-10">
    <div class="bg-white/90 backdrop-blur-sm text-sm rounded-lg px-4 py-3 shadow-lg border border-sunset-100/20 relative">
      <!-- Suggestions go above the input field now -->
      <div v-if="suggestions.length > 0" class="absolute bottom-full left-0 right-0 mb-1 bg-white border rounded-md max-h-40 overflow-y-auto">
        <div
            v-for="suggestion in suggestions"
            :key="suggestion.id"
            @click="selectCountrySuggestion(suggestion)"
            class="px-3 py-1 hover:bg-gray-100 cursor-pointer"
        >
          {{ suggestion.properties[selectedLanguage] }}
        </div>
      </div>

      <input
          v-model="countryInput"
          type="text"
          placeholder="Type a country name..."
          @input="searchCountry(countryInput, 'suggestions')"
          class="px-4 py-1 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
          @keyup.enter="submitCountry"
      />
    </div>
  </div>

  <game-map
      ref="gameMap"
      :selected-language="selectedLanguage"
  />
</template>

<script setup>
import {ref, computed, onMounted, watch} from 'vue'
import GameMap from './GameMap.vue'
import * as turf from '@turf/turf';


const props = defineProps(['selectedLanguage'])
const gameMap = ref(null)
const startCountry = ref(null)
const endCountry = ref(null)
const countries = ref([])
const selectionMode = ref('random')
const countryInput = ref('')
const manualCountry1 = ref('')
const manualCountry2 = ref('')
const suggestions = ref([])
const suggestions1 = ref([])
const suggestions2 = ref([])
const selectedCountry1 = ref(null)
const selectedCountry2 = ref(null)
const showManualInput = ref(false)

const gameStats = ref({
  foundList: [],
})

// when clicking random generating new countries
const handleNewCountries = () => {
  if (selectionMode.value === 'random') {
    generateRandomCountries()
  } else {
    if (!selectedCountry1.value || !selectedCountry2.value) {
      console.log('Please select both countries first')
    }
  }
}

const generateRandomCountries = () => {
  if (countries.value.length < 2) return

  // Select two random countries
  const index1 = Math.floor(Math.random() * countries.value.length)
  let index2 = Math.floor(Math.random() * countries.value.length)

  // Make sure they're different
  while (index2 === index1) {
    index2 = Math.floor(Math.random() * countries.value.length)
  }

  const country1 = countries.value[index1]
  const country2 = countries.value[index2]

  startCountry.value = {
    name: country1.properties[props.selectedLanguage],
    id: country1.id
  }

  endCountry.value = {
    name: country2.properties[props.selectedLanguage],
    id: country2.id
  }

  // Reset game with new countries
  resetGameWithCurrentCountries()
}

const applyManualSelection = () => {
  if (!selectedCountry1.value || !selectedCountry2.value) {
    console.log('Please select both countries')
    return
  }

  showManualInput.value = false

  startCountry.value = {
    name: selectedCountry1.value.properties[props.selectedLanguage],
    id: selectedCountry1.value.id
  }

  endCountry.value = {
    name: selectedCountry2.value.properties[props.selectedLanguage],
    id: selectedCountry2.value.id
  }

  // Reset game with new countries
  resetGameWithCurrentCountries()
}

const resetGameWithCurrentCountries = () => {
  // Reset game stats
  gameStats.value = {
    foundList: [],
  }

  // Reset map colors
  if (gameMap.value) {
    gameMap.value.resetMapColors()
  }

  // Highlight start and end countries
  if (gameMap.value && startCountry.value) {
    gameMap.value.highlightCountry(startCountry.value, 0, '#4287f5') // Blue for start
  }

  if (gameMap.value && endCountry.value) {
    gameMap.value.highlightCountry(endCountry.value, 0, '#f54242') // Red for end
  }
}

const searchCountry = (query, suggestionListName) => {
  if (!query || query.length < 2) {
    // Clear suggestions if query is too short
    switch (suggestionListName) {
      case 'suggestions':
        suggestions.value = []
        break
      case 'suggestions1':
        suggestions1.value = []
        break
      case 'suggestions2':
        suggestions2.value = []
        break
    }
    return
  }

  // Filter countries based on query
  const filteredCountries = countries.value.filter(country =>
      country.properties[props.selectedLanguage].toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5) // Limit to 5 suggestions

  // Update the appropriate suggestion list
  switch (suggestionListName) {
    case 'suggestions':
      suggestions.value = filteredCountries
      break
    case 'suggestions1':
      suggestions1.value = filteredCountries
      break
    case 'suggestions2':
      suggestions2.value = filteredCountries
      break
  }
}

// select country for manual input mode
const selectCountry = (country, position) => {
  if (position === 'first') {
    selectedCountry1.value = country
    manualCountry1.value = country.properties[props.selectedLanguage]
    suggestions1.value = []
  } else {
    selectedCountry2.value = country
    manualCountry2.value = country.properties[props.selectedLanguage]
    suggestions2.value = []
  }
}

// select country from dropdown for submition
const selectCountrySuggestion = (country) => {
  console.log("selectCountrySuggestion")

  if (!country || !country.properties || !country.properties[props.selectedLanguage]) return;

  countryInput.value = country.properties[props.selectedLanguage]
  suggestions.value = []

  // Auto-submit after selection
  submitCountry(country)
}

// submit country for highliting and path finding
const submitCountry = (country = null) => {
  let selectedFeature = null;

  if (country && country.properties && country.properties[props.selectedLanguage]) {
    selectedFeature = country;
  } else {
    selectedFeature = countries.value.find(c =>
        c.properties?.[props.selectedLanguage]?.toLowerCase() === countryInput.value.toLowerCase()
    );
  }

  if (selectedFeature?.properties?.[props.selectedLanguage]) {
    const isAlreadyFound = gameStats.value.foundList.some(
        country => country.properties[props.selectedLanguage] === selectedFeature.properties[props.selectedLanguage]
    );

    if (!isAlreadyFound) {
      gameStats.value.foundList.push(selectedFeature);

      // Test the findNeighboringCountries method
      const neighbors = findNeighboringCountries(selectedFeature);
      console.log('Selected country:', selectedFeature.properties[props.selectedLanguage]);
      console.log('Neighboring countries:', neighbors.map(n => n.properties[props.selectedLanguage]));

      if (gameMap.value) {
        gameMap.value.highlightCountry({
          name: selectedFeature.properties[props.selectedLanguage],
          id: selectedFeature.id
        }, 0, '#42b983');
      }
    }

    countryInput.value = '';
  }
};

const findNeighboringCountries = (targetCountry) => {
  return null;
};

const loadCountries = async () => {
  try {
    const response = await fetch('/Guess-It/ne_10m_admin_0_countries_lakes_no_antarktika.json')
    const data = await response.json()
    // Filter out Vatican City
    countries.value = data.features.filter(country =>
        country.properties.ADMIN !== 'Vatican' &&
        country.properties.NAME !== 'Vatican City'
    )
    // Initialize the game with random countries
    generateRandomCountries()
  } catch (error) {
    console.error('Error loading countries:', error)
  }
}

onMounted(loadCountries)
watch(() => props.selectedLanguage, generateRandomCountries)
</script>