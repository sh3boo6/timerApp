<template>
  <div class="min-h-screen flex items-center justify-center rounded-4xl overflow-hidden"
    :style="{ transform: `scale(${windowSize})` }" style="-webkit-app-region: drag;">
    <div class="relative min-w-64 min-h-64 flex group overflow-hidden">
      <!-- Progress Circle (Background & Foreground) -->
      <svg class="absolute inset-0 w-full h-full rotate-[-90deg] z-0" viewBox="0 0 100 100">
        <!-- Background static circle (gray) -->
        <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" stroke-width="2" />
        <!-- Foreground animated circle (green) -->
        <circle cx="50" cy="50" r="45" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round"
          :stroke-dasharray="circumference" :stroke-dashoffset="dashOffset"
          style="transition: stroke-dashoffset 1s linear;" />
      </svg>
      <button @click="closeSwiperWindow"
        class="absolute top-2 start-2 z-50 flex items-center justify-center w-6 h-6 rounded-full border border-white/10 bg-black/10 hover:bg-red-500/40 cursor-pointer"
        style="-webkit-app-region: no-drag;">
        <XMarkIcon class="w-5 h-5 text-white/30" />
      </button>
      <button @click="menuSize = !menuSize"
        class="absolute top-2 end-2 z-50 flex items-center justify-center w-6 h-6 rounded-full border border-white/10 bg-black/10 hover:bg-emerald-500/40 cursor-pointer"
        style="-webkit-app-region: no-drag;">
        <EllipsisHorizontalCircleIcon class="w-5 h-5 text-white/30" />
      </button>
      <div v-if="menuSize"
        class="fixed shadow-xs end-10 top-15 z-[55] text-slate-700 bg-white/90 divide-y divide-slate-400 overflow-hidden border max-w-12 rounded-lg border-white/10 text-start"
        style="-webkit-app-region: no-drag;">
        <div @click="windowSize = 1; menuSize = false" class="hover:bg-slate-400 w-full block text-end px-1.5"
          :class="{ 'bg-slate-400 text-slate-900': isWindowSize(1) }">1</div>
        <div @click="windowSize = 0.95; menuSize = false" class="hover:bg-slate-400 w-full block text-end px-1.5"
          :class="{ 'bg-slate-400 text-slate-900': isWindowSize(0.95) }">0.95</div>
        <div @click="windowSize = 0.90; menuSize = false" class="hover:bg-slate-400 w-full block text-end px-1.5"
          :class="{ 'bg-slate-400 text-slate-900': isWindowSize(0.90) }">0.90</div>
        <div @click="windowSize = 0.85; menuSize = false" class="hover:bg-slate-400 w-full block text-end px-1.5"
          :class="{ 'bg-slate-400 text-slate-900': isWindowSize(0.85) }">0.85</div>
        <div @click="windowSize = 0.80; menuSize = false" class="hover:bg-slate-400 w-full block text-end px-1.5"
          :class="{ 'bg-slate-400 text-slate-900': isWindowSize(0.80) }">0.80</div>
        <div @click="windowSize = 0.75; menuSize = false" class="hover:bg-slate-400 w-full block text-end px-1.5"
          :class="{ 'bg-slate-400 text-slate-900': isWindowSize(0.75) }">0.75</div>
        <div @click="windowSize = 0.70; menuSize = false" class="hover:bg-slate-400 w-full block text-end px-1.5"
          :class="{ 'bg-slate-400 text-slate-900': isWindowSize(0.70) }">0.70</div>
        <div @click="windowSize = 0.65; menuSize = false" class="hover:bg-slate-400 w-full block text-end px-1.5"
          :class="{ 'bg-slate-400 text-slate-900': isWindowSize(0.65) }">0.65</div>
        <div @click="windowSize = 0.60; menuSize = false" class="hover:bg-slate-400 w-full block text-end px-1.5"
          :class="{ 'bg-slate-400 text-slate-900': isWindowSize(0.60) }">0.60</div>
      </div>
      <div class="flex-1 flex flex-col border border-white/20 rounded-full bg-black/5 gap-2">
        <div
          class="h-18 w-[65%] relative z-20 mx-auto flex flex-col items-center justify-end mt-4 text-center leading-4 font-semibold text-green-300 text-shadow-lg/40 text-shadow-slate-800 shadow-inset-lg"
          :class="{ 'mt-4': selectedTimer.name.length > 25, 'text-2xl': selectedTimer.name.length === 1 }">
          {{ selectedTimer.name }}
        </div>
        <div v-if="timers.length > 0"
          class="h-18 w-[90%] mx-auto flex flex-col items-center justify-center relative z-50 text-green-300  text-shadow-lg/40 text-shadow-slate-800 shadow-inset-lg">
          <p class="text-4xl font-bold rounded-full"
            :class="{ 'scale-pulse-fast text-red-500': selectedTimer.duration.timeLeft <= 30 }">{{ formattedTime }}</p>
          <!-- <p v-if="selectedTimer.duration.timeLeft < 0" class="text-xs text-red-500 mt-1">
            Overrun: {{ formattedOverrun }}
          </p> -->

        </div>
        <div dir="ltr" class="relative h-12 w-[85%] mx-auto flex flex-col items-center justify-center">
          <p class="bg-black/50 text-xs w-18 h-6 rounded-full flex justify-center items-center text-white/70">{{ endTime }}</p>
        </div>
        <div
          class="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2 group-hover:opacity-100 opacity-20 transition-opacity duration-300 w-full">
          <div
            class="relative top-[-18px] bg-black/70 h-10 w-[63%] mx-auto rounded-4xl flex items-center justify-between p-3 px-1.5">
            <button style="-webkit-app-region: no-drag;" @click="previousTimer"
              class="border border-white/50 bg-black/70 text-white/70 w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-600/30 cursor-pointer active:scale-95 transition-transform">
              <ForwardIcon class="w-4 h-4" />
            </button>
            <button style="-webkit-app-region: no-drag;" @click="resetTimer"
              class="border border-white/50 bg-black/70 text-white/70 w-8 h-8 flex items-center justify-center rounded-full hover:bg-orange-600/30 cursor-pointer active:scale-95 transition-transform">
              <ArrowPathIcon class="w-4 h-4" />
            </button>
            <button v-if="!selectedTimer.state.isRunning" style="-webkit-app-region: no-drag;" @click="playTimer"
              class="border border-white/50 bg-black/70 text-white/70 w-8 h-8 flex items-center justify-center rounded-full hover:bg-green-600/30 cursor-pointer active:scale-95 transition-transform">
              <PlayIcon class="w-4 h-4" />
            </button>
            <button v-else style="-webkit-app-region: no-drag;" @click="pauseTimer"
              class="border border-white/50 bg-black/70 text-white/70 w-8 h-8 flex items-center justify-center rounded-full hover:bg-orange-600/30 cursor-pointer active:scale-95 transition-transform">
              <PauseIcon class="w-4 h-4" />
            </button>
            <button style="-webkit-app-region: no-drag;" @click="nextTimer"
              class="border border-white/50 bg-black/70 text-white/70 w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-600/30 cursor-pointer active:scale-95 transition-transform">
              <BackwardIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, watchEffect } from 'vue';
