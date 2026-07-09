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

// Translate free text via the shared /api/chat endpoint. `target` is the
// language to translate into ('ja' = Japanese, 'pt' = Portuguese).
export async function translateText(text: string, target: 'ja' | 'pt'): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: text }], target }),
  })
  if (!res.ok) throw new Error(`翻訳に失敗しました (${res.status})`)

  const reader = res.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''
  let result = ''

  // Each NDJSON line holds the full accumulated content, so the last one wins.
  const readLine = (line: string) => {
    const trimmed = line.trim()
    if (!trimmed) return
    try {
      const payload = JSON.parse(trimmed) as { content?: Array<{ type: string; text?: string }> }
      const textPart = payload.content?.find((p) => p.type === 'text')
      if (textPart?.text) result = textPart.text
    } catch {
      // skip malformed lines
    }
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) readLine(line)
  }
  readLine(buffer)

  return result
}
