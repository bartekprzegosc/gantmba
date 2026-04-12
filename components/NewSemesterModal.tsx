'use client'

import { useState } from 'react'

interface Props {
  onCreated: () => void
  onClose: () => void
}

export default function NewSemesterModal({ onCreated, onClose }: Props) {
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !startDate || !endDate) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/semesters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), start_date: startDate, end_date: endDate }),
      })
      if (!res.ok) throw new Error('Błąd')
      onCreated()
      onClose()
    } catch {
      setError('Nie udało się utworzyć semestru.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-lg font-semibold text-stone-800 mb-6">Nowy semestr</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-stone-500 font-medium block mb-1">Nazwa semestru</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="np. Semestr 2 2024/2025"
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
              maxLength={80}
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-stone-500 font-medium block mb-1">Początek</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-stone-500 font-medium block mb-1">Koniec</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-stone-200 rounded-lg py-2 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim() || !startDate || !endDate}
              className="flex-1 bg-amber-400 hover:bg-amber-500 disabled:opacity-40 text-white font-semibold text-sm rounded-lg py-2 transition-colors"
            >
              {loading ? '...' : 'Utwórz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
