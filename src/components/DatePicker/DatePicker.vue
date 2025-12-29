<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import type { LocaleCode, DateFormat } from './types'
import { getLocale } from './locales'
import { formatDate, parseDate, applyDateMask, isValidDate, isDateBefore, isDateAfter } from './utils'
import CalendarPopup from './CalendarPopup.vue'

const props = withDefaults(defineProps<{
  modelValue?: Date | null
  locale?: LocaleCode
  format?: DateFormat
  minDate?: Date | null
  maxDate?: Date | null
  disabled?: boolean
  teleport?: string | boolean
}>(), {
  modelValue: null,
  locale: 'ru',
  format: 'dd.mm.yyyy',
  minDate: null,
  maxDate: null,
  disabled: false,
  teleport: false
})

const emit = defineEmits<{
  'update:modelValue': [value: Date | null]
  'change': [value: Date | null]
  'open': []
  'close': []
}>()

const containerRef = ref<HTMLElement | null>(null)
const popupRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const inputValue = ref('')
const hasError = ref(false)
const popupStyle = ref<Record<string, string>>({})

const localeStrings = computed(() => getLocale(props.locale))
const placeholder = computed(() => localeStrings.value.placeholder[props.format])

function formatValue(date: Date | null): string {
  return formatDate(date, props.format)
}

function isDateInRange(date: Date): boolean {
  if (props.minDate && isDateBefore(date, props.minDate)) return false
  if (props.maxDate && isDateAfter(date, props.maxDate)) return false
  return true
}

function validateDate(date: Date | null): boolean {
  if (!date) {
    hasError.value = false
    return true
  }

  if (!isValidDate(date) || !isDateInRange(date)) {
    hasError.value = true
    return false
  }

  hasError.value = false
  return true
}

function updateInputValue(date: Date | null) {
  inputValue.value = formatValue(date)
}

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  const rawValue = target.value
  const maskedValue = applyDateMask(rawValue, props.format)

  inputValue.value = maskedValue
  target.value = maskedValue

  if (maskedValue.length === 10) {
    const parsed = parseDate(maskedValue, props.format)
    if (parsed && validateDate(parsed)) {
      emit('update:modelValue', parsed)
      emit('change', parsed)
    }
  } else if (maskedValue.length === 0) {
    hasError.value = false
    emit('update:modelValue', null)
    emit('change', null)
  }
}

function handleBlur() {
  const value = inputValue.value

  // Пустой инпут - ок
  if (value.length === 0) {
    hasError.value = false
    return
  }

  // Неполный ввод или невалидная дата - сбросить
  if (value.length < 10) {
    resetInput()
    return
  }

  const parsed = parseDate(value, props.format)
  if (!parsed || !isValidDate(parsed) || !isDateInRange(parsed)) {
    resetInput()
  }
}

function resetInput() {
  if (props.modelValue) {
    inputValue.value = formatValue(props.modelValue)
  } else {
    inputValue.value = ''
  }
  hasError.value = false
}

function handleFocus() {
  if (!props.disabled) {
    openPopup()
  }
}

function handleClick() {
  if (!props.disabled && !isOpen.value) {
    openPopup()
  }
}

function handleCalendarSelect(date: Date | null) {
  if (!date) return
  if (validateDate(date)) {
    emit('update:modelValue', date)
    emit('change', date)
    closePopup()
  }
}

function openPopup() {
  if (props.disabled) return
  isOpen.value = true
  emit('open')
  nextTick(positionPopup)
}

function closePopup() {
  isOpen.value = false
  emit('close')
}

function positionPopup() {
  if (!containerRef.value || !popupRef.value) return

  const containerRect = containerRef.value.getBoundingClientRect()
  const popupHeight = popupRef.value.offsetHeight
  const popupWidth = popupRef.value.offsetWidth
  const viewportHeight = window.innerHeight
  const viewportWidth = window.innerWidth

  let top = containerRect.bottom + 4
  let left = containerRect.left

  if (top + popupHeight > viewportHeight - 10) {
    top = containerRect.top - popupHeight - 4
  }

  if (left + popupWidth > viewportWidth - 10) {
    left = viewportWidth - popupWidth - 10
  }

  if (left < 10) {
    left = 10
  }

  popupStyle.value = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    zIndex: '9999'
  }
}

function handleClickOutside(event: MouseEvent) {
  if (!containerRef.value?.contains(event.target as Node) &&
      !popupRef.value?.contains(event.target as Node)) {
    closePopup()
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closePopup()
  }
}

function handleScroll() {
  if (isOpen.value) {
    positionPopup()
  }
}

watch(() => props.modelValue, (newValue) => {
  updateInputValue(newValue)
  if (newValue) {
    validateDate(newValue)
  }
}, { immediate: true })

watch(() => props.format, () => {
  updateInputValue(props.modelValue)
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside, true)
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('scroll', handleScroll, true)
  window.addEventListener('resize', positionPopup)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true)
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('scroll', handleScroll, true)
  window.removeEventListener('resize', positionPopup)
})

defineExpose({
  open: openPopup,
  close: closePopup,
  isOpen,
  hasError
})
</script>

<template>
  <div ref="containerRef" class="dp-container">
    <slot
      :value="inputValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :has-error="hasError"
      :is-open="isOpen"
      :on-input="handleInput"
      :on-focus="handleFocus"
      :on-blur="handleBlur"
      :on-click="handleClick"
      :open="openPopup"
      :close="closePopup"
    />

    <Teleport v-if="teleport" :to="teleport === true ? 'body' : teleport">
      <Transition name="dp-popup">
        <div
          v-if="isOpen"
          ref="popupRef"
          class="dp-popup"
          :style="popupStyle"
        >
          <CalendarPopup
            :model-value="modelValue"
            :locale="locale"
            :min-date="minDate"
            :max-date="maxDate"
            @update:model-value="handleCalendarSelect"
            @select="handleCalendarSelect"
          />
        </div>
      </Transition>
    </Teleport>

    <Transition v-else name="dp-popup">
      <div
        v-if="isOpen"
        ref="popupRef"
        class="dp-popup"
        :style="popupStyle"
      >
        <CalendarPopup
          :model-value="modelValue"
          :locale="locale"
          :min-date="minDate"
          :max-date="maxDate"
          @update:model-value="handleCalendarSelect"
          @select="handleCalendarSelect"
        />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dp-container {
  position: relative;
  display: inline-block;
}

.dp-popup {
  position: absolute;
}

.dp-popup-enter-active,
.dp-popup-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dp-popup-enter-from,
.dp-popup-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
