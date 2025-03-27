<template>
  <div class="map-container">
    <l-map
        ref="map"
        v-model:zoom="zoom"
        :center="center"
        :options="mapOptions"
        @ready="initializeMap"
    >
      <l-geo-json
          v-if="mapStore.countriesData.features.length"
          :geojson="mapStore.countriesData"
          :options="geoJsonOptions"
          @click="handleMapClick"
          @mouseover="handleMapHover"
          @mouseout="handleMapMouseOut"
          ref="geoJsonLayer"
      />
    </l-map>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { LGeoJson, LMap } from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'
import { useMapStore } from '@/stores/mapStore'

const props = defineProps({
  // Configurable props to allow maximum flexibility
  selectedLanguage: {
    type: String,
    default: 'ADMIN'
  },
  currentGameMode: {
    type: Object,
    default: null
  },
  mapConfig: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits([
  'country-click',
  'country-hover',
  'country-out',
  'map-ready'
])

// Core map configuration
const mapStore = useMapStore()
const zoom = ref(3)
const center = ref([20, 0])
const map = ref(null)
const geoJsonLayer = ref(null)

// Configurable map options with defaults
const mapOptions = computed(() => ({
  minZoom: props.mapConfig.minZoom || 2,
  maxZoom: props.mapConfig.maxZoom || 10,
  zoomControl: props.mapConfig.zoomControl || false,
  dragging: props.mapConfig.dragging || true,
  maxBounds: props.mapConfig.maxBounds || [
    [-70, -300],
    [180, 300]
  ]
}))

// Advanced country filtering and styling
const geoJsonOptions = computed(() => ({
  filter: (feature) => {
    // Optional game mode country filtering
    if (props.currentGameMode?.countries) {
      return props.currentGameMode.countries.includes(feature.properties.ADMIN)
    }
    return true
  },
  onEachFeature: (feature, layer) => {
    // Customize layer styling
    updateLayerStyle(feature, layer)
  }
}))

// Comprehensive layer styling method
const updateLayerStyle = (feature, layer, customStyles = {}) => {
  const defaultStyles = {
    fillColor: '#8c322a',
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
  }

  // Allow complete style override or partial customization
  const styles = {
    ...defaultStyles,
    ...customStyles
  }

  // Apply game mode filtering if needed
  if (props.currentGameMode) {
    const isIncluded = props.currentGameMode.countries.includes(feature.properties.ADMIN)
    styles.fillColor = isIncluded ? styles.fillColor : '#d3d3d3'
    styles.fillOpacity = isIncluded ? styles.fillOpacity : 0.3
    styles.weight = isIncluded ? styles.weight : 0.5
  }

  layer.setStyle(styles)
}

// Initialize map and expose core functionality
const initializeMap = (event) => {
  map.value = event.target
  emit('map-ready', {
    map: map.value,
    zoomToCountry,
    highlightCountry,
    resetMapColors,
    getCountryLayer
  })
}

// Advanced country finding methods
const getCountryLayer = (countryName, language = props.selectedLanguage) => {
  if (!geoJsonLayer.value?.leafletObject) return null

  const layers = geoJsonLayer.value.leafletObject.getLayers()
  return layers.find(layer =>
      layer.feature.properties[language] === countryName
  )
}

// Comprehensive zooming method
const zoomToCountry = (country, options = {}) => {
  if (!map.value) return

  const targetLayer = getCountryLayer(country)
  if (!targetLayer) return

  try {
    const bounds = targetLayer.getBounds()
    map.value.leafletObject.fitBounds(bounds, {
      padding: options.padding || [50, 50],
      maxZoom: options.maxZoom || 8,
      animate: options.animate ?? true,
      duration: options.duration || 1
    })
  } catch (error) {
    console.error('Zoom error:', error)
  }
}

// Enhanced country highlighting
const highlightCountry = (
    country,
    options = {
      color: '#42b983',
      timeout: 0,
      zoom: false,
      weight: 2
    }
) => {
  const targetLayer = getCountryLayer(country)
  if (!targetLayer) return

  targetLayer.setStyle({
    fillColor: options.color,
    weight: options.weight,
    fillOpacity: 0.7
  })

  if (options.zoom) zoomToCountry(country)

  if (options.timeout > 0) {
    setTimeout(() => {
      resetCountryColor(country)
    }, options.timeout)
  }
}

// Reset individual country color
const resetCountryColor = (country, customStyle = {}) => {
  const targetLayer = getCountryLayer(country)
  if (!targetLayer) return

  updateLayerStyle(targetLayer.feature, targetLayer, customStyle)
}

// Reset all map colors
const resetMapColors = (customStyles = {}) => {
  if (!geoJsonLayer.value?.leafletObject) return

  const layers = geoJsonLayer.value.leafletObject.getLayers()
  layers.forEach(layer => {
    updateLayerStyle(layer.feature, layer, customStyles)
  })
}

// Click handler with advanced callbacks
const handleMapClick = (e) => {
  const feature = e.layer.feature

  // Emit click event with detailed country information
  emit('country-click', {
    feature,
    layer: e.layer,
    callback: (isCorrect, customStyles) => {
      if (!isCorrect) {
        e.layer.setStyle({
          fillColor: '#ff4444',
          fillOpacity: 0.7,
          ...customStyles
        })

        // Automatic color reset
        setTimeout(() => {
          updateLayerStyle(feature, e.layer)
        }, 1000)
      }
    }
  })
}

// Hover handlers with advanced interaction
const handleMapHover = (e) => {
  const feature = e.layer.feature

  // Highlight on hover with optional styling
  e.layer.setStyle({ weight: 3 })

  emit('country-hover', {
    feature,
    layer: e.layer,
    highlight: (customStyles) => {
      e.layer.setStyle({
        weight: 3,
        ...customStyles
      })
    }
  })
}

const handleMapMouseOut = (e) => {
  const feature = e.layer.feature

  // Reset to default styling
  updateLayerStyle(feature, e.layer)

  emit('country-out', {
    feature,
    layer: e.layer
  })
}

// Expose methods for external use
defineExpose({
  zoomToCountry,
  highlightCountry,
  resetCountryColor,
  resetMapColors,
  getCountryLayer
})

// Watch for game mode changes
watch(() => props.currentGameMode, () => {
  resetMapColors()
}, { deep: true })

// Initial country loading
onMounted(() => {
  if (mapStore.countriesData.features.length) {
    resetMapColors()
  }
})
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