<template>
  <div class="fixed top-4 left-4 h-fit z-10">
    <div
        class="relative"
        @mouseenter="isOpen = true"
        @mouseleave="isOpen = false"
        @click="isOpen = !isOpen"
    >
      <button
          class="h-full bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg flex items-center gap-2 hover:bg-white/95 transition-all duration-200 border border-sunset-100/20"
      >
        <span class="text-sunset-gray font-medium">{{ currentZone?.name || 'Select Mode' }}</span>
        <svg
            class="hidden sm:block h-4 w-4 text-sunset-200 transform transition-transform duration-200"
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

      <div
          v-show="isOpen"
          class="absolute top-full left-0 w-64 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl max-h-96 overflow-y-auto border border-sunset-100/20"
      >
        <div class="py-2 space-y-1">
          <div v-for="(zone, key) in zones"
               :key="key"
               @click.stop="selectZone(key)"
               class="w-full text-left px-4 py-2 text-sunset-gray hover:bg-sunset-100/10 transition-colors"
               :class="currentZone?.name === zone.name ? 'bg-sunset-100/20 text-sunset-400 font-medium' : ''"
          >
            <div class="font-medium">{{ zone.name }}</div>
            <div class="text-sm opacity-80">{{ zone.description }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  zones: {
    type: Object,
    required: true
  },
  currentZone: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['select'])
const isOpen = ref(false)

const selectZone = (zoneKey) => {
  isOpen.value = false
  emit('select', zoneKey)
}
</script>