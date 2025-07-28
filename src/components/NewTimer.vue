<template>
    <div>
        <p class="mb-3 text-slate-600">اضافة مؤقت جديد</p>
        <form @submit.prevent="handleSubmit">
            <div class="mb-2">
                <label for="name" class="block mb-1 text-xs">اسم المؤقت</label>
                <input
                    type="text"
                    id="name"
                    v-model="name"
                    maxlength="30"
                    class="w-full px-2 py-1 border border-slate-300 rounded"
                    required
                />
            </div>
            <div class="grid grid-cols-4 gap-2 items-end">
                <div class="col-span-1 text-center">
                    <label for="hours" class="block mb-1 text-xs">الساعات</label>
                    <input
                        type="number"
                        id="hours"
                        v-model="hours"
                        min="0"
                        max="23"
                        class="w-full px-2 py-1 border border-slate-300 rounded"
                    />
                </div>
                <div class="col-span-1 text-center">
                    <label for="minutes" class="block mb-1 text-xs">الدقائق</label>
                    <input
                        type="number"
                        id="minutes"
                        v-model="minutes"
                        min="0"
                        max="59"
                        class="w-full px-2 py-1 border border-slate-300 rounded"
                    />
                </div>
                <div class="col-span-1 text-center">
                    <label for="seconds" class="block mb-1 text-xs">الثواني</label>
                    <input
                        type="number"
                        id="seconds"
                        v-model="seconds"
                        min="0"
                        max="59"
                        class="w-full px-2 py-1 border border-slate-300 rounded"
                    />
                </div>
                <div class="col-span-1">
                    <button
                        type="submit"
                        class="w-full text-xs px-2 py-1.5 h-[30px] rounded bg-[#4bb078] hover:bg-[#4bb078]/70 cursor-pointer text-white font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        إضافة
                    </button>
                </div>
            </div>
        </form>
        <div v-if="Object.keys(errors).length > 0" class="mt-4 text-red-500 text-xs">
            <p class="font-semibold">يرجى تصحيح الأخطاء التالية:</p>
            <ul class="list-disc pl-4">
                <li v-for="(error, field) in errors" :key="field">{{ error }}</li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useTimerStore } from '../stores/timer'; // Ensure this path is correct

const store = useTimerStore();

const name = ref('');
const hours = ref(0);
const minutes = ref(0);
const seconds = ref(0);
const errors = ref({});

const validateForm = () => {
    errors.value = {};
    let isValid = true;

    if (!name.value.trim()) {
        errors.value.name = 'اسم المؤقت مطلوب.';
        isValid = false;
    }

    if (hours.value < 0 || hours.value > 23 || !Number.isInteger(Number(hours.value))) {
        errors.value.hours = 'يجب أن تكون الساعات عددًا صحيحًا بين 0 و23.';
        isValid = false;
    }

    if (minutes.value < 0 || minutes.value > 59 || !Number.isInteger(Number(minutes.value))) {
        errors.value.minutes = 'يجب أن تكون الدقائق عددًا صحيحًا بين 0 و59.';
        isValid = false;
    }

    if (seconds.value < 0 || seconds.value > 59 || !Number.isInteger(Number(seconds.value))) {
        errors.value.seconds = 'يجب أن تكون الثواني عددًا صحيحًا بين 0 و59.';
        isValid = false;
    }

    if (hours.value === 0 && minutes.value === 0 && seconds.value === 0) {
        errors.value.duration = 'يجب أن تكون مدة المؤقت ثانية واحدة على الأقل.';
        isValid = false;
    }

    return isValid;
};

const handleSubmit = () => {
    if (validateForm()) {
        // Prevent duplicate timer names (case-insensitive, trimmed)
        const duplicate = store.timers.find(
            t => t.name.trim().toLowerCase() === name.value.trim().toLowerCase()
        );
        if (duplicate) {
            errors.value.name = 'يوجد مؤقت آخر بهذا الاسم بالفعل.';
            return;
        }

        const timeLeft = hours.value * 3600 + minutes.value * 60 + seconds.value;
        const newTimer = {
            id: Date.now(),
            name: name.value.trim(),
            duration: {
                hours: Number(hours.value),
                minutes: Number(minutes.value),
                seconds: Number(seconds.value),
                timeLeft,
                overrun: 0,
                original: timeLeft,
            },
            state: {
                isRunning: false,
            },
        };

        store.addTimer(newTimer);

        // Reset form
        name.value = '';
        hours.value = 0;
        minutes.value = 0;
        seconds.value = 0;
        errors.value = {}; // Clear errors on successful submit
    }
};
</script>