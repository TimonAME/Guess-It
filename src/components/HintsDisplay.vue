<template>
  <div v-if="hints" class="flex flex-wrap gap-3 text-sunset-gray items-center justify-center">
    <div class="bg-white/90 backdrop-blur-sm rounded-lg p-3 flex flex-col items-center shadow-lg border border-sunset-100/20">
      <span class="text-xs font-semibold mb-1 opacity-70">Population</span>
      <strong class="text-sm select-text">{{ formatNumber(hints.population) }}</strong>
    </div>

    <div class="bg-white/90 backdrop-blur-sm rounded-lg p-3 flex flex-col items-center shadow-lg border border-sunset-100/20">
      <span class="text-xs font-semibold mb-1 opacity-70">Capital</span>
      <strong class="text-sm select-text">{{ hints.capital }}</strong>
    </div>

    <div v-if="hints.flag" class="bg-white/90 backdrop-blur-sm rounded-lg px-3 flex flex-col items-center shadow-lg border border-sunset-100/20">
      <img
          :key="hints.flag"
          :src="hints.flag"
          @error="onFlagLoadError"
          alt="country flag"
          class="object-contain"
      >
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  hints: Object
})

const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num)
}

const onFlagLoadError = (event) => {
  if (props.hints) {
    props.hints.flag = null
  }
}
</script>