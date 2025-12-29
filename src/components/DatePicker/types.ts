export type LocaleCode = 'ru' | 'en' | 'kk'

export type DateFormat = 'dd.mm.yyyy' | 'yyyy-mm-dd'

export interface CalendarDay {
  date: Date
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  isDisabled: boolean
}

export interface LocaleStrings {
  months: string[]
  monthsShort: string[]
  weekdaysMin: string[]
  today: string
  placeholder: Record<DateFormat, string>
}
