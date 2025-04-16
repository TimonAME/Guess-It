<template>
  <div class="min-h-screen select-none">
    <!-- Improved Hero Section -->
    <div class="relative overflow-hidden">
      <div class="relative h-[75vh] mt-16 flex items-center justify-center">
        <!-- Background Map -->
        <div class="absolute">
          <WorldSVG class="" />
        </div>

        <!-- Improved Title with Better Visibility -->
        <div class="relative z-10 text-center pointer-events-none">
          <!-- Enhanced text visibility with text shadow and backdrop -->
          <div class="inline-block p-6">
            <h1 class="text-8xl md:text-9xl lg:text-[12rem] xl:text-[16rem] font-bold text-sunset-gray tracking-tight drop-shadow-2xl">
              Guess-It
            </h1>
            <p class="text-xl md:text-2xl text-sunset-gray mt-4 max-w-2xl mx-auto font-bold drop-shadow-2xl">
              Test your knowledge of world geography with our interactive globe-trotting challenge
            </p>
            <div class="mt-8 flex justify-center">
              <button @click="scrollToModes" class="pointer-events-auto bg-sunset-400 hover:bg-sunset-500 text-white px-8 py-3 rounded-lg flex items-center transition-all transform hover:scale-105 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                </svg>
                Start Playing
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- About Section -->
      <div id="about" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 class="text-5xl font-bold text-sunset-gray mb-6 text-center">
          Explore the World with Guess-It
        </h2>
        <div class="flex flex-col items-center justify-center text-center">
          <p class="text-2xl text-sunset-gray/70 max-w-2xl mx-auto mb-2 leading-relaxed">
            Discover new lands, test your geography skills, and have fun!
          </p>
          <div class="flex justify-center mb-8">
            <span class="text-xl text-sunset-gray/70 ml-4">Created by <a href="https://timoname.github.io/" target="_blank" class="text-sunset-400 hover:text-sunset-500 transition-colors">Timon Amesmann</a></span>
          </div>
        </div>
      </div>


      <!-- Game Mode Section -->
      <div id="modes" class="mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-8 bg-sunset-100/10">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-3xl font-semibold text-sunset-gray mb-6 text-center">
            Gamemodes and Savegames
          </h2>
          <div class="flex justify-center flex-wrap gap-6 max-w-5xl mx-auto">
            <div v-for="mode in gameStore.modes" :key="mode.id"
                 class="min-w-98 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-sunset-100/20 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
              <div class="p-6 border-b border-sunset-100/20">
                <div class="flex items-start mb-4">
                  <div class="rounded-lg p-2 bg-sunset-100/20 text-sunset-400 mr-4 transition-colors group-hover:bg-sunset-100/40">
                    <svg v-if="mode.id === 'find'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <svg v-else-if="mode.id === 'name'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    <svg v-else-if="mode.id === 'training'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-xl font-semibold text-sunset-gray mb-2">{{ mode.displayName }}</h3>
                    <p class="text-sunset-gray/70">{{ mode.description }}</p>
                  </div>
                </div>
              </div>

              <!-- Save Game Section -->
              <div v-if="hasSaveGame(mode.id)" class="px-6 py-5 border-b border-sunset-100/20 bg-sunset-100/5">
                <div class="flex justify-between items-center mb-2">
                  <h4 class="font-medium text-sunset-gray">Saved Progress</h4>
                  <button @click.stop="confirmDeleteSave(mode.id)"
                          class="text-red-500 hover:text-red-700 transition-colors p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div class="text-sunset-gray/70 text-sm mb-2">
                  Progress: {{ savedGames[mode.id].gameStats.foundCountries }}/{{ savedGames[mode.id].gameStats.totalCountries }}
                </div>
                <div class="w-full bg-sunset-100/10 rounded-full h-2 mb-4">
                  <div class="bg-sunset-400 h-2 rounded-full"
                       :style="`width: ${(savedGames[mode.id].gameStats.foundCountries / savedGames[mode.id].gameStats.totalCountries) * 100}%`"></div>
                </div>
                <button @click.stop="loadGame(mode.id, savedGames[mode.id])"
                        class="w-full bg-sunset-100/20 text-sunset-400 rounded-lg py-2 hover:bg-sunset-100/30 transition-colors mb-1">
                  Continue Game
                </button>
              </div>

              <!-- Start New Game Button -->
              <div v-else>
                <div class="p-6">
                  <button @click="startGame(mode.id)"
                          class="w-full bg-white/50 text-sunset-gray border border-sunset-100/30 rounded-lg py-2 hover:bg-white/80 transition-colors flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                    </svg>
                    Start New Game
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      <!-- Features Section -->
      <div id="features" class="max-w-5xl mx-auto mt-8 mb-16">
        <h2 class="text-3xl font-semibold text-sunset-gray mb-10 text-center">
          Features
        </h2>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="text-center group">
            <div class="flex justify-center mb-4">
              <div class="rounded-full p-3 bg-sunset-100/20 inline-block group-hover:bg-sunset-100/40 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-sunset-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                </svg>
              </div>
            </div>
            <h3 class="text-lg font-medium text-sunset-gray mb-2">Worldwide Coverage</h3>
            <p class="text-sunset-gray/70">Learn about countries and regions from all continents with detailed maps and information</p>
          </div>
          <div class="text-center group">
            <div class="flex justify-center mb-4">
              <div class="rounded-full p-3 bg-sunset-100/20 inline-block group-hover:bg-sunset-100/40 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-sunset-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
            </div>
            <h3 class="text-lg font-medium text-sunset-gray mb-2">Multiple Languages</h3>
            <p class="text-sunset-gray/70">Practice geography in 26 different languages to enhance your global literacy</p>
          </div>
          <div class="text-center group">
            <div class="flex justify-center mb-4">
              <div class="rounded-full p-3 bg-sunset-100/20 inline-block group-hover:bg-sunset-100/40 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-sunset-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <h3 class="text-lg font-medium text-sunset-gray mb-2">Track Progress</h3>
            <p class="text-sunset-gray/70">Follow your improvement with detailed statistics and save your progress across sessions</p>
          </div>
        </div>
      </div>
    </div>

        <!-- Footer -->
    <footer class="py-8 bg-white/50 backdrop-blur-sm border-t border-sunset-100/20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="mb-4 md:mb-0">
            <div class="flex items-center mb-2">
              <div class="rounded-lg p-2 bg-sunset-100/20 text-sunset-400 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-sunset-gray">Guess-It</h2>
            </div>
            <!--<p class="text-sunset-gray/70">© 2025 Guess-It. All rights reserved.</p>-->
          </div>
          <a href="https://timoname.github.io/" target="_blank" class="text-sunset-400 hover:text-sunset-500 transition-colors">Timon Amesmann</a>
        </div>
      </div>
    </footer>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="showDeleteModal = false"></div>
      <div class="bg-white/90 backdrop-blur-sm rounded-lg p-6 max-w-md w-full mx-4 relative z-10 border border-sunset-100/20 shadow-xl">
        <h3 class="text-xl font-semibold text-sunset-gray mb-4">Confirm Delete</h3>
        <p class="text-sunset-gray/70 mb-6">Are you sure you want to delete this saved game? This action cannot be undone.</p>
        <div class="flex justify-end space-x-4">
          <button @click="showDeleteModal = false"
                  class="px-4 py-2 bg-white/80 hover:bg-white/90 text-sunset-gray rounded-lg transition-colors border border-sunset-100/20">
            Cancel
          </button>
          <button @click="deleteSaveGame(modeToDelete)"
                  class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>

    <div v-if="showGameModesModal" class="fixed inset-0 flex items-center justify-center z-40">
      <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="showGameModesModal = false"></div>
      <div class="bg-white/90 backdrop-blur-sm rounded-lg p-8 max-w-4xl w-full mx-4 relative z-10 border border-sunset-100/20 shadow-xl">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-semibold text-sunset-gray">Choose Your Game Mode</h2>
          <button @click="showGameModesModal = false" class="text-sunset-400 hover:text-sunset-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <div v-for="mode in gameStore.modes" :key="mode.id"
               class="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-sunset-100/20 hover:shadow-xl transition-all duration-200">
            <div class="p-6 border-b border-sunset-100/20">
              <div class="flex items-start mb-4">
                <div class="rounded-lg p-2 bg-sunset-100/20 text-sunset-400 mr-4">
                  <svg v-if="mode.id === 'find'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <svg v-else-if="mode.id === 'name'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  <svg v-else-if="mode.id === 'training'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-semibold text-sunset-gray mb-2">{{ mode.displayName }}</h3>
                  <p class="text-sunset-gray/70">{{ mode.description }}</p>
                </div>
              </div>
            </div>

            <!-- Save Game Section -->
            <div v-if="hasSaveGame(mode.id)" class="px-6 py-5 border-b border-sunset-100/20 bg-sunset-100/5">
              <div class="flex justify-between items-center mb-2">
                <h4 class="font-medium text-sunset-gray">Saved Progress</h4>
                <button @click.stop="confirmDeleteSave(mode.id)"
                        class="text-red-500 hover:text-red-700 transition-colors p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
              <div class="text-sunset-gray/70 text-sm mb-2">
                Progress: {{ savedGames[mode.id].gameStats.foundCountries }}/{{ savedGames[mode.id].gameStats.totalCountries }}
              </div>
              <div class="w-full bg-sunset-100/10 rounded-full h-2 mb-4">
                <div class="bg-sunset-400 h-2 rounded-full"
                     :style="`width: ${(savedGames[mode.id].gameStats.foundCountries / savedGames[mode.id].gameStats.totalCountries) * 100}%`"></div>
              </div>
              <button @click.stop="loadGame(mode.id, savedGames[mode.id]); showGameModesModal = false"
                      class="w-full bg-sunset-100/20 text-sunset-400 rounded-lg py-2 hover:bg-sunset-100/30 transition-colors mb-1">
                Continue Game
              </button>
            </div>

            <!-- Start New Game Button -->
            <div v-else class="p-6">
              <button @click="startGame(mode.id); showGameModesModal = false"
                      class="w-full bg-sunset-400 text-white rounded-lg py-2 hover:bg-sunset-500 transition-colors flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                </svg>
                Start New Game
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useZoneProgressStore } from '@/stores/zoneProgressStore'
import WorldSVG from "@/components/WorldSVG.vue";

