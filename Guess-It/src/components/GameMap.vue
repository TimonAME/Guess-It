<template>
  <div class="map-container">
    <l-map
        ref="map"
        v-model:zoom="zoom"
        :center="center"
        :options="mapOptions"
        @ready="map = $event.target"
    >
      <l-geo-json
          v-if="countriesData.features.length"
          :geojson="countriesData"
          :options="geoJsonOptions"
          @click="handleCountryClick"
          @mouseover="handleMouseOver"
          @mouseout="handleMouseOut"
      />
    </l-map>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { LMap, LGeoJson } from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps(['selectedLanguage'])
const emit = defineEmits(['country-click'])

const zoom = ref(2)
const center = ref([20, 0])
const map = ref(null)
const countriesData = ref({ type: 'FeatureCollection', features: [] })
const hoveredFeature = ref(null)
const temporaryColoredFeature = ref(null)
const temporaryColor = ref(null)

const mapOptions = {
  minZoom: 2,
  maxZoom: 8,
  zoomControl: true,
  dragging: true
}

const geoJsonOptions = computed(() => ({
  onEachFeature: (feature, layer) => {
    layer.setStyle({
      fillColor: '#3388ff',
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.7
    })
  }
}))

const setTemporaryColor = (feature, color, duration) => {
  temporaryColoredFeature.value = feature
  temporaryColor.value = color

  setTimeout(() => {
    temporaryColoredFeature.value = null
    temporaryColor.value = null
  }, duration)
}

const loadCountriesData = async () => {
  try {
    const response = await fetch('/ne_10m_admin_0_countries.json')
    const data = await response.json()
    countriesData.value = data
  } catch (error) {
    console.error('Error loading GeoJSON:', error)
  }
}

onMounted(loadCountriesData)
watch(() => props.selectedLanguage, loadCountriesData)

const handleCountryClick = (e) => {
  console.log('Country clicked:', e.layer.feature.properties[props.selectedLanguage])
  const feature = e.layer.feature
  emit('country-click', feature, (isCorrect) => {
    const color = isCorrect ? '#42b983' : '#ff4444'
    console.log('Guess was:', isCorrect)

    e.layer.setStyle({
      fillColor: color,
      fillOpacity: 0.7
    })
    setTimeout(() => {
      if (temporaryColoredFeature.value !== feature) {
        e.layer.setStyle({
          fillColor: '#3388ff',
          fillOpacity: 0.7
        })
      }
    }, 1000)
  })
}

const handleMouseOver = (e) => {
  if (e.layer.feature !== temporaryColoredFeature.value) {
    e.layer.setStyle({
      weight: 3
    })
  }
}

const handleMouseOut = (e) => {
  if (e.layer.feature !== temporaryColoredFeature.value) {
    e.layer.setStyle({
      weight: 1
    })
  }
}

const highlightCountry = (targetCountry) => {
  console.log('Highlighting:', targetCountry.value.name)

  // TODO: Highlight the target country
}


defineExpose({ highlightCountry })
</script>

<style scoped>
.map-container {
  height: 700px;
  width: 100%;
  position: relative;
}

:deep(.l-map) {
  height: 100%;
  width: 100%;
  z-index: 1;
}
</style>