<template>
    <div class="flex-1 flex flex-col gap-4">
        <div v-if="timers.length > 0" class="border border-slate-200 border-dashed rounded-lg h-12 flex items-center justify-between text-xs">
            <button type="button" class="text-blue-500 hover:text-blue-700 px-4 py-2 cursor-pointer" @click="openSwiperWindow">عرض النافذة</button>
            <p class="text-gray-500 px-4 py-2"><span>المؤقتات :</span> <span class="font-bold">{{ timers.length }}</span></p>
            <p class="text-gray-500 px-4 py-2 flex items-center gap-2"><span>المدة :</span> <span class="font-bold">{{ getTotalDuration }}</span> <ClockIcon class="h-4 w-4 inline-block" /></p>
            <button type="button" class="text-red-500 hover:text-red-700 px-4 py-2 cursor-pointer" @click="handleDeleteAll">حذف الكل</button>
        </div>
        <div class="flex-1 border border-slate-200 border-dashed rounded-lg h-16 flex flex-col gap-4 p-6" :class="{'overflow-y-scroll max-h-[325px] lg:max-h-[400px]': timers.length > 5}">
            <p v-if="timers.length === 0" class="text-gray-500 text-sm">لا توجد مؤقتات متاحة.</p>
            <draggable
                v-model="timers"
                item-key="id"
                handle=".handle"
                tag="div"
                :animation="200"
                @end="syncTimers"
            >
                <template #item="{ element: timer }">
                    <div class="flex items-center justify-between rounded-lg px-2" :class="{ 'border-b border-b-slate-100 py-1.5 last:border-none': timers.length > 1 }">
                        <div class="flex items-center gap-2 flex-1">
                            <ArrowsUpDownIcon class="handle h-5 w-5 text-gray-400 cursor-move" />
                            <div>
                                <p class="text-sm font-semibold flex gap-2 items-center">
                                    <PlayCircleIcon v-if="timer.state.isRunning" class="inline-block h-4 w-4 text-green-500" />
                                    {{ timer.name }}
                                </p>
                                <p class="text-xs text-gray-500">
                                  <template v-if="timer.duration.timeLeft >= 0">
                                    {{ timer.duration.hours }}h {{ timer.duration.minutes }}m {{ timer.duration.seconds }}s
                                  </template>
                                  <template v-else>
                                    الفعلي: {{ formatOverrun(timer.duration.original || (timer.duration.timeLeft + timer.duration.overrun)) }}<br>
                                    تجاوز: -{{ formatOverrun(timer.duration.overrun) }}
                                  </template>
                                </p>
                            </div>
                        </div>
                        <div class="flex gap-4 self-end">
                            <button class="text-blue-500 hover:text-blue-700 cursor-pointer" @click="openEditModal(timer)">
                                <PencilIcon class="h-4 w-4" />
                            </button>
                            <button class="text-red-500 hover:text-red-700 cursor-pointer" @click="deleteTimer(timer.id)">
                                <TrashIcon class="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </template>
            </draggable>
        </div>

        <!-- Edit Modal -->
        <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 class="text-lg font-bold mb-4">تعديل مؤقت</h2>
                <form @submit.prevent="handleEditSubmit">
                    <div class="mb-2">
                        <label for="edit-name" class="block mb-1 text-xs">اسم المؤقت</label>
                        <input
                            type="text"
                            id="edit-name"
                            v-model="editedTimer.name"
                            class="w-full px-2 py-1 border border-slate-300 rounded"
                            maxlength="35"
                            required
                        />
                    </div>
                    <div class="grid grid-cols-3 gap-4 items-end">
                        <div>
                            <label for="edit-hours" class="block mb-1 text-xs">الساعات</label>
                            <input
                                type="number"
                                id="edit-hours"
                                v-model="editedTimer.hours"
                                min="0"
                                max="23"
                                class="w-full px-2 py-1 border border-slate-300 rounded"
                            />
                        </div>
                        <div>
                            <label for="edit-minutes" class="block mb-1 text-xs">الدقائق</label>
                            <input
                                type="number"
                                id="edit-minutes"
                                v-model="editedTimer.minutes"
                                min="0"
                                max="59"
                                class="w-full px-2 py-1 border border-slate-300 rounded"
                            />
                        </div>
                        <div>
                            <label for="edit-seconds" class="block mb-1 text-xs">الثواني</label>
                            <input
                                type="number"
                                id="edit-seconds"
                                v-model="editedTimer.seconds"
                                min="0"
                                max="59"
                                class="w-full px-2 py-1 border border-slate-300 rounded"
                            />
                        </div>
                    </div>
                    <div v-if="Object.keys(errors).length > 0" class="mt-4 text-red-500 text-xs">
                        <p class="font-semibold">Please fix the following errors:</p>
                        <ul class="list-disc pl-4">
                            <li v-for="(error, field) in errors" :key="field">{{ error }}</li>
                        </ul>
                    </div>
                    <div class="flex justify-end gap-4 mt-6">
                        <button type="button" class="text-gray-500 hover:text-gray-700" @click="closeEditModal">إلغاء</button>
                        <button type="submit" class="text-blue-500 hover:text-blue-700">حفظ</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import draggable from 'vuedraggable';
