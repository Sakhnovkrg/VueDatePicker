import type { DateFormat, CalendarDay } from './types'

export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime())
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

export function isDateBefore(date: Date, compareDate: Date): boolean {
  const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const d2 = new Date(compareDate.getFullYear(), compareDate.getMonth(), compareDate.getDate())
  return d1.getTime() < d2.getTime()
}

export function isDateAfter(date: Date, compareDate: Date): boolean {
  const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const d2 = new Date(compareDate.getFullYear(), compareDate.getMonth(), compareDate.getDate())
  return d1.getTime() > d2.getTime()
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

export function formatDate(date: Date | null, format: DateFormat): string {
  if (!date || !isValidDate(date)) return ''

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = String(date.getFullYear())

  if (format === 'dd.mm.yyyy') {
    return `${day}.${month}.${year}`
  }
  return `${year}-${month}-${day}`
}

export function parseDate(value: string, format: DateFormat): Date | null {
  if (!value) return null

  let day: number, month: number, year: number

  if (format === 'dd.mm.yyyy') {
    const parts = value.split('.')
    if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) return null
    day = parseInt(parts[0], 10)
    month = parseInt(parts[1], 10) - 1
    year = parseInt(parts[2], 10)
  } else {
    const parts = value.split('-')
    if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) return null
    year = parseInt(parts[0], 10)
    month = parseInt(parts[1], 10) - 1
    day = parseInt(parts[2], 10)
  }

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null
  if (day < 1 || day > 31 || month < 0 || month > 11 || year < 1900 || year > 2100) return null

  const date = new Date(year, month, day)

  if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
    return null
  }

  return date
}

export function getCalendarDays(
  year: number,
  month: number,
  selectedDate: Date | null,
  minDate: Date | null,
  maxDate: Date | null,
  startWeekOnMonday = true
): CalendarDay[] {
  const days: CalendarDay[] = []
  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfMonth = getFirstDayOfMonth(year, month)

  const adjustedFirstDay = startWeekOnMonday
    ? (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1)
    : firstDayOfMonth

  const prevMonth = month === 0 ? 11 : month - 1
  const prevMonthYear = month === 0 ? year - 1 : year
  const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth)

  for (let i = adjustedFirstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    const date = new Date(prevMonthYear, prevMonth, day)
    days.push(createCalendarDay(date, day, false, selectedDate, minDate, maxDate))
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    days.push(createCalendarDay(date, day, true, selectedDate, minDate, maxDate))
  }

  const nextMonth = month === 11 ? 0 : month + 1
  const nextMonthYear = month === 11 ? year + 1 : year
  const remainingDays = 42 - days.length

  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(nextMonthYear, nextMonth, day)
    days.push(createCalendarDay(date, day, false, selectedDate, minDate, maxDate))
  }

  return days
}

function createCalendarDay(
  date: Date,
  day: number,
  isCurrentMonth: boolean,
  selectedDate: Date | null,
  minDate: Date | null,
  maxDate: Date | null
): CalendarDay {
  const isTooEarly = minDate ? isDateBefore(date, minDate) : false
  const isTooLate = maxDate ? isDateAfter(date, maxDate) : false

  return {
    date,
    day,
    isCurrentMonth,
    isToday: isToday(date),
    isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
    isDisabled: isTooEarly || isTooLate
  }
}

export function applyDateMask(value: string, format: DateFormat): string {
  const digits = value.replace(/\D/g, '')

  if (format === 'dd.mm.yyyy') {
    let result = ''
    for (let i = 0; i < digits.length && i < 8; i++) {
      if (i === 2 || i === 4) result += '.'
      result += digits[i]
    }
    return result
  } else {
    let result = ''
    for (let i = 0; i < digits.length && i < 8; i++) {
      if (i === 4 || i === 6) result += '-'
      result += digits[i]
    }
    return result
  }
}

const pad = (num: number | string): string => {
  return ('0' + num).slice(-2)
}

export function normalizeDateString(value: string): string {
  const parts = value.split('.')
  
  if (parts[0] && parts[0].length === 2) {
    let day = parseInt(parts[0])
    if (day > 31) day = 31
    if (day === 0) day = 1
    parts[0] = pad(day)
  }

  if (parts[1] && parts[1].length === 2) {
    let month = parseInt(parts[1])
    if (month > 12) month = 12
    if (month === 0) month = 1
    parts[1] = pad(month)
  }
  
  if (parts.length === 3 && parts[2].length === 4) {
    const d = parseInt(parts[0])
    const m = parseInt(parts[1])
    const y = parseInt(parts[2])
    const lastDay = new Date(y, m, 0).getDate()
    
    if (d > lastDay) {
      parts[0] = pad(lastDay)
    }
  }

  return parts.join('.')
}
