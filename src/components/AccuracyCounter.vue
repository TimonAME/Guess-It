<template>
  <span
      :class="accuracyClass"
      class="accuracy-display inline-block text-sunset-gray"
  >
    Accuracy: {{ displayValue }}%
  </span>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  value: {
    type: Number,
    required: true
  }
});

const displayValue = ref(props.value);
const accuracyTrend = ref('');

const accuracyClass = computed(() => {
  return {
    'increase': accuracyTrend.value === 'increase',
    'decrease': accuracyTrend.value === 'decrease'
  };
});

watch(() => props.value, (newValue, oldValue) => {
  displayValue.value = newValue;

  if (newValue > oldValue) {
    accuracyTrend.value = 'increase';
  } else if (newValue < oldValue) {
    accuracyTrend.value = 'decrease';
  } else {
    accuracyTrend.value = '';
  }

  setTimeout(() => {
    accuracyTrend.value = '';
  }, 300);
});
</script>

<style scoped>
.accuracy-display {
  transition: color 0.3s ease;
}

.accuracy-display.increase {
  color: #42b983;
}

.accuracy-display.decrease {
  color: #ff6b6b;
}
</style>