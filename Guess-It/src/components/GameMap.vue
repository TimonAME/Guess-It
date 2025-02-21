<template>
  <div class="map-container">
    <l-map
        ref="map"
        v-model:zoom="zoom"
        :center="center"
        :options="mapOptions"
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

<script>
import { ref, computed, onMounted } from 'vue'
import { LMap, LGeoJson } from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default {
  name: 'GameMap',
  components: {
    LMap,
    LGeoJson
  },
  setup(props, { emit }) {
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
      /*
      style: (feature) => ({
        fillColor: getFeatureColor(feature),
        weight: feature === hoveredFeature.value ? 5 : 2,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
      }),
      */
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

    const getFeatureColor = (feature) => {
      if (feature === temporaryColoredFeature.value) return temporaryColor.value
      if (feature === hoveredFeature.value) return '#ff8c00'
      return '#3388ff'
    }

    const setTemporaryColor = (feature, color, duration) => {
      temporaryColoredFeature.value = feature
      temporaryColor.value = color

      setTimeout(() => {
        temporaryColoredFeature.value = null
        temporaryColor.value = null
      }, duration)
    }

    onMounted(async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
        countriesData.value = await response.json()
      } catch (error) {
        console.error('Error loading GeoJSON:', error)
      }
    })

    const handleCountryClick = (e) => {
      console.log('Country clicked:', e.layer.feature.properties.name)
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
      /*
      if (e.layer.feature !== temporaryColoredFeature.value) {
        e.layer.setStyle({
          fillColor: '#ff8c00',
          fillOpacity: 0.7,
          weight: 2
        })
      }

       */
    }

    const handleMouseOut = (e) => {
      /*
      if (e.layer.feature !== temporaryColoredFeature.value) {
        e.layer.setStyle({
          fillColor: '#3388ff',
          fillOpacity: 0.7,
          weight: 1
        })
      }

       */
    }

    return {
      zoom,
      center,
      map,
      mapOptions,
      geoJsonOptions,
      handleCountryClick,
      handleMouseOver,
      handleMouseOut,
      countriesData
    }
  }
}
</script>

<style scoped>
.map-container {
  height: 800px;
  width: 100%;
  position: relative;
}

:deep(.l-map) {
  height: 100%;
  width: 100%;
  z-index: 1;
}
</style>