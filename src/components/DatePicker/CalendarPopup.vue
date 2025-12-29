<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { LocaleCode, CalendarDay, LocaleStrings } from './types'
import { getLocale } from './locales'
import { getCalendarDays, isValidDate } from './utils'

const props = withDefaults(defineProps<{
  modelValue?: Date | null
  locale?: LocaleCode
  minDate?: Date | null
  maxDate?: Date | null
}>(), {
  modelValue: null,
  locale: 'ru',
  minDate: null,
  maxDate: null
})

const emit = defineEmits<{
  'update:modelValue': [value: Date | null]
  'select': [value: Date]
}>()

// State
const initialDate = props.modelValue ?? new Date()
const viewYear = ref(initialDate.getFullYear())
const viewMonth = ref(initialDate.getMonth())
const viewMode = ref<'days' | 'months' | 'years'>('days')

// Computed
const localeStrings = computed<LocaleStrings>(() => getLocale(props.locale))

const calendarDays = computed<CalendarDay[]>(() => {
  return getCalendarDays(
    viewYear.value,
    viewMonth.value,
    props.modelValue,
    props.minDate,
    props.maxDate,
    true
  )
})

const weekdayLabels = computed(() => {
  const days = [...localeStrings.value.weekdaysMin]
  const sunday = days.shift()!
  days.push(sunday)
  return days
})

const years = computed(() => {
  const currentYear = new Date().getFullYear()
  const result: number[] = []
  for (let y = currentYear - 100; y <= currentYear + 10; y++) {
    result.push(y)
  }
  return result
})

const months = computed(() => {
  return localeStrings.value.months.map((name, index) => ({
    index,
    name,
    shortName: localeStrings.value.monthsShort[index]
  }))
})

// Methods
function goToPrevMonth() {
  if (viewMonth.value === 0) {
    viewMonth.value = 11
    viewYear.value--
  } else {
    viewMonth.value--
  }
}

function goToNextMonth() {
  if (viewMonth.value === 11) {
    viewMonth.value = 0
    viewYear.value++
  } else {
    viewMonth.value++
  }
}

function selectDay(day: CalendarDay) {
  if (day.isDisabled) return
  emit('update:modelValue', day.date)
  emit('select', day.date)
}

function selectMonth(monthIndex: number) {
  viewMonth.value = monthIndex
  viewMode.value = 'days'
}

function selectYear(year: number) {
  viewYear.value = year
  viewMode.value = 'months'
}

function goToToday() {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  viewYear.value = now.getFullYear()
  viewMonth.value = now.getMonth()
  viewMode.value = 'days'

  // Select today if within range
  const tooEarly = props.minDate && now < props.minDate
  const tooLate = props.maxDate && now > props.maxDate
  if (!tooEarly && !tooLate) {
    emit('update:modelValue', now)
    emit('select', now)
  }
}

function toggleMonthView() {
  viewMode.value = viewMode.value === 'months' ? 'days' : 'months'
}

function toggleYearView() {
  viewMode.value = viewMode.value === 'years' ? 'days' : 'years'
}

// Sync view with model value
watch(() => props.modelValue, (newValue) => {
  if (newValue && isValidDate(newValue)) {
    viewYear.value = newValue.getFullYear()
    viewMonth.value = newValue.getMonth()
  }
})

// Scroll to current year when years view opens
const yearsContainer = ref<HTMLElement | null>(null)
watch(viewMode, (mode) => {
  if (mode === 'years') {
    setTimeout(() => {
      const currentYearEl = yearsContainer.value?.querySelector('.dp-year-current')
      currentYearEl?.scrollIntoView({ block: 'center' })
    }, 0)
  }
})
</script>

