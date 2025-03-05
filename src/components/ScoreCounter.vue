<template>
  <div class="score-container text-sunset-gray">
    <span
        :class="{ 'score-increment': shouldAnimateText }"
        class="score-display"
    >
      {{ displayValue }}/{{total}}
    </span>
    <div
        v-if="shouldAnimateParticle"
        class="score-particles"
        :key="props.value"
    >
      <div
          v-for="n in 5"
          :key="n"
          class="particle"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  value: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  }
});

const displayValue = ref(props.value);
const shouldAnimateText = ref(false);
const shouldAnimateParticle = ref(false);

watch(() => props.value, (newValue, oldValue) => {
  if (newValue > oldValue) {
    shouldAnimateText.value = true;
    shouldAnimateParticle.value = true;
    setTimeout(() => {
      shouldAnimateText.value = false;
    }, 300);
    setTimeout(() => {
      shouldAnimateParticle.value = false;
    }, 600);
  }
  displayValue.value = newValue;
});
</script>

<style scoped>
.score-container {
  position: relative;
  display: inline-block;
}

.score-display {
  display: inline-block;
  transition: color 0.3s ease;
}

.score-increment {
  animation: scoreUp 0.3s ease-out;
  color: #42b983;
}

.score-particles {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 8px;
  height: 8px;
  background-color: #42b983;
  border-radius: 50%;
  opacity: 0;
}

.particle:nth-child(1) {
  animation: particle-burst-1 0.6s ease-out;
}

.particle:nth-child(2) {
  animation: particle-burst-2 0.5s ease-out 0.1s;
}

.particle:nth-child(3) {
  animation: particle-burst-3 0.6s ease-out 0.125s;
}

.particle:nth-child(4) {
  animation: particle-burst-4 0.5s ease-out 0.15s;
}

.particle:nth-child(5) {
  animation: particle-burst-5 0.6s ease-out 0.175s;
}

@keyframes scoreUp {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes particle-burst-1 {
  0% {
    opacity: 0;
    transform: translate(0, 0) scale(0);
  }
  50% {
    opacity: 1;
    transform: translate(-20px, -20px) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-40px, -40px) scale(2);
  }
}

@keyframes particle-burst-2 {
  0% {
    opacity: 0;
    transform: translate(0, 0) scale(0);
  }
  50% {
    opacity: 1;
    transform: translate(20px, -20px) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(40px, -40px) scale(2);
  }
}

@keyframes particle-burst-3 {
  0% {
    opacity: 0;
    transform: translate(0, 0) scale(0);
  }
  50% {
    opacity: 1;
    transform: translate(-20px, 20px) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-40px, 40px) scale(2);
  }
}

@keyframes particle-burst-4 {
  0% {
    opacity: 0;
    transform: translate(0, 0) scale(0);
  }
  50% {
    opacity: 1;
    transform: translate(20px, 20px) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(40px, 40px) scale(2);
  }
}

@keyframes particle-burst-5 {
  0% {
    opacity: 0;
    transform: translate(0, 0) scale(0);
  }
  50% {
    opacity: 1;
    transform: translate(0, -20px) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(0, -40px) scale(2);
  }
}
</style>