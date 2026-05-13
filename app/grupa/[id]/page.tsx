'use client'

import { useEffect, useState, useCallback } from 'react'
import { use } from 'react'
import GanttChart from '@/components/GanttChart'
import AddSubjectForm from '@/components/AddSubjectForm'
import NewSemesterModal from '@/components/NewSemesterModal'
import { Semester, Subject } from '@/lib/supabase'

interface Props {
  params: Promise<{ id: string }>
}

export default function GrupaPage({ params }: Props) {
  const { id: groupId } = use(params)
  const groupLabel = `Grupa ${groupId}`

  const [semesters, setSemesters] = useState<Semester[]>([])
  const [activeSemester, setActiveSemester] = useState<Semester | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [showNewSemester, setShowNewSemester] = useState(false)
  const [showArchive, setShowArchive] = useState(false)
  const [archiveSemesters, setArchiveSemesters] = useState<Semester[]>([])
  const [archiveSubjects, setArchiveSubjects] = useState<Record<string, Subject[]>>({})
  const [loading, setLoading]   = useState(true)
  const [copied, setCopied]     = useState(false)

  const fetchSemesters = useCallback(async () => {
    const res = await fetch(`/api/semesters?group_id=${groupId}`)
    const data: Semester[] = await res.json()
    setSemesters(data)
    const active = data.find(s => !s.archived) ?? null
    setActiveSemester(active)
    return active
  }, [groupId])

  const fetchSubjects = useCallback(async (semesterId: string) => {
    const res = await fetch(`/api/subjects?semester_id=${semesterId}`)
    const data: Subject[] = await res.json()
    setSubjects(data)
  }, [])

  useEffect(() => {
    async function init() {
      const active = await fetchSemesters()
      if (active) await fetchSubjects(active.id)
      setLoading(false)
    }
    init()
  }, [fetchSemesters, fetchSubjects])

  async function handleDelete(id: string) {
    await fetch(`/api/subjects/${id}`, { method: 'DELETE' })
    if (activeSemester) fetchSubjects(activeSemester.id)
  }

  async function handleArchive() {
    if (!activeSemester) return
    if (!confirm(`Archiwizować semestr "${activeSemester.name}"?`)) return
    await fetch(`/api/semesters/${activeSemester.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archived: true }),
    })
    const active = await fetchSemesters()
    setSubjects([])
    if (active) fetchSubjects(active.id)
  }

  async function loadArchive() {
    const archived = semesters.filter(s => s.archived)
    setArchiveSemesters(archived)
    const map: Record<string, Subject[]> = {}
    await Promise.all(
      archived.map(async s => {
        const res = await fetch(`/api/subjects?semester_id=${s.id}`)
        map[s.id] = await res.json()
      })
    )
    setArchiveSubjects(map)
    setShowArchive(true)
  }

  const archivedCount = semesters.filter(s => s.archived).length

  const MONTHS_PL = [
    'stycznia','lutego','marca','kwietnia','maja','czerwca',
    'lipca','sierpnia','września','października','listopada','grudnia',
  ]

  function generateReminder() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const upcoming = subjects
      .map(s => ({ ...s, date: new Date(s.deadline + 'T00:00:00') }))
      .filter(s => s.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime())

    if (upcoming.length === 0) return null

    const lines = upcoming.map(s => {
      const days = Math.round((s.date.getTime() - today.getTime()) / 86_400_000)
      const dateStr = `${s.date.getDate()} ${MONTHS_PL[s.date.getMonth()]}`
      const daysStr = days === 0 ? 'dziś!' : days === 1 ? 'za 1 dzień' : `za ${days} dni`
      return ` ${s.name}: ${dateStr} (${daysStr})`
    })

    return [
      'Cześć, szybka przypominajka. W najbliższym czasie do zaliczenia i oddania mamy następujące rzeczy:',
      '',
      ...lines,
      '',
      'Pozdrawiam,',
      'Jarvis z GantMBA.vercel.app',
    ].join('\n')
  }

  function handleCopyReminder() {
    const text = generateReminder()
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-400 text-sm">Ładowanie...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="border-b border-stone-100 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <h1 className="text-lg font-bold text-stone-800 tracking-tight">GantMBA</h1>
              <p className="text-xs text-stone-400">{groupLabel} · Terminy zaliczeń</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {archivedCount > 0 && (
              <button
                onClick={loadArchive}
                className="text-xs text-stone-500 hover:text-stone-700 border border-stone-200 rounded-lg px-3 py-1.5 transition-colors"
              >
                Archiwum ({archivedCount})
              </button>
            )}
            {activeSemester && (
              <button
                onClick={handleArchive}
                className="text-xs text-stone-500 hover:text-stone-700 border border-stone-200 rounded-lg px-3 py-1.5 transition-colors"
              >
                Archiwizuj semestr
              </button>
            )}
            {activeSemester && subjects.length > 0 && (
              <button
                onClick={handleCopyReminder}
                className={`text-xs rounded-lg px-3 py-1.5 transition-colors font-medium border ${
                  copied
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
                }`}
              >
                {copied ? '✓ Skopiowano!' : '📋 Kopiuj przypominajkę'}
              </button>
            )}
            <button
              onClick={() => setShowNewSemester(true)}
              className="text-xs bg-stone-800 hover:bg-stone-700 text-white rounded-lg px-3 py-1.5 transition-colors font-medium"
            >
              + Nowy semestr
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {!activeSemester ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🎓</div>
            <h2 className="text-xl font-semibold text-stone-700 mb-2">{groupLabel} — brak aktywnego semestru</h2>
            <p className="text-stone-400 text-sm mb-6">Utwórz semestr, aby zacząć śledzić deadliny</p>
            <button
              onClick={() => setShowNewSemester(true)}
              className="bg-amber-400 hover:bg-amber-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Utwórz pierwszy semestr
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-stone-800">{activeSemester.name}</h2>
              <p className="text-xs text-stone-400 mt-0.5">
                {new Date(activeSemester.start_date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}
                {' — '}
                {new Date(activeSemester.end_date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            <div className="bg-white border border-stone-100 rounded-2xl p-5 mb-6 shadow-sm">
              <p className="text-xs text-stone-400 font-medium uppercase tracking-wider mb-4">Dodaj deadline</p>
              <AddSubjectForm
                semesterId={activeSemester.id}
                onAdded={() => fetchSubjects(activeSemester.id)}
              />
            </div>

            <div className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm">
              <p className="text-xs text-stone-400 font-medium uppercase tracking-wider mb-5">Wykres Gantta</p>
              <GanttChart subjects={subjects} onDelete={handleDelete} />
            </div>
          </>
        )}

        {/* Archive modal */}
        {showArchive && (
          <div className="fixed inset-0 bg-black/30 flex items-start justify-center z-50 overflow-y-auto py-10">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-4xl mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-stone-800">📁 Archiwum — {groupLabel}</h2>
                <button onClick={() => setShowArchive(false)} className="text-stone-400 hover:text-stone-600 text-xl">✕</button>
              </div>
              {archiveSemesters.length === 0 ? (
                <p className="text-stone-400 text-sm">Brak archiwalnych semestrów.</p>
              ) : (
                <div className="space-y-8">
                  {archiveSemesters.map(s => (
                    <div key={s.id}>
                      <h3 className="font-semibold text-stone-700 mb-3">{s.name}</h3>
                      <GanttChart subjects={archiveSubjects[s.id] ?? []} onDelete={() => {}} archived={true} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {showNewSemester && (
        <NewSemesterModal
          groupId={groupId}
          onCreated={async () => {
            const active = await fetchSemesters()
            if (active) fetchSubjects(active.id)
          }}
          onClose={() => setShowNewSemester(false)}
        />
      )}
    </div>
  )
}
