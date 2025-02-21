<!-- components/CountryNameGame.vue -->
<template>
  <div class="game-container">
    <div class="game-info">
      <input
          v-model="userInput"
          @keyup.enter="checkAnswer"
          placeholder="Enter country name"
      >
      <button @click="checkAnswer">Submit</button>
    </div>
    <game-map :highlighted-country="selectedCountry" />
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import GameMap from './GameMap.vue'

export default {
  name: 'CountryNameGame',
  components: { GameMap },
  setup() {
    const store = useStore()
    const userInput = ref('')
    const selectedCountry = ref(null)

    const checkAnswer = () => {
      if (userInput.value.toLowerCase() === selectedCountry.value.toLowerCase()) {
        store.dispatch('handleCorrectAnswer')
        generateNewCountry()
      }
      userInput.value = ''
    }

    return {
      userInput,
      selectedCountry,
      checkAnswer
    }
  }
}
</script>