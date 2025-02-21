<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
      <h2 class="text-2xl font-semibold text-gray-800">Find: {{ targetCountry?.name }}</h2>
      <div class="flex items-center space-x-4">
        <div class="text-lg font-medium text-gray-700">Score: {{ score }}</div>
        <button
            @click="generateNewTarget"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Skip
        </button>
      </div>
    </div>
    <game-map @country-click="handleCountryClick" />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import GameMap from './GameMap.vue'

export default {
  name: 'CountryClickGame',
  components: { GameMap },
  setup() {
    const store = useStore()
    const score = computed(() => store.state.score)
    const targetCountry = ref(null)
    const countries = ref([])

    const generateNewTarget = () => {
      if (countries.value.length > 0) {
        const randomIndex = Math.floor(Math.random() * countries.value.length)
        targetCountry.value = countries.value[randomIndex]
      }
    }

    const handleCountryClick = (feature, callback) => {
      const isCorrect = feature.properties.name === targetCountry.value.name;
      if (isCorrect) {
        store.dispatch('handleCorrectAnswer');
        generateNewTarget();
      }
      callback?.(isCorrect);
    };

    onMounted(async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
        const data = await response.json()
        countries.value = data.features.map(f => ({
          name: f.properties.name,
          id: f.id
        }))
        generateNewTarget()
      } catch (error) {
        console.error('Error loading countries:', error)
      }
    })

    return {
      score,
      targetCountry,
      handleCountryClick,
      generateNewTarget
    }
  }
}
</script>

<style scoped>
.game-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.game-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #f5f5f5;
  border-radius: 4px;
}
</style>