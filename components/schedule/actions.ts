import { type Schedule, type Slot } from '@/utils/calendar.u'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

type ScheduleRow = { date: string; slots: Slot[] }

// Load every schedule that belongs to the signed-in user (RLS scopes it).
export async function fetchSchedules(): Promise<Schedule[]> {
  const { data, error } = await supabase
    .from('schedules')
    .select('date, slots')
    .order('date', { ascending: true })

  if (error) throw error

  const rows = (data ?? []) as ScheduleRow[]
  return rows.map((row) => ({ date: row.date, slots: row.slots ?? [] }))
}

// Persist the whole set: upsert what's present, delete what was removed.
export async function saveSchedules(schedules: Schedule[]): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('ログインが必要です')

  if (schedules.length > 0) {
    const rows = schedules.map((s) => ({ user_id: user.id, date: s.date, slots: s.slots }))
    const { error } = await supabase.from('schedules').upsert(rows, { onConflict: 'user_id,date' })
    if (error) throw error
  }

  const dates = schedules.map((s) => s.date)
  let query = supabase.from('schedules').delete().eq('user_id', user.id)
  if (dates.length > 0) {
    query = query.not('date', 'in', `(${dates.map((d) => `"${d}"`).join(',')})`)
  }
  const { error } = await query
  if (error) throw error
}
