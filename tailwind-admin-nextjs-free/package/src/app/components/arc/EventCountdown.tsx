'use client'

import { useEffect, useState } from 'react'

interface Props {
  endTime: number   // Unix ms
  label?: string
}

function fmt(ms: number) {
  if (ms <= 0) return 'Ended'
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}

export default function EventCountdown({ endTime, label = 'Ends in' }: Props) {
  const [remaining, setRemaining] = useState(endTime - Date.now())

  useEffect(() => {
    const id = setInterval(() => setRemaining(endTime - Date.now()), 1000)
    return () => clearInterval(id)
  }, [endTime])

  const isLive = remaining > 0
  return (
    <span
      className="text-xs font-bold tabular-nums"
      style={{ color: isLive ? '#4ade80' : '#6b7280' }}
    >
      {isLive ? `${label} ${fmt(remaining)}` : 'Ended'}
    </span>
  )
}
