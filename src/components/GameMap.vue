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
          v-if="mapStore.countriesData.features.length"
          :geojson="mapStore.countriesData"
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
import { computed, onMounted, ref, watch } from 'vue'
import { LGeoJson, LMap } from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useMapStore } from '@/stores/mapStore'

// Entfernt alte Icon-Quellen und setzt neue Standard-Icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
})

const props = defineProps(['selectedLanguage', 'currentGameMode'])
const emit = defineEmits(['country-click', 'country-hover'])

const mapStore = useMapStore()
const zoom = ref(3)
const center = ref([20, 0])
const map = ref(null)
const geoJsonLayer = ref(null)
const temporaryColoredFeature = ref(null)

const maxBounds = [
  [-70, -300], // Southwest coordinates
  [180, 300]   // Northeast coordinates
]

const mapOptions = {
  minZoom: 2,
  maxZoom: 10,
  zoomControl: false,
  attributionControl: false,
  dragging: true,
  maxBounds: maxBounds
}

const geoJsonOptions = computed(() => ({
  onEachFeature: (feature, layer) => {
    updateLayerStyle(feature, layer)
  }
}))

const updateLayerStyle = (feature, layer) => {
  let isIncluded;
  if (props.currentGameMode) {
    isIncluded = props.currentGameMode?.countries.includes(feature.properties.ADMIN)
  } else {
    isIncluded = true
  }

  layer.setStyle({
    fillColor: isIncluded ? '#8c322a' : '#d3d3d3',
    weight: isIncluded ? 1 : 0.5,
    opacity: 1,
    color: 'white',
    fillOpacity: isIncluded ? 0.7 : 0.3
  })
}

watch(() => props.currentGameMode, () => {
  if (!geoJsonLayer.value?.leafletObject) return

  console.log("Gamemode changed")

  const layers = geoJsonLayer.value.leafletObject.getLayers()
  layers.forEach(layer => {
    updateLayerStyle(layer.feature, layer)
  })
}, { deep: true })

const handleCountryClick = (e) => {
  const feature = e.layer.feature
  if (props.currentGameMode && !props.currentGameMode?.countries.includes(feature.properties.ADMIN)) return

  emit('country-click', {
    feature,
    layer: e.layer
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

const zoomToCountries = (countries) => {
  if (!map.value || !geoJsonLayer.value?.leafletObject) return

  const layers = geoJsonLayer.value.leafletObject.getLayers()
  const targetLayers = layers.filter(layer =>
      countries.includes(layer.feature.properties.ADMIN)
  )

  if (targetLayers.length === 0) return

  const bounds = targetLayers.reduce((acc, layer) => {
    return acc.extend(layer.getBounds())
  }, L.latLngBounds(targetLayers[0].getBounds().getNorthEast(), targetLayers[0].getBounds().getSouthWest()))

  map.value.leafletObject.fitBounds(bounds, {
    padding: [25, 25],
    maxZoom: 8,
    animate: true,
    duration: 1
  })
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
  const targetLayer = layers.find(layer =>
      layer.feature.properties[props.selectedLanguage] === country.name
  )

  if (targetLayer) {
    targetLayer.setStyle({
      fillColor: highlightColor,
      weight: 2,
      fillOpacity: 0.7
    })

    if (zoom) zoomToCountry(targetLayer)

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

const resetCountryColor = (country) => {
  if (!geoJsonLayer.value?.leafletObject) return

  const layers = geoJsonLayer.value.leafletObject.getLayers()
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

defineExpose({ highlightCountry, resetMapColors, resetCountryColor, zoomToCountries })
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