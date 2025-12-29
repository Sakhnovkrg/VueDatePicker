import type { LocaleCode, LocaleStrings } from './types'

export const locales: Record<LocaleCode, LocaleStrings> = {
  ru: {
    months: [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ],
    monthsShort: [
      'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
      'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
    ],
    weekdaysMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    today: 'Сегодня',
    placeholder: {
      'dd.mm.yyyy': 'дд.мм.гггг',
      'yyyy-mm-dd': 'гггг-мм-дд'
    }
  },

  en: {
    months: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ],
    monthsShort: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ],
    weekdaysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    today: 'Today',
    placeholder: {
      'dd.mm.yyyy': 'dd.mm.yyyy',
      'yyyy-mm-dd': 'yyyy-mm-dd'
    }
  },

  kk: {
    months: [
      'Қаңтар', 'Ақпан', 'Наурыз', 'Сәуір', 'Мамыр', 'Маусым',
      'Шілде', 'Тамыз', 'Қыркүйек', 'Қазан', 'Қараша', 'Желтоқсан'
    ],
    monthsShort: [
      'Қаң', 'Ақп', 'Нау', 'Сәу', 'Мам', 'Мау',
      'Шіл', 'Там', 'Қыр', 'Қаз', 'Қар', 'Жел'
    ],
    weekdaysMin: ['Жс', 'Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сб'],
    today: 'Бүгін',
    placeholder: {
      'dd.mm.yyyy': 'кк.аа.жжжж',
      'yyyy-mm-dd': 'жжжж-аа-кк'
    }
  }
}

export function getLocale(code: LocaleCode): LocaleStrings {
  return locales[code] || locales.ru
}
