import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMapStore = defineStore('map', () => {
    const countriesData = ref({ type: 'FeatureCollection', features: [] })
    const isLoading = ref(true)
    const error = ref(null)

    async function loadCountriesData() {
        if (countriesData.value.features.length) return

        try {
            isLoading.value = true
            const response = await fetch('/ne_10m_admin_0_countries_lakes_no_antarktika_compressed.geojson')
            const data = await response.json()

            if (data && data.features) {
                countriesData.value = data
                console.log("Country Data Loaded")
            }
        } catch (err) {
            error.value = err
            console.error('Error loading GeoJSON:', err)
        } finally {
            isLoading.value = false
        }
    }

    return {
        countriesData,
        isLoading,
        error,
        loadCountriesData
    }
})