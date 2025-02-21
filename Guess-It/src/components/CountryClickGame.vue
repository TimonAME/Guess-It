<template>
  <div class="game-container">
    <div class="game-info">
      <h2>Find: {{ targetCountry?.name }}</h2>
      <button @click="generateNewTarget">Skip</button>
      <div class="score">Score: {{ score }}</div>
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