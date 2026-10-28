// Dates follow the language the agent picked (set by I18nProvider); British English by default
let locale = 'en-GB'
export const setFormatLocale = (l: string) => { locale = l }

export const fmtDate = (v: string | null | undefined) =>
  v ? new Date(v).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

export const fmtDateTime = (v: string | null | undefined) =>
  v ? new Date(v).toLocaleString(locale, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'

export const fmtNumber = (n: number) => n.toLocaleString(locale)

// <input type="datetime-local"> wants local "YYYY-MM-DDTHH:mm"
export function toLocalInput(v: string | null) {
  if (!v) return ''
  const d = new Date(v)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
