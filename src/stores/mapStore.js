import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMapStore = defineStore('map', () => {
    const countriesData = ref({ type: 'FeatureCollection', features: [] })
    const isLoading = ref(true)
    const error = ref(null)
    const isInitialized = ref(false)

    async function loadCountriesData() {
        if (isInitialized.value) return

        try {
            isLoading.value = true
            const response = await fetch('/ne_10m_admin_0_countries_lakes_no_antarktika.json')
            const data = await response.json()

            if (data.features) {
                console.log(data)

                countriesData.value = data
                isInitialized.value = true
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
        isInitialized,
        loadCountriesData
    }
})