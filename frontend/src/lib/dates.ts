// Local yyyy-mm-dd; the backend re-checks, so a stale value after midnight is harmless
export const TODAY = new Date().toLocaleDateString('sv-SE')

export const formatDate = (isoDate: string) => {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Age and days until the next birthday, from a yyyy-mm-dd string
export function birthdayInfo(birthDate: string) {
  const [y, m, d] = birthDate.split('-').map(Number)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let next = new Date(today.getFullYear(), m - 1, d)
  if (next < today) next = new Date(today.getFullYear() + 1, m - 1, d)
  const daysLeft = Math.round((next.getTime() - today.getTime()) / 86_400_000)
  const age = next.getFullYear() - y - (daysLeft === 0 ? 0 : 1)
  return { age, daysLeft }
}

const relative = new Intl.RelativeTimeFormat('id-ID', { numeric: 'auto' })

// "5 menit yang lalu". The API sends UTC timestamps without a zone (SQLite drops it), so add the Z back.
export function timeAgo(iso: string) {
  const date = new Date(/(Z|[+-]\d\d:\d\d)$/.test(iso) ? iso : `${iso}Z`)
  const minutes = Math.round((date.getTime() - Date.now()) / 60_000)
  if (minutes > -1) return 'baru saja'
  if (minutes > -60) return relative.format(minutes, 'minute')
  if (minutes > -60 * 24) return relative.format(Math.round(minutes / 60), 'hour')
  if (minutes > -60 * 24 * 7) return relative.format(Math.round(minutes / 1440), 'day')
  return formatDate(iso.slice(0, 10))
}
