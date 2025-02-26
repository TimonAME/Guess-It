<template>
  <div class="fixed sm:top-4 bottom-4 w-fit h-fit mx-auto left-0 right-0 flex flex-col gap-2 items-center z-10">
    <div class="sm:order-1 order-3 bg-white/90 backdrop-blur-sm text-sm rounded-lg px-4 py-3 shadow-lg border border-sunset-100/20">
      <div class="flex items-center gap-4 justify-between mb-3">
        <button @click="handleExport"
                class="px-4 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors">
          Export Selected ({{ selectedCountries.length }})
        </button>
        <button @click="handleExportAll"
                class="px-4 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors">
          Export All
        </button>
        <button @click="handleClearSelection"
                class="px-4 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors">
          Clear Selection
        </button>
      </div>

      <div class="flex flex-col">
        <div class="flex items-center justify-between">
          <div class="text-sunset-gray">
            <span>
              ({{ selectedCountries.length }} selected)
            </span>
          </div>
          <div v-if="exportStatus" class="text-green-600 ml-2">
            {{ exportStatus }}
          </div>
        </div>
      </div>
    </div>

    <div class="sm:order-2 order-2 bg-white/90 backdrop-blur-sm rounded-lg px-6 py-3 shadow-lg border border-sunset-100/20 text-center max-w-md">
      <h2 class="text-center justify-center text-2xl font-semibold text-sunset-gray">
        Select countries to export
      </h2>

      <!-- Recently selected countries preview -->
      <div v-if="selectedCountries.length > 0" class="mt-2 text-sm text-sunset-gray">
        <div class="flex flex-wrap gap-1 mt-2 max-h-20 overflow-y-auto">
          <div v-for="country in selectedCountries.slice(-5).reverse()" :key="country.id"
               class="bg-blue-100 text-blue-800 px-2 py-1 rounded-md flex items-center">
            {{ country.name }}
            <button @click="removeCountry(country.id)" class="ml-1 text-blue-800 hover:text-blue-600">
              ×
            </button>
          </div>
          <div v-if="selectedCountries.length > 5" class="text-sunset-gray px-2 py-1">
            +{{ selectedCountries.length - 5 }} more
          </div>
        </div>
      </div>
    </div>
  </div>

  <game-map
      ref="gameMap"
      @country-click="handleCountryClick"
      :selected-language="selectedLanguage"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import GameMap from './GameMap.vue'

const props = defineProps(['selectedLanguage'])
const gameMap = ref(null)
const selectedCountries = ref([])
const exportStatus = ref('')
const allCountries = ref([])

const loadCountries = async () => {
  try {
    const response = await fetch('/Guess-It/ne_10m_admin_0_countries_lakes_no_antarktika.json')
    const data = await response.json()
    allCountries.value = data.features
  } catch (error) {
    console.error('Error loading countries:', error)
  }
}

const handleCountryClick = (feature) => {
  const countryData = {
    id: feature.properties.ISO_A3,
    name: feature.properties[props.selectedLanguage]
  }

  const existingIndex = selectedCountries.value.findIndex(
      country => country.id === countryData.id
  )

  if (existingIndex === -1) {
    selectedCountries.value.push(countryData)
    if (gameMap.value) {
      gameMap.value.highlightCountry({
        name: feature.properties[props.selectedLanguage]
      }, 0, '#42b983')
    }
  } else {
    selectedCountries.value.splice(existingIndex, 1)
    if (gameMap.value) {
      gameMap.value.resetCountryColor({
        name: feature.properties[props.selectedLanguage]
      })
    }
  }
}

const removeCountry = (countryId) => {
  const country = selectedCountries.value.find(
      country => country.id === countryId
  )

  if (country) {
    selectedCountries.value = selectedCountries.value.filter(c => c.id !== countryId)
    if (gameMap.value) {
      gameMap.value.resetCountryColor({
        name: country.name
      })
    }
  }
}

const handleExport = () => {
  if (selectedCountries.value.length === 0) {
    exportStatus.value = 'No countries selected'
    setTimeout(() => {
      exportStatus.value = ''
    }, 3000)
    return
  }

  // Find the full feature data for each selected country and use ADMIN property
  const countriesList = '"countries": [\n' + selectedCountries.value
      .map(country => {
        const feature = allCountries.value.find(f => f.properties.ISO_A3 === country.id)
        return `      "${feature.properties.ADMIN}"`
      })
      .sort()
      .join(',\n') + '\n    ]'

  // Create a blob and download link
  const blob = new Blob([countriesList], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'selected_countries.txt'
  document.body.appendChild(a)
  a.click()

  // Clean up
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 100)

  exportStatus.value = 'Countries exported!'
  setTimeout(() => {
    exportStatus.value = ''
  }, 3000)
}

const handleExportAll = () => {
  if (!allCountries.value.length) {
    exportStatus.value = 'No countries loaded'
    setTimeout(() => {
      exportStatus.value = ''
    }, 3000)
    return
  }

  // Create the list of all country names using ADMIN property
  const countriesList = '"countries": [\n' + allCountries.value
      .map(country => `      "${country.properties.ADMIN}"`)
      .sort()
      .join(',\n') + '\n    ]'

  // Create a blob and download link
  const blob = new Blob([countriesList], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'all_countries.txt'
  document.body.appendChild(a)
  a.click()

  // Clean up
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 100)

  exportStatus.value = 'All countries exported!'
  setTimeout(() => {
    exportStatus.value = ''
  }, 3000)
}

const handleClearSelection = () => {
  selectedCountries.value = []

  // Reset all map colors
  if (gameMap.value) {
    gameMap.value.resetMapColors()
  }
}

onMounted(loadCountries)
</script>