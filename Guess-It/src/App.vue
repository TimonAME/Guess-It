<!-- App.vue -->
<template>
  <div id="app">
    <nav class="game-nav">
      <button
          v-for="mode in gameModes"
          :key="mode"
          @click="selectGameMode(mode)"
      >
        {{ mode }}
      </button>
    </nav>

    <component :is="currentGameComponent" />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import CountryClickGame from './components/CountryClickGame.vue'
import CountryNameGame from './components/CountryNameGame.vue'
import BorderPathGame from './components/BorderPathGame.vue'

export default {
  name: 'App',
  components: {
    CountryClickGame,
    CountryNameGame,
    BorderPathGame
  },
  setup() {
    const currentMode = ref('click')
    const gameModes = ['click', 'name', 'path']

    const currentGameComponent = computed(() => {
      switch (currentMode.value) {
        case 'click': return 'CountryClickGame'
        case 'name': return 'CountryNameGame'
        case 'path': return 'BorderPathGame'
        default: return 'CountryClickGame'
      }
    })

    const selectGameMode = (mode) => {
      currentMode.value = mode
    }

    return {
      currentMode,
      gameModes,
      currentGameComponent,
      selectGameMode
    }
  }
}
</script>



<!--
<template>
  <div id="app">
    <WorldMap_flat />
  </div>
</template>

<script>
import WorldMap from './components/WorldMap.vue';
import WorldMap_V2 from './components/WorldMap_V2.vue';
import WorldMap_Three from "./components/WorldMap_Three.vue";
import WorldMap_flat from "./components/WorldMap_flat.vue";

export default {
  name: 'App',
  components: {
    WorldMap_flat
  }
}
</script>

<style>

</style>
-->