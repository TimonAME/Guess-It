<template>
  <div class="fixed sm:top-4 bottom-4 w-fit h-fit mx-auto left-0 right-0 flex flex-col gap-2 items-center z-10">
    <!-- Replace the buttons section -->
    <div class="sm:order-1 order-3 bg-white/90 backdrop-blur-sm text-sm rounded-lg px-4 py-3 shadow-lg border border-sunset-100/20">
      <div class="flex flex-col gap-3">
        <!-- Route Selection -->
        <div class="flex items-center gap-2">
          <div class="flex-1">
            <select v-model="startSelection" class="w-full px-3 py-2 border rounded-md" @change="handleStartChange">
              <option value="random">Random Start</option>
              <option value="search">Search Country</option>
            </select>
            <div v-if="startSelection === 'search'" class="mt-2">
              <input
                  type="text"
                  v-model="startSearch"
                  @input="filterStartCountries"
                  placeholder="Search start country..."
                  class="w-full px-3 py-2 border rounded-md"
              />
              <div v-if="filteredStartCountries.length > 0" class="max-h-40 overflow-y-auto mt-1 border rounded-md">
                <button
                    v-for="country in filteredStartCountries"
                    :key="country.properties.ISO_A3"
                    @click="selectStartCountry(country)"
                    class="w-full text-left px-3 py-2 hover:bg-gray-100"
                >
                  {{ country.properties[selectedLanguage] }}
                </button>
              </div>
            </div>
          </div>

          <div class="flex-1">
            <select v-model="endSelection" class="w-full px-3 py-2 border rounded-md" @change="handleEndChange">
              <option value="random">Random Destination</option>
              <option value="search">Search Country</option>
            </select>
            <div v-if="endSelection === 'search'" class="mt-2">
              <input
                  type="text"
                  v-model="endSearch"
                  @input="filterEndCountries"
                  placeholder="Search destination..."
                  class="w-full px-3 py-2 border rounded-md"
              />
              <div v-if="filteredEndCountries.length > 0" class="max-h-40 overflow-y-auto mt-1 border rounded-md">
                <button
                    v-for="country in filteredEndCountries"
                    :key="country.properties.ISO_A3"
                    @click="selectEndCountry(country)"
                    class="w-full text-left px-3 py-2 hover:bg-gray-100"
                >
                  {{ country.properties[selectedLanguage] }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Path Input -->
        <div class="flex items-center gap-2">
          <input
              type="text"
              v-model="pathInput"
              @keyup.enter="tryHighlightPath"
              placeholder="Enter country to add to path..."
              class="flex-1 px-3 py-2 border rounded-md"
          />
          <button
              @click="tryHighlightPath"
              class="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            Add to Path
          </button>
        </div>

        <button
            @click="handleNewRoute"
            class="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
        >
          New Route
        </button>
      </div>

      <!-- Stats -->
      <div class="flex items-center justify-between mt-3">
        <div class="text-sunset-gray">
          Found: {{ gameStats.foundCountries.length }}/{{ gameStats.pathCountries.length }}
        </div>
        <div class="text-sunset-gray">
          Accuracy: {{ calculateAccuracy() }}%
        </div>
      </div>
    </div>

    <div class="sm:order-2 order-2 bg-white/90 backdrop-blur-sm rounded-lg px-6 py-3 shadow-lg border border-sunset-100/20 text-center">
      <h2 class="text-center justify-center text-xl font-semibold text-sunset-gray">
        <span v-if="!startCountry && !endCountry && selectionMode === 'Manual'">
          Click on the map to select your start country
        </span>
        <span v-else-if="startCountry && !endCountry && selectionMode === 'Manual'">
          Start: {{ startCountry.properties[selectedLanguage] }}<br>
          Click on the map to select your destination
        </span>
        <span v-else-if="manualSelectionFailed">
          No valid path exists between these countries.<br>
          Please select new countries.
        </span>
        <span v-else-if="startCountry && endCountry">
          <span class="text-blue-600">{{ startCountry.properties[selectedLanguage] }}</span>
          - <span class="text-red-600">{{ endCountry.properties[selectedLanguage] }}</span>
        </span>
        <span v-else>
          Loading...
        </span>
      </h2>
    </div>

    <div v-if="gameStats.pathComplete"
         class="sm:order-3 order-1 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-lg flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>
      <span>Path Complete! You found all countries in the route.</span>
    </div>
  </div>

  <game-map
      ref="gameMap"
      @country-click="handleCountryClick"
      :selected-language="selectedLanguage"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import GameMap from './GameMap.vue'
import GameModes from './GameModes.vue'

const props = defineProps(['selectedLanguage'])
const gameMap = ref(null)
const countries = ref([])
const startCountry = ref(null)
const endCountry = ref(null)
const currentGameMode = ref('all')
const selectionMode = ref('Random')
const isSelectionOpen = ref(false)
const manualSelectionFailed = ref(false)
const borderGraph = ref({})
const startSelection = ref('random')
const endSelection = ref('random')
const startSearch = ref('')
const endSearch = ref('')
const pathInput = ref('')
const filteredStartCountries = ref([])
const filteredEndCountries = ref([])

const gameStats = ref({
  foundCountries: [],
  pathCountries: [],
  remainingCountries: [],
  attempts: 0,
  correctAttempts: 0,
  pathComplete: false
})

const selectedLanguage = computed(() => props.selectedLanguage)

const calculateAccuracy = () => {
  return gameStats.value.attempts === 0 ? 100 :
      Math.round((gameStats.value.correctAttempts / gameStats.value.attempts) * 100)
}

const handleCountryClick = (feature, callback) => {
  // Handle manual country selection mode
  if (selectionMode.value === 'Manual') {
    if (!startCountry.value) {
      startCountry.value = feature
      gameMap.value.highlightCountry({name: feature.properties[selectedLanguage.value]}, 0, '#4287f5')
      return
    } else if (!endCountry.value) {
      endCountry.value = feature
      gameMap.value.highlightCountry({name: feature.properties[selectedLanguage.value]}, 0, '#f54242')

      // Now find path between countries
      findPath()
      return
    }
  }

  // Regular gameplay - check if selected country is in the path
  const isAlreadyFound = gameStats.value.foundCountries.some(
      country => country.properties[selectedLanguage.value] === feature.properties[selectedLanguage.value]
  )

  if (isAlreadyFound) return

  gameStats.value.attempts++
  const isCorrect = gameStats.value.remainingCountries.some(
      country => country.properties[selectedLanguage.value] === feature.properties[selectedLanguage.value]
  )

  if (isCorrect) {
    gameStats.value.correctAttempts++
    handleCorrectGuess(feature)
  }

  callback?.(isCorrect)
}

const handleCorrectGuess = (feature) => {
  // Find the country in the remaining countries
  const foundCountry = gameStats.value.remainingCountries.find(
      c => c.properties[selectedLanguage.value] === feature.properties[selectedLanguage.value]
  )

  // Add to found countries
  gameStats.value.foundCountries.push(foundCountry)

  // Remove from remaining countries
  gameStats.value.remainingCountries = gameStats.value.remainingCountries.filter(
      c => c.properties[selectedLanguage.value] !== feature.properties[selectedLanguage.value]
  )

  // Highlight the country in green
  gameMap.value.highlightCountry({name: feature.properties[selectedLanguage.value]}, 0, '#42b983')

  // Check if path is complete
  if (gameStats.value.remainingCountries.length === 0) {
    gameStats.value.pathComplete = true
  }
}

const handleNewRoute = () => {
  resetGame()

  if (selectionMode.value === 'Random') {
    selectRandomCountries()
  } else {
    // For manual mode, just reset and wait for user clicks
    startCountry.value = null
    endCountry.value = null
    manualSelectionFailed.value = false
  }
}

const handleShowPath = () => {
  if (!startCountry.value || !endCountry.value) return

  // Mark all countries in the path
  gameStats.value.pathCountries.forEach(country => {
    // Skip start and end countries which are already highlighted
    if (country.properties[selectedLanguage.value] === startCountry.value.properties[selectedLanguage.value] ||
        country.properties[selectedLanguage.value] === endCountry.value.properties[selectedLanguage.value]) {
      return
    }

    gameMap.value.highlightCountry({name: country.properties[selectedLanguage.value]}, 0, '#ffaa00')
  })

  // Mark all as found
  gameStats.value.foundCountries = [...gameStats.value.pathCountries]
  gameStats.value.remainingCountries = []
  gameStats.value.pathComplete = true
}

const handleGiveUp = () => {
  handleShowPath()
}

const changeSelectionMode = (mode) => {
  selectionMode.value = mode
  isSelectionOpen.value = false
  resetGame()

  if (mode === 'Random') {
    selectRandomCountries()
  }
}

const handleGameModeChange = () => {
  resetGame()

  if (selectionMode.value === 'Random') {
    selectRandomCountries()
  }
}

const resetGame = () => {
  // Reset game stats
  gameStats.value = {
    foundCountries: [],
    pathCountries: [],
    remainingCountries: [],
    attempts: 0,
    correctAttempts: 0,
    pathComplete: false
  }

  // Reset map colors
  if (gameMap.value) {
    gameMap.value.resetMapColors()
  }
}

const loadCountries = async () => {
  try {
    const response = await fetch('/Guess-It/ne_10m_admin_0_countries_lakes_no_antarktika.json')
    const data = await response.json()

    // Filter out Vatican City
    countries.value = data.features.filter(country =>
        country.properties.ADMIN !== 'Vatican' &&
        country.properties.NAME !== 'Vatican City'
    )

    // Build the border graph
    buildBorderGraph()

    // Initialize the game
    if (selectionMode.value === 'Random') {
      selectRandomCountries()
    }
  } catch (error) {
    console.error('Error loading countries:', error)
  }
}

const buildBorderGraph = () => {
  // Initialize the graph
  borderGraph.value = {}

  // For each country, find its neighbors
  countries.value.forEach(country => {
    const countryId = country.properties.ISO_A3
    borderGraph.value[countryId] = []

    // Check all other countries to see if they share a border
    countries.value.forEach(otherCountry => {
      if (country === otherCountry) return

      const otherCountryId = otherCountry.properties.ISO_A3

      // Check if countries share a border based on their geometries
      // This is a simplified approach - in a real implementation, you would need
      // to use proper GeoJSON libraries to check for shared borders
      const sharesBorder = checkIfSharesBorder(country, otherCountry)

      if (sharesBorder) {
        borderGraph.value[countryId].push(otherCountryId)
      }
    })
  })
}

const checkIfSharesBorder = (country1, country2) => {
  // In a real implementation, you would use a proper GeoJSON library to check if polygons share borders
  // This is a placeholder for that logic
  // For now, we'll use a predefined list of country borders

  // This is a simplified approach using the neighbors property if it exists
  if (country1.properties.NEIGHBORS && country1.properties.NEIGHBORS.includes(country2.properties.ISO_A3)) {
    return true
  }

  // Add some common border relationships
  const commonBorders = {
    'USA': ['CAN', 'MEX'],
    'DEU': ['FRA', 'POL', 'CZE', 'AUT', 'CHE', 'NLD', 'BEL', 'LUX', 'DNK'],
    'FRA': ['ESP', 'DEU', 'ITA', 'CHE', 'BEL', 'LUX', 'AND', 'MCO'],
    'ESP': ['FRA', 'PRT', 'AND', 'GIB', 'MAR'],
    'ITA': ['FRA', 'CHE', 'AUT', 'SVN', 'SMR', 'VAT'],
    // Add more as needed
  }

  const iso1 = country1.properties.ISO_A3
  const iso2 = country2.properties.ISO_A3

  return (commonBorders[iso1] && commonBorders[iso1].includes(iso2)) ||
      (commonBorders[iso2] && commonBorders[iso2].includes(iso1))
}

const selectRandomCountries = () => {
  // Reset state
  startCountry.value = null
  endCountry.value = null

  // Select two random countries from the list with at least some minimum distance
  let attempts = 0
  const maxAttempts = 100

  while (attempts < maxAttempts) {
    const randomIndex1 = Math.floor(Math.random() * countries.value.length)
    const randomIndex2 = Math.floor(Math.random() * countries.value.length)

    const country1 = countries.value[randomIndex1]
    const country2 = countries.value[randomIndex2]

    if (randomIndex1 !== randomIndex2) {
      // Check if there's a path between them
      const path = findPathBetweenCountries(country1, country2)

      if (path && path.length > 2) { // At least one country in between
        startCountry.value = country1
        endCountry.value = country2

        // Highlight start and end countries
        gameMap.value.highlightCountry({name: country1.properties[selectedLanguage.value]}, 0, '#4287f5')
        gameMap.value.highlightCountry({name: country2.properties[selectedLanguage.value]}, 0, '#f54242')

        // Set up game stats with the path
        setupPath(path)
        break
      }
    }

    attempts++
  }

  if (!startCountry.value || !endCountry.value) {
    console.error('Could not find suitable countries after maximum attempts')
    // Fallback to some known path
    const defaultCountry1 = countries.value.find(c => c.properties.NAME === 'Germany')
    const defaultCountry2 = countries.value.find(c => c.properties.NAME === 'Spain')

    if (defaultCountry1 && defaultCountry2) {
      startCountry.value = defaultCountry1
      endCountry.value = defaultCountry2

      // Highlight start and end countries
      gameMap.value.highlightCountry({name: defaultCountry1.properties[selectedLanguage.value]}, 0, '#4287f5')
      gameMap.value.highlightCountry({name: defaultCountry2.properties[selectedLanguage.value]}, 0, '#f54242')

      // Find and set up the path
      const path = findPathBetweenCountries(defaultCountry1, defaultCountry2)
      if (path) {
        setupPath(path)
      }
    }
  }
}

const findPath = () => {
  if (!startCountry.value || !endCountry.value) return

  const path = findPathBetweenCountries(startCountry.value, endCountry.value)

  if (!path || path.length <= 1) {
    // No valid path
    manualSelectionFailed.value = true

    // Reset selection
    setTimeout(() => {
      gameMap.value.resetMapColors()
      startCountry.value = null
      endCountry.value = null
      manualSelectionFailed.value = false
    }, 3000)

    return
  }

  setupPath(path)
}

const findPathBetweenCountries = (country1, country2) => {
  const start = country1.properties.ISO_A3
  const end = country2.properties.ISO_A3

  // If we don't have border data for these countries
  if (!borderGraph.value[start] || !borderGraph.value[end]) {
    return null
  }

  // Breadth-first search to find the shortest path
  const queue = [[start]]
  const visited = new Set([start])

  while (queue.length > 0) {
    const path = queue.shift()
    const current = path[path.length - 1]

    if (current === end) {
      // Found the path
      return path.map(iso => countries.value.find(c => c.properties.ISO_A3 === iso))
    }

    // Try all neighbors
    for (const neighbor of borderGraph.value[current] || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push([...path, neighbor])
      }
    }
  }

  // No path found
  return null
}

