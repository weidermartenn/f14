<template>
  <div class="relative">
    <input
      type="text"
      :value="formattedDate"
      @click="toggleCalendar"
      class="w-full px-4 py-2 border border-gray-700 bg-gray-200 dark:bg-bg-accent-dark text-zinc-800 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      placeholder="Выберите дату"
      readonly
    />
    <div
      v-if="isOpen"
      class="absolute z-10 mt-2 bg-bg-accent-dark border border-gray-700 rounded-lg shadow-lg"
    >
      <div class="flex justify-between items-center p-4 bg-gray-800 rounded-t-lg">
        <button @click="prevMonth" class="p-2 hover:bg-gray-700 rounded-full text-white">
          <i class="fas fa-chevron-left"></i>
        </button>
        <div class="flex gap-2">
          <select
            v-model="selectedMonth"
            @change="updateMonth"
            class="bg-gray-700 text-white rounded-md px-2 py-1"
          >
            <option v-for="(month, index) in months" :key="index" :value="index">
              {{ month }}
            </option>
          </select>
          <select
            v-model="selectedYear"
            @change="updateYear"
            class="bg-gray-700 text-white rounded-md px-2 py-1"
          >
            <option v-for="year in years" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>
        <button @click="nextMonth" class="p-2 hover:bg-gray-700 rounded-full text-white">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
      <div class="grid grid-cols-7 gap-2 p-4">
        <div
          v-for="day in daysOfWeek"
          :key="day"
          class="text-center text-sm text-gray-400"
        >
          {{ day }}
        </div>
        <div
          v-for="day in days"
          :key="day.date?.toISOString() || 'empty'"
          @click="selectDate(day.date)"
          :class="[
            'text-center p-2 rounded-full cursor-pointer',
            day.isCurrentMonth ? 'text-white' : 'text-gray-500',
            day.isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-700',
          ]"
        >
          {{ day.day }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Date,
    default: () => new Date(),
  },
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const currentDate = ref(new Date(props.modelValue));
const selectedMonth = ref(currentDate.value.getMonth());
const selectedYear = ref(currentDate.value.getFullYear());

const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const months = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

const years = computed(() => {
  const currentYear = new Date().getFullYear();
  const startYear = 2025; // Начальный год
  const endYear = currentYear + 20; // Например, показываем на 20 лет вперед

  return Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  );
});

const days = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startDay = firstDayOfMonth.getDay() || 7; // Понедельник = 1

  const daysArray: {
    day: number | string;
    date: Date | null;
    isCurrentMonth: boolean;
    isSelected: boolean;
  }[] = [];

  for (let i = 1; i < startDay; i++) {
    daysArray.push({ day: '', date: null, isCurrentMonth: false, isSelected: false });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    daysArray.push({
      day: i,
      date,
      isCurrentMonth: true,
      isSelected: date.toDateString() === props.modelValue.toDateString(),
    });
  }

  return daysArray;
});

const formattedDate = computed(() => {
  return props.modelValue.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

const toggleCalendar = () => {
  isOpen.value = !isOpen.value;
};

const prevMonth = () => {
  currentDate.value.setMonth(currentDate.value.getMonth() - 1);
  updateCurrentDate();
};

const nextMonth = () => {
  currentDate.value.setMonth(currentDate.value.getMonth() + 1);
  updateCurrentDate();
};

const updateMonth = () => {
  currentDate.value.setMonth(selectedMonth.value);
  updateCurrentDate();
};

const updateYear = () => {
  currentDate.value.setFullYear(selectedYear.value);
  updateCurrentDate();
};

const updateCurrentDate = () => {
  currentDate.value = new Date(currentDate.value);
};

const selectDate = (date: Date | null) => {
  if (date) {
    emit('update:modelValue', date);
    isOpen.value = false;
  }
};
</script>

<style scoped>
/* Дополнительные стили, если нужно */
</style>