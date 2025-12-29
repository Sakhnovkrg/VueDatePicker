<script setup lang="ts">
import { ref, computed } from 'vue'
import { DatePicker, type LocaleCode, type DateFormat } from './components/DatePicker'

const date1 = ref<Date | null>(null)
const date2 = ref<Date | null>(null)
const date3 = ref<Date | null>(null)
const date4 = ref<Date | null>(null)
const forceError = ref(false)

const locale = ref<LocaleCode>('ru')
const format = ref<DateFormat>('dd.mm.yyyy')
const mintTheme = ref(false)

const locales: { code: LocaleCode; label: string }[] = [
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
  { code: 'kk', label: 'Қазақша' }
]

const formats: { code: DateFormat; label: string }[] = [
  { code: 'dd.mm.yyyy', label: 'dd.mm.yyyy' },
  { code: 'yyyy-mm-dd', label: 'yyyy-mm-dd' }
]

// Минимальная дата - сегодня
const minDate = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
})

// Максимальная дата - через месяц
const maxDate = computed(() => {
  const date = new Date()
  date.setMonth(date.getMonth() + 1)
  date.setHours(0, 0, 0, 0)
  return date
})
</script>

<template>
  <div class="demo" :class="{ 'mint-theme': mintTheme }">
    <h1>Демо DatePicker</h1>

    <div class="settings">
      <div class="setting">
        <label>Язык:</label>
        <select v-model="locale">
          <option v-for="l in locales" :key="l.code" :value="l.code">
            {{ l.label }}
          </option>
        </select>
      </div>

      <div class="setting">
        <label>Формат:</label>
        <select v-model="format">
          <option v-for="f in formats" :key="f.code" :value="f.code">
            {{ f.label }}
          </option>
        </select>
      </div>

      <div class="setting">
        <label class="checkbox-label">
          <input type="checkbox" v-model="mintTheme" />
          Кастомная тема
        </label>
      </div>
    </div>

    <div class="examples">
      <div class="example">
        <h3>1. Стандартный инпут</h3>
        <p class="desc">Инпут с маской ввода</p>
        <DatePicker
          v-model="date1"
          :locale="locale"
          :format="format"
          teleport
        >
          <template #default="{ value, placeholder, onInput, onFocus, onBlur, onClick, hasError }">
            <input
              type="text"
              class="input"
              :class="{ 'input-error': hasError }"
              :value="value"
              :placeholder="placeholder"
              inputmode="numeric"
              @input="onInput"
              @focus="onFocus"
              @blur="onBlur"
              @click="onClick"
            />
          </template>
        </DatePicker>
        <div class="value">Значение: {{ date1?.toLocaleDateString() ?? 'null' }}</div>
      </div>

      <div class="example">
        <h3>2. Диапазон дат</h3>
        <p class="desc">От сегодня до +1 месяц</p>
        <DatePicker
          v-model="date2"
          :locale="locale"
          :format="format"
          :min-date="minDate"
          :max-date="maxDate"
          teleport
        >
          <template #default="{ value, placeholder, onInput, onFocus, onBlur, onClick, hasError }">
            <input
              type="text"
              class="input"
              :class="{ 'input-error': hasError }"
              :value="value"
              :placeholder="placeholder"
              inputmode="numeric"
              @input="onInput"
              @focus="onFocus"
              @blur="onBlur"
              @click="onClick"
            />
          </template>
        </DatePicker>
        <div class="value">Значение: {{ date2?.toLocaleDateString() ?? 'null' }}</div>
      </div>

      <div class="example">
        <h3>3. Кнопка-триггер</h3>
        <p class="desc">Любой элемент как триггер</p>
        <DatePicker
          v-model="date3"
          :locale="locale"
          :format="format"
          teleport
        >
          <template #default="{ value, onClick, isOpen }">
            <button
              type="button"
              class="trigger-btn"
              :class="{ 'trigger-btn-active': isOpen }"
              @click="onClick"
            >
              {{ value || 'Выбрать дату...' }}
            </button>
          </template>
        </DatePicker>
        <div class="value">Значение: {{ date3?.toLocaleDateString() ?? 'null' }}</div>
      </div>

      <div class="example">
        <h3>4. Вывод ошибки</h3>
        <p class="desc">Кастомный класс и сообщение</p>
        <DatePicker
          v-model="date4"
          :locale="locale"
          :format="format"
          teleport
        >
          <template #default="{ value, placeholder, hasError, onInput, onFocus, onBlur, onClick }">
            <div>
              <input
                type="text"
                class="input"
                :class="(hasError || forceError) ? 'input-error' : ''"
                :value="value"
                :placeholder="placeholder"
                inputmode="numeric"
                @input="onInput"
                @focus="onFocus"
                @blur="onBlur"
                @click="onClick"
              />
              <span v-if="hasError || forceError" class="error">Введите корректную дату</span>
            </div>
          </template>
        </DatePicker>
        <label class="checkbox-label" style="margin-top: 0.5rem;">
          <input type="checkbox" v-model="forceError" />
          Показать ошибку
        </label>
        <div class="value">Значение: {{ date4?.toLocaleDateString() ?? 'null' }}</div>
      </div>
    </div>

    <div class="css-vars">
      <h3>CSS переменные календаря</h3>
      <pre><code>/* Основные */