<template>
  <div class="dp-calendar">
    <!-- Header -->
    <div class="dp-header">
      <button
        type="button"
        class="dp-nav-btn"
        @click="goToPrevMonth"
        :aria-label="'Previous month'"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15,18 9,12 15,6"/>
        </svg>
      </button>

      <div class="dp-header-selectors">
        <button type="button" class="dp-header-btn" @click="toggleMonthView">
          {{ localeStrings.months[viewMonth] }}
        </button>
        <button type="button" class="dp-header-btn" @click="toggleYearView">
          {{ viewYear }}
        </button>
      </div>

      <button
        type="button"
        class="dp-nav-btn"
        @click="goToNextMonth"
        :aria-label="'Next month'"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9,6 15,12 9,18"/>
        </svg>
      </button>
    </div>

    <!-- Days View -->
    <div v-if="viewMode === 'days'" class="dp-days-view">
      <div class="dp-weekdays">
        <div v-for="day in weekdayLabels" :key="day" class="dp-weekday">
          {{ day }}
        </div>
      </div>

      <div class="dp-days">
        <button
          v-for="(day, index) in calendarDays"
          :key="index"
          type="button"
          class="dp-day"
          :class="{
            'dp-day-other': !day.isCurrentMonth,
            'dp-day-today': day.isToday,
            'dp-day-selected': day.isSelected,
            'dp-day-disabled': day.isDisabled
          }"
          :disabled="day.isDisabled"
          @click="selectDay(day)"
        >
          {{ day.day }}
        </button>
      </div>
    </div>

    <!-- Months View -->
    <div v-else-if="viewMode === 'months'" class="dp-months-view">
      <button
        v-for="month in months"
        :key="month.index"
        type="button"
        class="dp-month"
        :class="{ 'dp-month-current': month.index === viewMonth }"
        @click="selectMonth(month.index)"
      >
        {{ month.shortName }}
      </button>
    </div>

    <!-- Years View -->
    <div v-else class="dp-years-view" ref="yearsContainer">
      <button
        v-for="year in years"
        :key="year"
        type="button"
        class="dp-year"
        :class="{
          'dp-year-current': year === viewYear,
          'dp-year-today': year === new Date().getFullYear()
        }"
        @click="selectYear(year)"
      >
        {{ year }}
      </button>
    </div>

    <!-- Footer -->
    <div class="dp-footer">
      <button type="button" class="dp-today-btn" @click="goToToday">
        {{ localeStrings.today }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.dp-calendar {
  width: var(--dp-width, 280px);
  background: var(--dp-bg, #ffffff);
  border: var(--dp-border, 1px solid #e5e7eb);
  border-radius: var(--dp-radius, 0.75rem);
  box-shadow: var(--dp-shadow, 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1));
  overflow: hidden;
  user-select: none;
}

/* Header */
.dp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: var(--dp-header-bg, #f9fafb);
  border-bottom: 1px solid var(--dp-border-color, #e5e7eb);
}

.dp-nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  color: var(--dp-nav-color, #374151);
  cursor: pointer;
  outline: none;
  transition: background-color 0.15s, color 0.15s;
}

.dp-nav-btn:hover {
  background: var(--dp-nav-hover-bg, #e5e7eb);
  color: var(--dp-nav-hover-color, #111827);
}

.dp-nav-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 var(--dp-focus-width, 2px) var(--dp-focus-color, rgba(49, 176, 237, 0.5));
}

.dp-header-selectors {
  display: flex;
  gap: 0.25rem;
}

.dp-header-btn {
  padding: 0.375rem 0.625rem;
  font-size: 0.9375rem;
  font-weight: 600;
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  color: var(--dp-header-text, #111827);
  cursor: pointer;
  outline: none;
  transition: background-color 0.15s;
}

.dp-header-btn:hover {
  background: var(--dp-header-btn-hover, #e5e7eb);
}

.dp-header-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 var(--dp-focus-width, 2px) var(--dp-focus-color, rgba(49, 176, 237, 0.5));
}

/* Days View */
.dp-days-view {
  padding: 0.5rem;
}

.dp-weekdays,
.dp-days {
  display: grid;
  grid-template-columns: repeat(7, 36px);
  justify-content: center;
}

.dp-weekday {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--dp-weekday-color, #6b7280);
}

.dp-day {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  font-size: 0.875rem;
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  color: var(--dp-day-color, #111827);
  cursor: pointer;
  outline: none;
  transition: background-color 0.15s, color 0.15s;
}

.dp-day:hover:not(:disabled) {
  background: var(--dp-day-hover-bg, #f3f4f6);
}

.dp-day:focus-visible {
  outline: none;
  box-shadow: 0 0 0 var(--dp-focus-width, 2px) var(--dp-focus-color, rgba(49, 176, 237, 0.5));
}

.dp-day-other {
  color: var(--dp-day-other-color, #9ca3af);
}

.dp-day-today {
  font-weight: 600;
  color: var(--dp-primary, #31b0ed);
}

.dp-day-today::after {
  content: '';
  position: absolute;
  bottom: 4px;
  width: 4px;
  height: 4px;
  background: var(--dp-primary, #31b0ed);
  border-radius: 50%;
}

.dp-day {
  position: relative;
}

.dp-day-selected {
  background: var(--dp-primary, #31b0ed) !important;
  color: var(--dp-primary-text, #ffffff) !important;
  font-weight: 600;
}

.dp-day-selected::after {
  display: none;
}

.dp-day-disabled {
  color: var(--dp-day-disabled-color, #d1d5db);
  cursor: not-allowed;
}

.dp-day-disabled:hover {
  background: transparent;
}

/* Months View */
.dp-months-view {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  padding: 0.75rem;
}

.dp-month {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  font-size: 0.875rem;
  background: transparent;
  border: none;
  border-radius: 0.5rem;
  color: var(--dp-day-color, #111827);
  cursor: pointer;
  outline: none;
  transition: background-color 0.15s;
}

.dp-month:hover {
  background: var(--dp-day-hover-bg, #f3f4f6);
}

.dp-month:focus-visible {
  outline: none;
  box-shadow: 0 0 0 var(--dp-focus-width, 2px) var(--dp-focus-color, rgba(49, 176, 237, 0.5));
}

.dp-month-current {
  background: var(--dp-primary, #31b0ed);
  color: var(--dp-primary-text, #ffffff);
  font-weight: 600;
}

.dp-month-current:hover {
  background: var(--dp-primary-hover, #1a9fd9);
}

/* Years View */
.dp-years-view {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  padding: 0.75rem;
  max-height: 260px;
  overflow-y: auto;
}

.dp-year {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  font-size: 0.875rem;
  background: transparent;
  border: none;
  border-radius: 0.5rem;
  color: var(--dp-day-color, #111827);
  cursor: pointer;
  outline: none;
  transition: background-color 0.15s;
}

.dp-year:hover {
  background: var(--dp-day-hover-bg, #f3f4f6);
}

.dp-year:focus-visible {
  outline: none;
  box-shadow: 0 0 0 var(--dp-focus-width, 2px) var(--dp-focus-color, rgba(49, 176, 237, 0.5));
}

.dp-year-current {
  background: var(--dp-primary, #31b0ed);
  color: var(--dp-primary-text, #ffffff);
  font-weight: 600;
}

.dp-year-current:hover {
  background: var(--dp-primary-hover, #1a9fd9);
}

.dp-year-today {
  font-weight: 600;
  color: var(--dp-primary, #31b0ed);
}

.dp-year-current.dp-year-today {
  color: var(--dp-primary-text, #ffffff);
}

/* Footer */
.dp-footer {
  display: flex;
  justify-content: center;
  padding: 0.5rem;
  border-top: 1px solid var(--dp-border-color, #e5e7eb);
  background: var(--dp-footer-bg, #f9fafb);
}

.dp-today-btn {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 500;
  background: transparent;
  border: 1px solid var(--dp-border-color, #e5e7eb);
  border-radius: 0.375rem;
  color: var(--dp-primary, #31b0ed);
  cursor: pointer;
  outline: none;
  transition: background-color 0.15s, border-color 0.15s;
}

.dp-today-btn:hover {
  background: var(--dp-primary-light, rgba(49, 176, 237, 0.1));
  border-color: var(--dp-primary, #31b0ed);
}

.dp-today-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 var(--dp-focus-width, 2px) var(--dp-focus-color, rgba(49, 176, 237, 0.5));
}

/* Scrollbar styling */
.dp-years-view {
  scrollbar-width: var(--dp-scrollbar-width, thin);
  scrollbar-color: var(--dp-scrollbar, #d1d5db) transparent;
}

.dp-years-view::-webkit-scrollbar {
  width: var(--dp-scrollbar-size, 6px);
}

.dp-years-view::-webkit-scrollbar-track {
  background: var(--dp-scrollbar-track, transparent);
}

.dp-years-view::-webkit-scrollbar-thumb {
  background: var(--dp-scrollbar, #d1d5db);
  border-radius: var(--dp-scrollbar-radius, 3px);
}

.dp-years-view::-webkit-scrollbar-thumb:hover {
  background: var(--dp-scrollbar-hover, #9ca3af);
}
</style>
