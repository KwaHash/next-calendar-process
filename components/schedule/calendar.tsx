'use client'

import { useEffect, useState } from 'react'
import { FaPlus } from 'react-icons/fa6'
import { MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight } from 'react-icons/md'
import { fetchSchedules, saveSchedules, translateText } from './actions'
import Loading from '@/components/loading-indicator'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { TIME_OPTIONS, WEEKDAYS, toDateStr, type Schedule, type Slot } from '@/utils/calendar.u'

const emptySlot = (): Slot => ({ start: '10:00', end: '17:00', content: '' })

const Calendar = () => {
  const today = new Date()
  const [isLoading, setIsLoading] = useState(true)
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [translating, setTranslating] = useState(false)

  useEffect(() => {
    void fetchSchedules()
      .then(setSchedules)
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false))
  }, [])

  const firstWeekday = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()

  const changeMonth = (delta: number) => {
    const date = new Date(year, month - 1 + delta, 1)
    setYear(date.getFullYear())
    setMonth(date.getMonth() + 1)
  }

  const save = (date: string, slots: Slot[]) => {
    setSchedules((prev) =>
      [...prev.filter((s) => s.date !== date), { date, slots }].sort((a, b) =>
        a.date.localeCompare(b.date),
      ),
    )
    setEditing(null)
  }

  const remove = (date: string) => setSchedules((prev) => prev.filter((s) => s.date !== date))

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveSchedules(schedules)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  // Translate every schedule's content into the target language at once.
  const translateAll = async (to: 'ja' | 'pt') => {
    setTranslating(true)
    try {
      const next = await Promise.all(
        schedules.map(async (s) => ({
          ...s,
          slots: await Promise.all(
            s.slots.map(async (slot) =>
              slot.content.trim()
                ? { ...slot, content: await translateText(slot.content, to) }
                : slot,
            ),
          ),
        })),
      )
      setSchedules(next)
    } catch (e) {
      console.error(e)
    } finally {
      setTranslating(false)
    }
  }

  if (isLoading) return <Loading />

  return (
    <div className="mt-5 w-full bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-lg font-semibold">
          {year} 年 {month} 月
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={translating || schedules.length === 0}
            onClick={() => translateAll('pt')}
            className="h-8 rounded-sm px-3 text-xs"
          >
            日本語 → ポルトガル語
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={translating || schedules.length === 0}
            onClick={() => translateAll('ja')}
            className="h-8 rounded-sm px-3 text-xs"
          >
            Português → Japonês
          </Button>
          {translating && <span className="text-xs text-gray-500">翻訳中...</span>}
        </div>
      </div>
      <div className="mt-3 flex justify-between">
        <Button variant="outline" onClick={() => changeMonth(-1)} 
          className="p-5 rounded-none hover:text-m-hover-blue hover:border-m-hover-blue hover:bg-transparent transition-all duration-500"
        >
          <MdOutlineKeyboardArrowLeft className="text-2xl" />
        </Button>
        <Button variant="outline" onClick={() => changeMonth(1)}
          className="p-5 rounded-none hover:text-m-hover-blue hover:border-m-hover-blue hover:bg-transparent transition-all duration-500"
        >
          <MdOutlineKeyboardArrowRight className="text-2xl" />
        </Button>
      </div>

      <div className="mt-5 grid grid-cols-7 border-l border-t border-border-gray/20">
        {WEEKDAYS.map((day, i) => (
          <div key={day}
            className={cn('border-b border-r border-border-gray/20 py-2 text-center text-sm font-medium', i === 0 && 'text-m-red')}
          >
            {day}
          </div>
        ))}

        {Array.from({ length: firstWeekday }).map((_, i) => (
          <div key={`empty-${i}`} className="border-b border-r border-border-gray/20" />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const date = toDateStr(year, month, day)
          const schedule = schedules.find((s) => s.date === date)
          return (
            <div key={date} className="min-h-[92px] border-b border-r border-border-gray/20 p-2">
              <p className="text-base font-semibold">{day}</p>
              {schedule ? (
                <div className="mt-1 flex flex-col gap-1">
                  {schedule.slots.map((slot, i) => (
                    <Button
                      key={i}
                      variant="ghost"
                      onClick={() => setEditing(date)}
                      className="h-auto w-full min-w-0 justify-start rounded-[3px] bg-[#29ac6d] px-1.5 py-1 text-[11px] font-normal leading-tight text-white hover:bg-[#29ac6d] hover:text-white hover:opacity-90"
                    >
                      <span className="min-w-0 flex-1 truncate text-left">
                        <span className="font-semibold">{slot.start}</span>
                        {slot.content ? ` ${slot.content}` : ` ~${slot.end}`}
                      </span>
                    </Button>
                  ))}
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditing(date)}
                  className="mt-2 h-auto w-auto rounded-none bg-m-blue px-2 py-1 text-white hover:bg-m-hover-blue hover:text-white"
                >
                  <FaPlus />
                </Button>
              )}
            </div>
          )
        })}
      </div>

      {/* {schedules.length > 0 && (
        <p className="mt-6 text-sm">全 {schedules.length} 件のスケジュールが設定されています。</p>
      )} */}

      <div className="mt-6 flex justify-center">
        <Button onClick={handleSave} disabled={saving}
          className="w-auto h-auto rounded-none bg-m-blue px-16 py-2 text-lg hover:bg-m-hover-blue"
        >
          {saving ? '保存中...' : '保存'}
        </Button>
      </div>

      {editing && (
        <TimeDialog
          date={editing}
          schedule={schedules.find((s) => s.date === editing)}
          onSave={save}
          onDelete={() => remove(editing)}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

interface TimeDialogProps {
  date: string
  schedule?: Schedule
  onSave: (date: string, slots: Slot[]) => void
  onDelete: () => void
  onClose: () => void
}

const TimeDialog = ({ date, schedule, onSave, onDelete, onClose }: TimeDialogProps) => {
  const [slots, setSlots] = useState<Slot[]>(schedule?.slots ?? [emptySlot()])
  const [error, setError] = useState('')

  const addSlot = () => setSlots((prev) => [...prev, emptySlot()])
  const removeSlot = (target: number) =>
    setSlots((prev) => prev.filter((_, i) => i !== target))
  const updateSlot = (target: number, patch: Partial<Slot>) =>
    setSlots((prev) => prev.map((slot, i) => (i === target ? { ...slot, ...patch } : slot)))

  const handleRegister = () => {
    if (slots.some((slot) => slot.start >= slot.end)) {
      setError('終了時刻は開始時刻より後にしてください')
      return
    }
    const sorted = [...slots].sort((a, b) => a.start.localeCompare(b.start))
    onSave(date, sorted)
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto" aria-describedby={undefined}>
        <DialogTitle className="border-l-[5px] border-m-blue pl-2 font-bold">
          {date} の時間設定
        </DialogTitle>

        {error && <p className="rounded border border-m-red p-2 text-sm text-m-red">{error}</p>}

        {slots.map((slot, i) => (
          <div key={i} className="border-b border-[#ccc] pb-5">
            <p className="font-semibold">開催時間</p>
            <div className="mt-2 flex items-center gap-3">
              <TimeSelect value={slot.start} onChange={(v) => updateSlot(i, { start: v })} />
              <span>〜</span>
              <TimeSelect value={slot.end} onChange={(v) => updateSlot(i, { end: v })} />
            </div>

            <p className="mt-3 font-semibold">内容</p>
            <Textarea
              value={slot.content}
              onChange={(e) => updateSlot(i, { content: e.target.value })}
              placeholder="内容を入力してください"
              className="mt-2 min-h-[60px] rounded-none"
            />

            {slots.length > 1 && (
              <Button
                onClick={() => removeSlot(i)}
                className="mt-3 h-8 rounded-sm bg-m-red text-xs hover:bg-m-hover-red"
              >
                設定を削除する
              </Button>
            )}
          </div>
        ))}

        <Button
          onClick={addSlot}
          className="w-[170px] rounded-sm bg-[#bbb] text-white hover:bg-[#aaa]"
        >
          設定を追加する
        </Button>

        <p className="text-sm font-normal">
          ※件数の予約上限に達すると、その時間帯は予約できないようになります。
        </p>

        <Button onClick={handleRegister} className="rounded-sm bg-m-blue hover:bg-m-hover-blue">
          登録する
        </Button>

        {schedule && (
          <Button
            variant="ghost"
            onClick={() => {
              onDelete()
              onClose()
            }}
            className="rounded-sm text-m-red hover:bg-m-red/10 hover:text-m-red"
          >
            この日の予定を削除する
          </Button>
        )}
      </DialogContent>
    </Dialog>
  )
}

const TimeSelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="w-[110px] rounded-none">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {TIME_OPTIONS.map((t) => (
        <SelectItem key={t} value={t}>
          {t}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)

export default Calendar