const setupPath = (path) => {
  if (!path) return

  // Set the path countries
  gameStats.value.pathCountries = path

  // Remove start and end countries from the ones to find
  gameStats.value.foundCountries = [
    path.find(c => c.properties.ISO_A3 === startCountry.value.properties.ISO_A3),
    path.find(c => c.properties.ISO_A3 === endCountry.value.properties.ISO_A3)
  ]

  gameStats.value.remainingCountries = path.filter(country =>
      country.properties.ISO_A3 !== startCountry.value.properties.ISO_A3 &&
      country.properties.ISO_A3 !== endCountry.value.properties.ISO_A3
  )
}

// New methods
const filterStartCountries = () => {
  if (!startSearch.value) {
    filteredStartCountries.value = []
    return
  }
  filteredStartCountries.value = countries.value.filter(country =>
      country.properties[selectedLanguage.value].toLowerCase().includes(startSearch.value.toLowerCase())
  ).slice(0, 5)
}

const filterEndCountries = () => {
  if (!endSearch.value) {
    filteredEndCountries.value = []
    return
  }
  filteredEndCountries.value = countries.value.filter(country =>
      country.properties[selectedLanguage.value].toLowerCase().includes(endSearch.value.toLowerCase())
  ).slice(0, 5)
}

const selectStartCountry = (country) => {
  startCountry.value = country
  gameMap.value.highlightCountry({name: country.properties[selectedLanguage.value]}, 0, '#4287f5')
  startSearch.value = ''
  filteredStartCountries.value = []
  if (endCountry.value) findPath()
}

const selectEndCountry = (country) => {
  endCountry.value = country
  gameMap.value.highlightCountry({name: country.properties[selectedLanguage.value]}, 0, '#f54242')
  endSearch.value = ''
  filteredEndCountries.value = []
  if (startCountry.value) findPath()
}

const handleStartChange = () => {
  if (startSelection.value === 'random') {
    selectRandomStart()
  }
}

const handleEndChange = () => {
  if (endSelection.value === 'random') {
    selectRandomEnd()
  }
}

const selectRandomStart = () => {
  const randomCountry = countries.value[Math.floor(Math.random() * countries.value.length)]
  selectStartCountry(randomCountry)
}

const selectRandomEnd = () => {
  const randomCountry = countries.value[Math.floor(Math.random() * countries.value.length)]
  selectEndCountry(randomCountry)
}

const tryHighlightPath = () => {
  if (!pathInput.value) return

  const country = countries.value.find(c =>
      c.properties[selectedLanguage.value].toLowerCase() === pathInput.value.toLowerCase()
  )

  if (country) {
    handleCountryClick(country)
    pathInput.value = ''
  }
}

onMounted(loadCountries)
watch(() => props.selectedLanguage, handleGameModeChange)
</script>