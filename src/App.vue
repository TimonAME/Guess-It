<template>
  <div class="min-h-screen relative background-pattern select-none">
    <!-- Dynamische Komponente basierend auf dem aktuellen Modus -->
    <component
        :is="componentMap[gameStore.currentMode]"
        :selectedLanguage="gameStore.selectedLanguage"
    />

    <!-- Restlicher Code bleibt gleich -->
    <div class="fixed top-4 h-fit right-4 flex sm:flex-row flex-col items-end sm:items-center gap-2 select-none z-10">
      <!-- Game Mode Selector -->
      <div
          class="relative"
          @mouseenter="isGameModeOpen = true"
          @mouseleave="isGameModeOpen = false"
          @click="isGameModeOpen = !isGameModeOpen"
      >
        <button
            class="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg flex items-center gap-2 hover:bg-white/95 transition-all duration-200 border border-sunset-100/20"
        >
          <span class="hidden sm:block text-sunset-gray font-medium">
            {{ gameStore.currentMode.charAt(0).toUpperCase() + gameStore.currentMode.slice(1) }} Mode
          </span>
          <!-- Restlicher Button-Code -->
        </button>

        <!-- Dropdown Menu -->
        <div
            v-show="isGameModeOpen"
            class="absolute right-0 w-48 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl py-1 border border-sunset-100/20 z-20"
        >
          <button
              v-for="mode in Object.keys(gameStore.gameModes)"
              :key="mode"
              @click.stop="selectGameMode(mode)"
              class="w-full text-left px-4 py-2 text-sunset-gray hover:bg-sunset-100/10 transition-colors"
              :class="gameStore.currentMode === mode ? 'bg-sunset-100/20 text-sunset-400 font-medium' : ''"
          >
            {{ mode.charAt(0).toUpperCase() + mode.slice(1) }} Mode
          </button>
        </div>
      </div>

      <!-- Language Selector -->
      <div
          class="relative"
          @mouseenter="isLanguageOpen = true"
          @mouseleave="isLanguageOpen = false"
          @click="isLanguageOpen = !isLanguageOpen"
      >
        <button
            class="h-full bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg flex items-center gap-2 hover:bg-white/95 transition-all duration-200 border border-sunset-100/20"
        >
          <svg
              class="h-5 w-5 text-sunset-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
          >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
            />
          </svg>
          <span class="hidden sm:block">
          {{ gameStore.getLanguageLabel(gameStore.selectedLanguage) }}
        </span>
        </button>

        <!-- Dropdown Menu -->
        <div
            v-show="isLanguageOpen"
            class="absolute right-0 w-48 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl py-1 max-h-96 overflow-y-auto border border-sunset-100/20 z-20"
        >
          <button
              v-for="(label, code) in gameStore.languages"
              :key="code"
              @click.stop="gameStore.setSelectedLanguage(code); isLanguageOpen = false"
              class="w-full text-left px-4 py-2 text-sunset-gray hover:bg-sunset-100/10 transition-colors"
              :class="gameStore.selectedLanguage === code ? 'bg-sunset-100/20 text-sunset-400 font-medium' : ''"
          >
            {{ label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue'
import { useGameStore } from '@/stores/gameStore'
import FindMode from './components/FindMode.vue'
import NameMode from './components/NameMode.vue'
import TrainingMode from './components/TrainingMode.vue'
import TravelMode from './components/TravelMode.vue'
import ExportMode from './components/ExportMode.vue'
import { useMapStore } from '@/stores/mapStore'

const mapStore = useMapStore()
const gameStore = useGameStore()
const isGameModeOpen = ref(false)
const isLanguageOpen = ref(false)

const componentMap = {
  find: FindMode,
  name: NameMode,
  training: TrainingMode,
  travel: TravelMode,
  export: ExportMode
}

const selectGameMode = (mode) => {
  gameStore.setCurrentMode(mode)
  isGameModeOpen.value = false
}
</script>

<style>
.background-pattern {
  background-color: #f4f4f4;
  background-image: linear-gradient(to right, rgba(184, 184, 184, 0.1) 1px, transparent 1px),
  linear-gradient(to bottom, rgba(184, 184, 184, 0.1) 1px, transparent 1px);
  background-size: 40px 40px;
  background-position: 0 0;
  margin: 0;
}

/* Custom scrollbar for dropdowns */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(242, 146, 29, 0.3);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgba(242, 146, 29, 0.5);
}
</style>