--dp-primary: #31b0ed;
--dp-primary-hover: #1a9fd9;
--dp-primary-light: rgba(49, 176, 237, 0.15);
--dp-primary-text: #ffffff;

/* Фон */
--dp-bg: #ffffff;
--dp-header-bg: #f9fafb;
--dp-footer-bg: #f9fafb;
--dp-day-hover-bg: #f3f4f6;
--dp-nav-hover-bg: #e5e7eb;
--dp-header-btn-hover: #e5e7eb;

/* Границы и форма */
--dp-border: 1px solid #e5e7eb;
--dp-border-color: #e5e7eb;
--dp-radius: 0.75rem;
--dp-width: 280px;
--dp-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);

/* Текст */
--dp-header-text: #111827;
--dp-nav-color: #374151;
--dp-nav-hover-color: #111827;
--dp-day-color: #111827;
--dp-day-other-color: #9ca3af;
--dp-day-disabled-color: #d1d5db;
--dp-weekday-color: #6b7280;

/* Фокус */
--dp-focus-color: rgba(49, 176, 237, 0.5);
--dp-focus-width: 2px;

/* Скролл */
--dp-scrollbar: #d1d5db;
--dp-scrollbar-hover: #9ca3af;</code></pre>
    </div>

    <div class="css-vars">
      <h3>Props</h3>
      <pre><code>modelValue    Date | null      // выбранная дата (v-model)
locale        'ru' | 'en' | 'kk'  // язык (default: 'ru')
format        'dd.mm.yyyy' | 'yyyy-mm-dd'  // формат даты
minDate       Date | null      // минимальная дата
maxDate       Date | null      // максимальная дата
disabled      boolean          // отключить компонент
teleport      string | boolean // teleport popup ('body', true, false)</code></pre>
    </div>

    <div class="css-vars">
      <h3>Slot Props</h3>
      <pre><code>value         string    // отформатированное значение
placeholder   string    // плейсхолдер для инпута
disabled      boolean   // состояние disabled
hasError      boolean   // есть ошибка валидации
isOpen        boolean   // попап открыт
onInput       function  // обработчик ввода
onFocus       function  // обработчик фокуса
onBlur        function  // обработчик blur
onClick       function  // обработчик клика
open          function  // открыть попап
close         function  // закрыть попап</code></pre>
    </div>

    <div class="css-vars">
      <h3>Пример использования</h3>
      <pre><code>&lt;script setup lang="ts"&gt;
import { ref } from 'vue'
import { DatePicker } from '@/components/DatePicker'

const date = ref&lt;Date | null&gt;(null)
const minDate = new Date()
&lt;/script&gt;

