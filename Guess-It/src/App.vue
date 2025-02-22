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
        <div class="mt-4">
          <label for="language" class="block text-gray-700">Select Language:</label>
          <select id="language" v-model="selectedLanguage" class="w-full mt-1 p-2 border rounded-md">
            <option v-for="(label, code) in languages" :key="code" :value="code">{{ label }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1">
      <div class="p-4 flex flex-row gap-4">
        <button
            @click="isNavOpen = !isNavOpen"
            class="w-fit h-fit mb-4 p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
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

        <div class="bg-white rounded-lg shadow-sm p-6 flex-1">
          <component :is="currentGameComponent" :selectedLanguage="selectedLanguage" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CountryClickGame from './components/CountryClickGame.vue'
import CountryNameGame from './components/CountryNameGame.vue'
import TrainingMode from "./components/TrainingMode.vue";

const currentMode = ref('training')
const gameModes = ['training', 'click', 'name']
const isNavOpen = ref(false)
const selectedLanguage = ref('NAME_DE')

const languages = {
  NAME_AR: 'Arabic',
  NAME_BN: 'Bengali',
  NAME_DE: 'German',
  NAME_EN: 'English',
  NAME_ES: 'Spanish',
  NAME_FA: 'Persian',
  NAME_FR: 'French',
  NAME_EL: 'Greek',
  NAME_HE: 'Hebrew',
  NAME_HI: 'Hindi',
  NAME_HU: 'Hungarian',
  NAME_ID: 'Indonesian',
  NAME_IT: 'Italian',
  NAME_JA: 'Japanese',
  NAME_KO: 'Korean',
  NAME_NL: 'Dutch',
  NAME_PL: 'Polish',
  NAME_PT: 'Portuguese',
  NAME_RU: 'Russian',
  NAME_SV: 'Swedish',
  NAME_TR: 'Turkish',
  NAME_UK: 'Ukrainian',
  NAME_UR: 'Urdu',
  NAME_VI: 'Vietnamese',
  NAME_ZH: 'Chinese (Simplified)',
  NAME_ZHT: 'Chinese (Traditional)'
}

const currentGameComponent = computed(() => {
  switch (currentMode.value) {
    case 'training': return TrainingMode
    case 'click': return CountryClickGame
    case 'name': return CountryNameGame
    default: return CountryClickGame
  }
})

const selectGameMode = (mode) => {
  currentMode.value = mode
  isNavOpen.value = false
}
</script>