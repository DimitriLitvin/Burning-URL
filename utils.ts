export function formatDate(ts: number) {
  const d = new Date(ts)
  return d.toLocaleString()
}

export function formatCountdown(savedAt: number): string {
  const now = Date.now()
  const timeRemaining = savedAt + 7 * 24 * 60 * 60 * 1000 - now

  if (timeRemaining <= 0) {
    return "Expired"
  }

  const days = Math.floor(timeRemaining / (24 * 60 * 60 * 1000))
  const hours = Math.floor((timeRemaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000))
  const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000)

  return `${days}:${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}
