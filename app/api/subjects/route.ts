import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const semesterId = searchParams.get('semester_id')
  let query = supabase.from('subjects').select('*').order('deadline', { ascending: true })
  if (semesterId) query = query.eq('semester_id', semesterId)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { semester_id, name, deadline } = body

  // Server-side validation
  if (!semester_id || typeof semester_id !== 'string')
    return NextResponse.json({ error: 'Invalid semester_id' }, { status: 400 })
  if (!name || typeof name !== 'string' || name.trim().length === 0 || name.length > 100)
    return NextResponse.json({ error: 'Invalid name (max 100 chars)' }, { status: 400 })
  if (!deadline || !/^\d{4}-\d{2}-\d{2}$/.test(deadline))
    return NextResponse.json({ error: 'Invalid deadline format' }, { status: 400 })

  const { data, error } = await supabase
    .from('subjects')
    .insert({ semester_id, name: name.trim(), deadline })
    .select()
    .single()
  if (error) return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 })
  return NextResponse.json(data)
}
