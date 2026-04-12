'use client'

import { useState } from 'react'
import { Subject } from '@/lib/supabase'

function daysUntil(deadline: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(deadline)
  d.setHours(0, 0, 0, 0)
  return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function barColor(days: number): string {
  if (days < 0) return 'bg-stone-300'
  if (days <= 7) return 'bg-red-400'
  if (days <= 14) return 'bg-amber-400'
  return 'bg-emerald-400'
}

function labelColor(days: number): string {
  if (days < 0) return 'text-stone-500'
  if (days <= 7) return 'text-red-600'
  if (days <= 14) return 'text-amber-600'
  return 'text-emerald-600'
}

interface Props {
  subjects: Subject[]
  onDelete: (id: string) => void
  archived?: boolean
}

export default function GanttChart({ subjects, onDelete, archived = false }: Props) {
  const [confirmId, setConfirmId] = useState<string | null>(null)

  function handleDeleteClick(id: string) {
    setConfirmId(id)
  }

  function handleConfirm() {
    if (confirmId) {
      onDelete(confirmId)
      setConfirmId(null)
    }
  }

  if (subjects.length === 0) {
    return (
      <div className="text-center py-16 text-stone-400 text-sm">
        Brak przedmiotów. Dodaj pierwszy deadline powyżej.
      </div>
    )
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Chart range: from today (or earliest deadline if past) to furthest deadline + 3 days buffer
  const dates = subjects.map(s => new Date(s.deadline))
  const earliest = new Date(Math.min(today.getTime(), ...dates.map(d => d.getTime())))
  const latest = new Date(Math.max(...dates.map(d => d.getTime())))
  latest.setDate(latest.getDate() + 3)

  const totalDays = Math.ceil((latest.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24))
  const todayOffset = Math.ceil((today.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24))

  // Generate week labels
  const weeks: { label: string; offset: number }[] = []
  const cursor = new Date(earliest)
  while (cursor <= latest) {
    const day = cursor.getDate()
    const month = cursor.toLocaleDateString('pl-PL', { month: 'short' })
    weeks.push({
      label: `${day} ${month}`,
      offset: Math.ceil((cursor.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24)),
    })
    cursor.setDate(cursor.getDate() + 7)
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Week labels */}
        <div className="relative h-6 mb-1 ml-40">
          {weeks.map((w, i) => (
            <span
              key={i}
              className="absolute text-[10px] text-stone-400 -translate-x-1/2"
              style={{ left: `${(w.offset / totalDays) * 100}%` }}
            >
              {w.label}
            </span>
          ))}
        </div>

        {/* Rows */}
        <div className="space-y-2">
          {subjects.map(subject => {
            const days = daysUntil(subject.deadline)
            const deadlineDate = new Date(subject.deadline)
            const barStart = Math.max(
              0,
              Math.ceil((today.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24))
            )
            const barEnd = Math.ceil(
              (deadlineDate.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24)
            )
            const barStartPct = (barStart / totalDays) * 100
            const barWidthPct = Math.max(0.5, ((barEnd - barStart) / totalDays) * 100)

            return (
              <div key={subject.id} className="flex items-center gap-2 group">
                {/* Subject name */}
                <div className="w-40 shrink-0 flex items-center justify-between pr-2">
                  <span className="text-sm text-stone-700 truncate font-medium">
                    {subject.name}
                  </span>
                  {!archived && (
                    <button
                      onClick={() => handleDeleteClick(subject.id)}
                      className="shrink-0 text-stone-300 hover:text-red-400 hover:bg-red-50 transition-colors text-xs ml-1 w-5 h-5 rounded flex items-center justify-center"
                      title="Usuń"
                    >
                      🗑
                    </button>
                  )}
                </div>

                {/* Bar track */}
                <div className="relative flex-1 h-8 bg-stone-100 rounded">
                  {/* Today line */}
                  {todayOffset >= 0 && todayOffset <= totalDays && (
                    <div
                      className="absolute top-0 bottom-0 w-px bg-stone-400 z-10"
                      style={{ left: `${(todayOffset / totalDays) * 100}%` }}
                    />
                  )}

                  {/* Bar */}
                  {days >= 0 ? (
                    <div
                      className={`absolute top-1 bottom-1 rounded ${barColor(days)} flex items-center px-2 overflow-hidden`}
                      style={{
                        left: `${barStartPct}%`,
                        width: `${barWidthPct}%`,
                      }}
                    >
                      <span className="text-white text-xs font-semibold whitespace-nowrap drop-shadow-sm">
                        {days === 0 ? 'Dziś!' : `${days} dni`}
                      </span>
                    </div>
                  ) : (
                    <div
                      className="absolute top-1 bottom-1 rounded bg-stone-200 flex items-center px-2"
                      style={{ left: '2%', right: '2%' }}
                    >
                      <span className="text-stone-400 text-xs">
                        Minął {Math.abs(days)} dni temu
                      </span>
                    </div>
                  )}
                </div>

                {/* Deadline date */}
                <div className={`w-20 shrink-0 text-right text-xs font-medium ${labelColor(days)}`}>
                  {deadlineDate.toLocaleDateString('pl-PL', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-6 text-xs text-stone-400 ml-40">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-400 inline-block" /> ponad 14 dni</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-400 inline-block" /> 7–14 dni</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-400 inline-block" /> mniej niż 7 dni</span>
        </div>
      </div>

      {/* Confirmation dialog */}
      {confirmId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 text-center">
            <div className="text-3xl mb-3">🗑</div>
            <h3 className="text-base font-semibold text-stone-800 mb-1">Usuń deadline?</h3>
            <p className="text-sm text-stone-500 mb-5">
              {subjects.find(s => s.id === confirmId)?.name} — tej operacji nie można cofnąć.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmId(null)}
                className="flex-1 border border-stone-200 rounded-xl py-2 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm rounded-xl py-2 transition-colors"
              >
                Usuń
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
