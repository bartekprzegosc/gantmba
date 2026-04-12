'use client'

import { useState } from 'react'

interface Props {
  semesterId: string
  onAdded: () => void
}

export default function AddSubjectForm({ semesterId, onAdded }: Props) {
  const [name, setName] = useState('')
  const [deadline, setDeadline] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !deadline) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ semester_id: semesterId, name: name.trim(), deadline }),
      })
      if (!res.ok) throw new Error('Błąd zapisu')
      setName('')
      setDeadline('')
      onAdded()
    } catch {
      setError('Nie udało się dodać. Spróbuj ponownie.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-stone-500 font-medium">Przedmiot</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="np. Finanse korporacyjne"
          className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 w-64 focus:outline-none focus:border-amber-400 bg-white"
          maxLength={100}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-stone-500 font-medium">Deadline</label>
        <input
          type="date"
          value={deadline}
          min={today}
          onChange={e => setDeadline(e.target.value)}
          className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-amber-400 bg-white"
        />
      </div>
      <button
        type="submit"
        disabled={loading || !name.trim() || !deadline}
        className="bg-amber-400 hover:bg-amber-500 disabled:opacity-40 text-white font-semibold text-sm px-5 py-2 rounded-lg transition-colors"
      >
        {loading ? '...' : '+ Dodaj'}
      </button>
      {error && <p className="text-red-500 text-xs w-full">{error}</p>}
    </form>
  )
}