&lt;template&gt;
  &lt;DatePicker
    v-model="date"
    locale="ru"
    format="dd.mm.yyyy"
    :min-date="minDate"
    teleport
  &gt;
    &lt;template #default="{ value, placeholder, hasError, onInput, onFocus, onBlur, onClick }"&gt;
      &lt;div&gt;
        &lt;input
          type="text"
          :value="value"
          :placeholder="placeholder"
          :class="{ 'input-error': hasError }"
          @input="onInput"
          @focus="onFocus"
          @blur="onBlur"
          @click="onClick"
        /&gt;
        &lt;span v-if="hasError"&gt;Некорректная дата&lt;/span&gt;
      &lt;/div&gt;
    &lt;/template&gt;
  &lt;/DatePicker&gt;
&lt;/template&gt;</code></pre>
    </div>
  </div>
</template>

<style>
/* Мятная тема для календаря */
.mint-theme {
  /* Основные цвета */
  --dp-primary: #10b981;
  --dp-primary-hover: #059669;
  --dp-primary-light: rgba(16, 185, 129, 0.15);
  --dp-primary-text: #ffffff;

  /* Фон */
  --dp-bg: #f0fdf4;
  --dp-header-bg: #ecfdf5;
  --dp-footer-bg: #ecfdf5;
  --dp-day-hover-bg: #d1fae5;
  --dp-nav-hover-bg: #d1fae5;
  --dp-header-btn-hover: #d1fae5;

  /* Границы и тени */
  --dp-border: 1px solid #a7f3d0;
  --dp-border-color: #a7f3d0;
  --dp-radius: 0.75rem;
  --dp-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.2), 0 8px 10px -6px rgba(16, 185, 129, 0.1);

  /* Цвета текста */
  --dp-header-text: #065f46;
  --dp-nav-color: #047857;
  --dp-nav-hover-color: #065f46;
  --dp-day-color: #064e3b;
  --dp-day-other-color: #6ee7b7;
  --dp-day-disabled-color: #a7f3d0;
  --dp-weekday-color: #059669;

  /* Фокус */
  --dp-focus-color: rgba(16, 185, 129, 0.5);
  --dp-focus-width: 2px;

  /* Скролл (выбор года) */
  --dp-scrollbar: #6ee7b7;
  --dp-scrollbar-hover: #34d399;
}

.demo {
  max-width: 900px;
  padding: 2rem;
}

h1 {
  margin-bottom: 1.5rem;
  font-size: 1.75rem;
}

.settings {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f3f4f6;
  border-radius: 0.5rem;
}

.setting {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.setting label {
  font-weight: 500;
}

.setting select {
  padding: 0.375rem 0.75rem;
  font-size: 0.9375rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input {
  width: 1rem;
  height: 1rem;
}

.examples {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.example {
  padding: 1.25rem;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
}

.example h3 {
  margin: 0 0 0.25rem;
  font-size: 1rem;
}

.example .desc {
  margin: 0 0 1rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.example .value {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
  font-size: 0.8125rem;
  color: #6b7280;
}

.input {
  width: 100%;
  padding: 0.625rem 0.75rem;
  font-size: 0.9375rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.input-error {
  border-color: #ef4444;
}

.error {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.8125rem;
  color: #ef4444;
}

.trigger-btn {
  padding: 0.75rem 1.25rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: white;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}

.trigger-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
}

.trigger-btn-active {
  transform: translateY(0);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.css-vars {
  padding: 1.25rem;
  background: #1a1a2e;
  border-radius: 0.75rem;
  margin-bottom: 1rem;
}

.css-vars h3 {
  margin: 0 0 1rem;
  color: #e5e7eb;
  font-size: 1rem;
}

.css-vars pre {
  margin: 0;
  overflow-x: auto;
  width: 0;
  min-width: 100%;
}

.css-vars code {
  font-size: 0.8125rem;
  color: #a5b4fc;
}

/* Адаптив */
@media (max-width: 640px) {
  .demo {
    max-width: 100%;
    padding: 1rem;
  }

  h1 {
    font-size: 1.25rem;
  }

  .settings {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .examples {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .example {
    padding: 1rem;
  }

  .css-vars {
    padding: 1rem;
  }

  .css-vars code {
    font-size: 0.75rem;
  }

  .trigger-btn {
    width: 100%;
  }
}
</style>
