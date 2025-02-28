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
          ref="geoJsonLayer"
      />
    </l-map>
  </div>
</template>

<script setup>
import {computed, onMounted, ref, watch} from 'vue'
import {LGeoJson, LMap} from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps(['selectedLanguage', 'currentGameMode'])
const emit = defineEmits(['country-click', 'country-hover'])

const zoom = ref(3)
const center = ref([20, 0])
const map = ref(null)
const geoJsonLayer = ref(null)
const countriesData = ref({type: 'FeatureCollection', features: []})
const temporaryColoredFeature = ref(null)

const maxBounds = [
  [-70, -300], // Southwest coordinates
  [180, 300]    // Northeast coordinates
]

const mapOptions = {
  minZoom: 2,
  maxZoom: 10,
  zoomControl: false,
  dragging: true,
  maxBounds: maxBounds,
}

// In GameMap.vue, update the geoJsonOptions computed property
const geoJsonOptions = computed(() => ({
  onEachFeature: (feature, layer) => {
    updateLayerStyle(feature, layer)
  }
}))

// Add this new function to handle layer styling and events
const updateLayerStyle = (feature, layer) => {
  let isIncluded;
  if (props.currentGameMode) {
    isIncluded = props.currentGameMode?.countries.includes(feature.properties.ADMIN)
  } else {
    isIncluded = true
  }

  // Set style based on inclusion
  layer.setStyle({
    fillColor: isIncluded ? '#8c322a' : '#d3d3d3',
    weight: isIncluded ? 1 : 0.5,
    opacity: 1,
    color: 'white',
    fillOpacity: isIncluded ? 0.7 : 0.3
  })
/*
  // Remove existing event listeners
  layer.off('mouseover mouseout click')

  // Add event listeners only for included countries
  if (!isIncluded) {
    layer.on({
      mouseover: handleMouseOver,
      mouseout: handleMouseOut,
      click: handleCountryClick
    })
  }

 */
}

// Add a watcher for currentGameMode
watch(() => props.currentGameMode, () => {
  if (!geoJsonLayer.value?.leafletObject) return

  const layers = geoJsonLayer.value.leafletObject.getLayers()
  layers.forEach(layer => {
    updateLayerStyle(layer.feature, layer)
  })
}, { deep: true })

const loadCountriesData = async () => {
  try {
    const response = await fetch('/Guess-It/ne_10m_admin_0_countries_lakes_no_antarktika.json')
    countriesData.value = await response.json()
  } catch (error) {
    console.error('Error loading GeoJSON:', error)
  }
}

onMounted(loadCountriesData)

watch(() => props.selectedLanguage, loadCountriesData)

const handleCountryClick = (e) => {
  const feature = e.layer.feature
  if (props.currentGameMode && !props.currentGameMode?.countries.includes(feature.properties.ADMIN)) return

  emit('country-click', feature, (isCorrect) => {
    if (!isCorrect) {
      e.layer.setStyle({
        fillColor: '#ff4444',
        fillOpacity: 0.7
      })
      setTimeout(() => {
        if (temporaryColoredFeature.value !== feature) {
          e.layer.setStyle({
            fillColor: '#8c322a',
            fillOpacity: 0.7
          })
        }
      }, 1000)
    }
  })
}

const handleMouseOver = (e) => {
  const feature = e.layer.feature
  if (props.currentGameMode && !props.currentGameMode?.countries.includes(feature.properties.ADMIN)) return

  if (e.layer.feature !== temporaryColoredFeature.value) {
    e.layer.setStyle({
      weight: 3
    })
  }
  emit('country-hover', e.layer.feature)
}

const handleMouseOut = (e) => {
  const feature = e.layer.feature
  if (props.currentGameMode && !props.currentGameMode?.countries.includes(feature.properties.ADMIN)) return

  if (e.layer.feature !== temporaryColoredFeature.value) {
    e.layer.setStyle({
      weight: 1
    })
  }
}

const zoomToCountry = (layer) => {
  if (!map.value) return;

  try {
    const bounds = layer.getBounds();
    map.value.leafletObject.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 8,
      animate: true,
      duration: 1
    });
  } catch (error) {
    console.error('Error zooming to country:', error);
  }
}

const resetMapColors = () => {
  if (!geoJsonLayer.value?.leafletObject || !props.currentGameMode) return

  const layers = geoJsonLayer.value.leafletObject.getLayers()
  layers.forEach(layer => {
    const isIncluded = props.currentGameMode.countries.includes(layer.feature.properties.ADMIN)
    layer.setStyle({
      fillColor: isIncluded ? '#8c322a' : '#d3d3d3',
      weight: isIncluded ? 1 : 0.5,
      opacity: 1,
      color: 'white',
      fillOpacity: isIncluded ? 0.7 : 0.3
    })
  })
}

const highlightCountry = (country, timeout = 0, highlightColor = '#42b983', zoom = false) => {
  if (!geoJsonLayer.value?.leafletObject) return

  const layers = geoJsonLayer.value.leafletObject.getLayers()

  // Find and highlight the target country
  const targetLayer = layers.find(layer =>
      layer.feature.properties[props.selectedLanguage] === country.name
  )

  if (targetLayer) {
    // Set the style
    targetLayer.setStyle({
      fillColor: highlightColor,
      weight: 2,
      fillOpacity: 0.7
    })

    // Zoom to the country if specified
    if (zoom) zoomToCountry(targetLayer)

    // Only reset the color if a timeout is specified
    if (timeout > 0) {
      console.log("color reset")
      setTimeout(() => {
        targetLayer.setStyle({
          fillColor: '#8c322a',
          weight: 1,
          opacity: 1,
          color: 'white',
          fillOpacity: 0.7
        })
      }, timeout)
    }
  }
}

const resetCountryColor = (country) => {
  if (!geoJsonLayer.value?.leafletObject) return

  const layers = geoJsonLayer.value.leafletObject.getLayers()

  // Find the layer by country name using selectedLanguage property
  const targetLayer = layers.find(layer =>
      layer.feature.properties[props.selectedLanguage] === country.name
  )

  if (targetLayer) {
    targetLayer.setStyle({
      fillColor: '#8c322a',
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.7
    })
  }
}

defineExpose({ highlightCountry, resetMapColors, resetCountryColor })
</script>

<style scoped>
.map-container {
  height: 100vh;
  width: 100vw;
  position: relative;
  z-index: 1;
}

.leaflet-container {
  background-color: transparent !important;
}
</style>