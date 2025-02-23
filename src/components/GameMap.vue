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
import {ref, computed, onMounted, watch, nextTick} from 'vue'
import {LMap, LGeoJson} from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const props = defineProps(['selectedLanguage'])
const emit = defineEmits(['country-click', 'country-hover'])

const zoom = ref(4)
const center = ref([20, 0])
const map = ref(null)
const geoJsonLayer = ref(null)
const countriesData = ref({type: 'FeatureCollection', features: []})
const temporaryColoredFeature = ref(null)

const maxBounds = [
  [-68, -182], // Southwest coordinates
  [88, 182]    // Northeast coordinates
]

const mapOptions = {
  minZoom: 2,
  maxZoom: 9,
  zoomControl: false,
  dragging: true,
  maxBounds: maxBounds,
}

const geoJsonOptions = computed(() => ({
  onEachFeature: (feature, layer) => {
    layer.setStyle({
      fillColor: '#8c322a',
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.7
    })
  }
}))

const loadCountriesData = async () => {
  try {
    const response = await fetch('/Guess-It/ne_10m_admin_0_countries_lakes_no_antarktika.json')
    const data = await response.json()
    countriesData.value = data
  } catch (error) {
    console.error('Error loading GeoJSON:', error)
  }
}

onMounted(loadCountriesData)

watch(() => props.selectedLanguage, loadCountriesData)

const handleCountryClick = (e) => {
  const feature = e.layer.feature
  emit('country-click', feature, (isCorrect) => {
    const color = isCorrect ? '#42b983' : '#ff4444'

    e.layer.setStyle({
      fillColor: color,
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
  })
}

const handleMouseOver = (e) => {
  if (e.layer.feature !== temporaryColoredFeature.value) {
    e.layer.setStyle({
      weight: 3
    })
  }
  emit('country-hover', e.layer.feature)
}

const handleMouseOut = (e) => {
  if (e.layer.feature !== temporaryColoredFeature.value) {
    e.layer.setStyle({
      weight: 1
    })
  }
}

const zoomToCountry = (layer) => {
  // TODO: fix - only is true after user zoomes once, before that it is false
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

const highlightCountry = (country, timeout = 0, highlightColor = '#42b983') => {
  if (!geoJsonLayer.value?.leafletObject) return

  const layers = geoJsonLayer.value.leafletObject.getLayers()

  // Find and highlight the target country
  const targetLayer = layers.find(layer =>
      layer.feature.properties[props.selectedLanguage] === country.name
  )

  if (targetLayer) {
    // Set the style
    targetLayer.setStyle({
      fillColor: highlightColor,  // Green color for found countries
      weight: 2,
      fillOpacity: 0.7
    })

    // Zoom to the country
    zoomToCountry(targetLayer);

    if (timeout > 0) {
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

defineExpose({highlightCountry})
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