const gameStore = useGameStore()
const zoneProgressStore = useZoneProgressStore()

const savedGames = computed(() => zoneProgressStore.progress)
const showDeleteModal = ref(false)
const modeToDelete = ref(null)
const showGameModesModal = ref(false)

const hasSaveGame = (modeId) => {
  return savedGames.value[modeId] &&
      savedGames.value[modeId].lastZone !== null &&
      savedGames.value[modeId].gameStats !== null
}

const confirmDeleteSave = (mode) => {
  modeToDelete.value = mode
  showDeleteModal.value = true
}

const startGame = (modeId) => {
  gameStore.setCurrentMode(modeId)
  emit('close-landing')
}

const loadGame = (mode, progress) => {
  gameStore.setCurrentMode(mode)
  localStorage.setItem('lastGameMode', mode)
  emit('close-landing')
}

const deleteSaveGame = (mode) => {
  zoneProgressStore.resetProgress(mode)
  showDeleteModal.value = false
}

const scrollToModes = () => {
  showGameModesModal.value = true
}

// Add emit for closing landing page
const emit = defineEmits(['close-landing'])
</script>

<style scoped>
/* Add any additional CSS here */
@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
  100% {
    transform: translateY(0px);
  }
}

h1 {
  text-shadow: 2px 4px 8px rgba(0, 0, 0, 0.1);
}
</style>