<!-- components/BorderPathGame.vue -->
<template>
  <div class="game-container">
    <div class="game-info">
      <h2>Connect: {{ startCountry }} to {{ endCountry }}</h2>
    </div>
    <game-map
        @country-click="handleCountrySelect"
        :highlighted-path="selectedPath"
    />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import GameMap from './GameMap.vue'

export default {
  name: 'BorderPathGame',
  components: { GameMap },
  setup() {
    const store = useStore()
    const startCountry = ref(null)
    const endCountry = ref(null)
    const selectedPath = computed(() => store.state.selectedPath)

    const handleCountrySelect = (country) => {
      if (isValidSelection(country)) {
        store.commit('ADD_TO_PATH', country)
      }
    }

    const isValidSelection = (country) => {
      // Check if country borders the last selected country
      return true // Implement validation logic
    }

    return {
      startCountry,
      endCountry,
      selectedPath,
      handleCountrySelect
    }
  }
}
</script>