<template>
  <div class="min-h-screen relative background-pattern select-none">
    <!-- Main Map Container -->
    <router-view :selectedLanguage="selectedLanguage" />

    <!-- Floating Controls -->
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
            {{ currentMode.charAt(0).toUpperCase() + currentMode.slice(1) }} Mode
          </span>
          <span class="block sm:hidden text-sunset-gray font-medium">
            Mode
          </span>
          <svg
              class="hidden sm:block h-4 w-4 text-sunset-200 transform transition-transform duration-200"
              :class="isGameModeOpen ? 'rotate-180' : ''"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
          >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <!-- Dropdown Menu -->
        <div
            v-show="isGameModeOpen"
            class="absolute right-0 w-48 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl py-1 border border-sunset-100/20 z-20"
        >
          <button
              v-for="mode in gameModes"
              :key="mode"
              @click.stop="selectGameMode(mode)"
              class="w-full text-left px-4 py-2 text-sunset-gray hover:bg-sunset-100/10 transition-colors"
              :class="currentMode === mode ? 'bg-sunset-100/20 text-sunset-400 font-medium' : ''"
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
          <svg
              class="hidden sm:block h-4 w-4 text-sunset-200 transform transition-transform duration-200"
              :class="isLanguageOpen ? 'rotate-180' : ''"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
          >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <!-- Dropdown Menu -->
        <div
            v-show="isLanguageOpen"
            class="absolute right-0 w-48 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl py-1 max-h-96 overflow-y-auto border border-sunset-100/20 z-20"
        >
          <button
              v-for="(label, code) in languages"
              :key="code"
              @click.stop="selectedLanguage = code; isLanguageOpen = false"
              class="w-full text-left px-4 py-2 text-sunset-gray hover:bg-sunset-100/10 transition-colors"
              :class="selectedLanguage === code ? 'bg-sunset-100/20 text-sunset-400 font-medium' : ''"
          >
            {{ label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CountryClickGame from './components/old/CountryClickGame.vue'
import CountryNameGame from './components/old/CountryNameGame.vue'
import TrainingMode from "./components/TrainingMode.vue"
import FindMode from "./components/FindMode.vue";
import router from "@/router/index.js";
import {useRoute} from "vue-router";

const route = useRoute()
const currentMode = computed(() => route.path.substring(1) || 'training')
const gameModes = ['training', 'find', 'name']
const selectedLanguage = ref('NAME_DE')
const isGameModeOpen = ref(false)
const isLanguageOpen = ref(false)

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

const selectGameMode = (mode) => {
  router.push(`/${mode}`)
  currentMode.value = mode;
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