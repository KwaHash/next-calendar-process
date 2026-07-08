export interface Slot {
  start: string
  end: string
  content: string
}

export interface Schedule {
  date: string // 'YYYY-MM-DD'
  slots: Slot[]
}

export const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

export const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = String(Math.floor(i / 2)).padStart(2, '0')
  const minute = i % 2 === 0 ? '00' : '30'
  return `${hour}:${minute}`
})

export const toDateStr = (year: number, month: number, day: number) =>
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
