// src/stores/Timer.js
import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

export const useTimerStore = defineStore('timer', () => {
  const timersFromStorage = localStorage.getItem('timers');
  const rawTimers = timersFromStorage ? JSON.parse(timersFromStorage) : [];

  interface TimerDuration {
    hours: number;
    minutes: number;
    seconds: number;
    timeLeft: number;
    overrun: number;
    original: number;
  }

  interface TimerState {
    isRunning: boolean;
  }

  interface Timer {
    id: string;
    name: string;
    duration: TimerDuration;
    state: TimerState;
  }

  type RawTimer = Partial<Timer> & {
    id: string;
    name: string;
    duration?: Partial<TimerDuration>;
    hours?: number;
    minutes?: number;
    seconds?: number;
    timeLeft?: number;
    isRunning?: boolean;
  };

  const normalizeTimer = (timer: RawTimer): Timer => ({
    id: timer.id,
    name: timer.name,
    duration: {
      hours: timer.duration?.hours ?? timer.hours ?? 0,
      minutes: timer.duration?.minutes ?? timer.minutes ?? 0,
      seconds: timer.duration?.seconds ?? timer.seconds ?? 0,
      timeLeft: timer.duration?.timeLeft ?? timer.timeLeft ?? 0,
      overrun: timer.duration?.overrun ?? 0,
      // Add original property with fallback logic
      original: timer.duration?.original ?? timer.timeLeft ?? 0,
    },
    state: {
      isRunning: timer.state?.isRunning ?? timer.isRunning ?? false,
    }
  });

  const timers = ref(rawTimers.length ? rawTimers.map(normalizeTimer) : []);

  const intervals = ref<{ [key: string]: ReturnType<typeof setInterval> }>({});

  const getTotalDuration = computed(() => {
    const totalSeconds = timers.value.reduce(
      (total: number, timer: Timer) => {
      return total + (timer.duration.hours * 3600 + timer.duration.minutes * 60 + timer.duration.seconds);
      },
      0
    );
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  });

  interface AddTimerInput {
    id: string;
    name: string;
    duration: TimerDuration;
    state: TimerState;
  }

  const addTimer = (newTimer: AddTimerInput): void => {
    timers.value.push(newTimer);
    localStorage.setItem('timers', JSON.stringify(timers.value));
  };

  interface DeleteTimer {
    (id: string): void;
  }

  const deleteTimer: DeleteTimer = (id) => {
    timers.value = timers.value.filter((timer: Timer) => timer.id !== id);
    if (intervals.value[id]) {
      clearInterval(intervals.value[id]);
      delete intervals.value[id];
    }
    localStorage.setItem('timers', JSON.stringify(timers.value));
  };

  const deleteAllTimers = () => {
    timers.value = [];
    Object.values(intervals.value).forEach(clearInterval);
    intervals.value = {};
    localStorage.setItem('timers', JSON.stringify(timers.value));
  };

  interface UpdateTimerInput {
    id: string;
    name: string;
    duration: TimerDuration;
    state: TimerState;
  }

  interface UpdateTimer {
    (updatedTimer: UpdateTimerInput): void;
  }

  const updateTimer: UpdateTimer = (updatedTimer) => {
    const index = timers.value.findIndex((t: Timer) => t.id === updatedTimer.id);
    if (index !== -1) {
      const timer = timers.value[index];
      timer.name = updatedTimer.name;
      timer.duration.hours = updatedTimer.duration.hours;
      timer.duration.minutes = updatedTimer.duration.minutes;
      timer.duration.seconds = updatedTimer.duration.seconds;
      timer.duration.timeLeft = updatedTimer.duration.timeLeft;
      timer.duration.original = updatedTimer.duration.original ?? updatedTimer.duration.timeLeft;
      timer.duration.overrun = updatedTimer.duration.overrun ?? timer.duration.overrun ?? 0;
      if (timer.state.isRunning) {
        clearInterval(intervals.value[timer.id]);
        delete intervals.value[timer.id];
        startTimer(timer.id);
      }
      localStorage.setItem('timers', JSON.stringify(timers.value));
    }
  };

  interface UpdateTimerParts {
    (timer: Timer): void;
  }

  const updateTimerParts: UpdateTimerParts = (timer) => {
    const absTime = Math.abs(timer.duration.timeLeft);
    timer.duration.hours = Math.floor(absTime / 3600);
    timer.duration.minutes = Math.floor((absTime % 3600) / 60);
    timer.duration.seconds = absTime % 60;
  };

  interface StartTimer {
    (id: string): void;
  }

  const startTimer: StartTimer = (id) => {
    const timer = timers.value.find((t: Timer) => t.id === id);
    if (timer && !timer.state.isRunning) {
      timer.state.isRunning = true;
      intervals.value[id] = setInterval(() => {
        if (timer.duration.timeLeft > 0) {
          timer.duration.timeLeft--;
          updateTimerParts(timer);
          localStorage.setItem('timers', JSON.stringify(timers.value));
        } else {
          timer.duration.timeLeft--;
          timer.duration.overrun++;
          updateTimerParts(timer);
          localStorage.setItem('timers', JSON.stringify(timers.value));
        }
      }, 1000);
    }
  };

  interface StopTimer {
    (id: string): void;
  }

  const stopTimer: StopTimer = (id) => {
    const timer = timers.value.find((t: Timer) => t.id === id);
    if (timer && timer.state.isRunning) {
      clearInterval(intervals.value[id]);
      delete intervals.value[id];
      timer.state.isRunning = false;
      localStorage.setItem('timers', JSON.stringify(timers.value));
    }
  };

  // Watch for localStorage changes
  window.addEventListener('storage', (event) => {
    if (event.key === 'timers') {
      timers.value = event.newValue ? JSON.parse(event.newValue) : [];
    }
  });

  // Reset a timer by id: set timeLeft to original, overrun to 0, update parts, save to storage
  interface ResetTimer {
    (id: string): void;
  }

  const resetTimer: ResetTimer = (id) => {
    const timer = timers.value.find((t: Timer) => t.id === id);
    if (timer) {
      timer.duration.timeLeft = timer.duration.original ?? 0;
      timer.duration.overrun = 0;
      updateTimerParts(timer);
      localStorage.setItem('timers', JSON.stringify(timers.value));
    }
  };

  return { timers, intervals, getTotalDuration, addTimer, deleteTimer, deleteAllTimers, updateTimer, startTimer, stopTimer, resetTimer };
});