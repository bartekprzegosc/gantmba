import Link from 'next/link'

const GROUPS = [
  { id: '1', label: 'Grupa 1' },
  { id: '2', label: 'Grupa 2' },
  { id: '3', label: 'Grupa 3' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-6">
      <div className="text-center mb-10">
        <div className="text-5xl mb-4">📊</div>
        <h1 className="text-2xl font-bold text-stone-800 tracking-tight">GantMBA</h1>
        <p className="text-stone-400 text-sm mt-2">Wybierz swoją grupę</p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {GROUPS.map(g => (
          <Link
            key={g.id}
            href={`/grupa/${g.id}`}
            className="bg-white border border-stone-200 hover:border-amber-400 hover:shadow-sm rounded-2xl px-6 py-4 flex items-center justify-between transition-all group"
          >
            <span className="font-semibold text-stone-700 group-hover:text-stone-900">{g.label}</span>
            <span className="text-stone-300 group-hover:text-amber-400 transition-colors">→</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