import { XMarkIcon, ForwardIcon, BackwardIcon, PlayIcon, PauseIcon, ArrowPathIcon, EllipsisHorizontalCircleIcon } from '@heroicons/vue/24/outline';
import { useTimerStore } from '../stores/timer';
import { storeToRefs } from 'pinia';
import alarmSound from '/assets/sound/alarm-1.wav'; // Adjust path if needed (e.g., '../assets/sound/alarm.mp3')

const alarm = new Audio(alarmSound);
alarm.load(); // Preload the audio for better reliability

const menuSize = ref(false);
const windowSize = ref(parseFloat(localStorage.getItem('windowSize')) || 0.75); // Default size, read from localStorage

const isWindowSize = (val) => Math.abs(windowSize.value - val) < 0.001;

const store = useTimerStore();
const { timers } = storeToRefs(store);

const currentIndex = ref(0);

const selectedTimer = computed(() => timers.value[currentIndex.value] || {
  id: null,
  name: 'لا يوجد مؤقتات متاحة',
  duration: {
    hours: 0,
    minutes: 0,
    seconds: 0,
    timeLeft: 0,
    overrun: 0
  },
  state: {
    isRunning: false,
  }
});

const formattedTime = computed(() => {
  const timeLeft = selectedTimer.value.duration.timeLeft;
  const isNegative = timeLeft < 0;
  const absTime = Math.abs(timeLeft);
  const h = Math.floor(absTime / 3600).toString().padStart(2, '0');
  const m = Math.floor((absTime % 3600) / 60).toString().padStart(2, '0');
  const s = (absTime % 60).toString().padStart(2, '0');
  return `${isNegative ? '-' : ''}${h}:${m}:${s}`;
});

