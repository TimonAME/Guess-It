<template>
  <div class="min-h-screen bg-gray-100 flex">
    <!-- Navigation Menu -->
    <div
        :class="[
        'bg-white shadow-lg transition-all duration-300 ease-in-out',
        isNavOpen ? 'w-64' : 'w-0'
      ]"
    >
      <div class="p-4" :class="isNavOpen ? 'block' : 'hidden'">
        <h2 class="text-lg font-semibold text-gray-700 mb-4">Game Modes</h2>
        <div class="space-y-2">
          <button
              v-for="mode in gameModes"
              :key="mode"
              @click="selectGameMode(mode)"
              class="w-full text-left px-4 py-2 rounded-md transition-colors"
              :class="currentMode === mode ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'"
          >
            {{ mode.charAt(0).toUpperCase() + mode.slice(1) }} Mode
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1">
      <div class="p-4">
        <button
            @click="isNavOpen = !isNavOpen"
            class="mb-4 p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
        >
          <svg
              class="h-6 w-6 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
          >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <component :is="currentGameComponent" />
        </div>
      </div>
    </div>
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
    const isNavOpen = ref(false)

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
      isNavOpen.value = false
    }

    return {
      currentMode,
      gameModes,
      currentGameComponent,
      selectGameMode,
      isNavOpen
    }
  }
}
</script>