import { ArrowsUpDownIcon, PencilIcon, TrashIcon, ClockIcon, PlayCircleIcon } from '@heroicons/vue/24/outline';
import { useTimerStore } from '../stores/timer'; // Adjust path as needed
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

const store = useTimerStore();
const { timers, getTotalDuration } = storeToRefs(store);
const { deleteTimer, deleteAllTimers, updateTimer } = store;

// Handler for Delete All with confirmation
const handleDeleteAll = () => {
    if (confirm('هل انت متأكد أنك تريد حذف جميع المؤقتات؟')) {
        deleteAllTimers();
        syncTimers(); // Sync after delete
    }
};

// Open swiper in new Electron window using exposed API from preload
const openSwiperWindow = () => {
    window.electronAPI.openSwiperWindow();
};

// Edit Modal State
const showEditModal = ref(false);
const editedTimer = ref(null);
const errors = ref({});

// Open Edit Modal
const openEditModal = (timer) => {
    editedTimer.value = {
      id: timer.id,
      name: timer.name,
      hours: timer.duration.hours,
      minutes: timer.duration.minutes,
      seconds: timer.duration.seconds,
      isRunning: timer.state.isRunning,
      original: timer.duration.original,
      overrun: timer.duration.overrun,
    };
    showEditModal.value = true;
};

// Close Edit Modal
const closeEditModal = () => {
    showEditModal.value = false;
    editedTimer.value = null;
    errors.value = {};
};

// Validate Form
const validateForm = () => {
    errors.value = {};
    let isValid = true;

    if (!editedTimer.value.name.trim()) {
        errors.value.name = 'اسم المؤقت مطلوب.';
        isValid = false;
    } else {
        // Prevent duplicate timer names (case-insensitive), except for the timer being edited
        const existing = timers.value.find(
            t =>
                t.name.trim().toLowerCase() === editedTimer.value.name.trim().toLowerCase() &&
                t.id !== editedTimer.value.id
        );
        if (existing) {
            errors.value.name = 'يوجد مؤقت آخر بهذا الاسم بالفعل.';
            isValid = false;
        }
    }

    if (editedTimer.value.hours < 0 || editedTimer.value.hours > 23 || !Number.isInteger(Number(editedTimer.value.hours))) {
        errors.value.hours = 'يجب أن تكون الساعات عددًا صحيحًا بين 0 و23.';
        isValid = false;
    }

    if (editedTimer.value.minutes < 0 || editedTimer.value.minutes > 59 || !Number.isInteger(Number(editedTimer.value.minutes))) {
        errors.value.minutes = 'يجب أن تكون الدقائق عددًا صحيحًا بين 0 و59.';
        isValid = false;
    }

    if (editedTimer.value.seconds < 0 || editedTimer.value.seconds > 59 || !Number.isInteger(Number(editedTimer.value.seconds))) {
        errors.value.seconds = 'يجب أن تكون الثواني عددًا صحيحًا بين 0 و59.';
        isValid = false;
    }

    if (editedTimer.value.hours === 0 && editedTimer.value.minutes === 0 && editedTimer.value.seconds === 0) {
        errors.value.duration = 'يجب أن تكون مدة المؤقت ثانية واحدة على الأقل.';
        isValid = false;
    }

    return isValid;
};

// Handle Edit Submit
const handleEditSubmit = () => {
    if (validateForm()) {
        const timeLeft = editedTimer.value.hours * 3600 + editedTimer.value.minutes * 60 + editedTimer.value.seconds;
        store.updateTimer({
            id: editedTimer.value.id,
            name: editedTimer.value.name.trim(),
            duration: {
                hours: Number(editedTimer.value.hours),
                minutes: Number(editedTimer.value.minutes),
                seconds: Number(editedTimer.value.seconds),
                timeLeft,
                overrun: 0,
                original: timeLeft
            },
            state: {
                isRunning: false,
            }
        });
        syncTimers(); // Sync after edit
        closeEditModal();
    }
};

// Sync timers to localStorage
const syncTimers = () => {
    localStorage.setItem('timers', JSON.stringify(timers.value));
};
// Helper to format overrun seconds as "hh:mm:ss" with leading zeros, shown as "hh h mm m ss s"
const formatOverrun = (seconds) => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}h ${m}m ${s}s`;
};
</script>

<style scoped>
.list-move {
    transition: transform 0.5s;
}
</style>