const formattedOverrun = computed(() => {
  const over = selectedTimer.value.duration.overrun || 0;
  const h = Math.floor(over / 3600).toString().padStart(2, '0');
  const m = Math.floor((over % 3600) / 60).toString().padStart(2, '0');
  const s = (over % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
});

const endTime = computed(() => {
  const timeLeft = selectedTimer.value.duration.timeLeft;
  //if (timeLeft <= 0) return 'Time expired';
  const end = new Date(Date.now() + timeLeft * 1000);
  return end.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
});

const radius = 45;
const circumference = 2 * Math.PI * radius;

const dashOffset = computed(() => {
  // Use the original duration value for correct progress calculation
  const totalSeconds = selectedTimer.value.duration.original ?? 0;

  // If no duration is set, return full circle
  if (totalSeconds === 0) return circumference;

  const timeLeft = Math.max(selectedTimer.value.duration.timeLeft, 0);
  const percent = timeLeft / totalSeconds;
  return circumference * (1 - percent);
});

const rotationAngle = computed(() => {
  const total = selectedTimer.value.duration.original ?? 0;
  const timeLeft = Math.max(selectedTimer.value.duration.timeLeft, 0);
  if (total <= 0) return 0;
  const elapsed = total - timeLeft;
  return (elapsed / total) * 360;
});

const previousTimer = () => {
  currentIndex.value = Math.max(0, currentIndex.value - 1);
};

const nextTimer = () => {
  currentIndex.value = Math.min(timers.value.length - 1, currentIndex.value + 1);
};

const playTimer = () => {
  if (selectedTimer.value.id) {
    store.startTimer(selectedTimer.value.id);
  }
};

const pauseTimer = () => {
  if (selectedTimer.value.id) {
    store.stopTimer(selectedTimer.value.id);
  }
};

const resetTimer = () => {
  if (selectedTimer.value.id) {
    store.stopTimer(selectedTimer.value.id);
    store.resetTimer(selectedTimer.value.id);
  }
};

const closeSwiperWindow = () => {
  if (!confirm('هل انت متأكد أنك تريد الخروج من النافذة؟')) return;
  if (window.electronAPI?.closeSwiperWindow) {
    menuSize.value = false; // Hide menu before closing
    selectedTimer.value.state.isRunning = false; // Stop any running timer
    window.electronAPI.closeSwiperWindow();
  } else {
    console.warn('electronAPI.closeSwiperWindow is not defined');
  }
  //window.ipcRenderer.send('close-swiper-window');
};

// Listen for localStorage changes to sync timers
const handleStorageChange = (event) => {
  if (event.key === 'timers') {
    timers.value = JSON.parse(event.newValue) || [];
  }
};


onMounted(() => {
  window.addEventListener('storage', handleStorageChange);
  // Debug: Log electronAPI availability
  console.log('window.electronAPI:', window.electronAPI);
  if (window.electronAPI) {
    console.log('window.electronAPI.closeSwiperWindow:', window.electronAPI.closeSwiperWindow);
  }
});

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange);
});

// Watch for timer finish and play alarm sound
watchEffect(() => {
  if (selectedTimer.value.duration.timeLeft === 0) {
    if (selectedTimer.value.name !== 'لا يوجد مؤقتات متاحة') {
      console.log('Attempting to play alarm...');
      alarm.play().catch(err => console.error('Error playing alarm:', err));
      setTimeout(() => {
        alarm.pause();
        alarm.currentTime = 0;
      }, 3000);
    }
  }
});

watch(menuSize, (newVal) => {
  localStorage.setItem('menuSize', JSON.stringify(newVal));
})

// Watch windowSize and save to localStorage on change
watch(windowSize, (newVal) => {
  localStorage.setItem('windowSize', newVal.toString());
});
</script>

<style scoped>
/* Add custom styles if needed */

@keyframes scale-pulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 0.5;
  }

  50% {
    transform: scale(1.05);
    opacity: 1;
  }
}

.scale-pulse-fast {
  animation: scale-pulse 0.4s infinite;
}
</style>