import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const groupId = searchParams.get('group_id')
  let query = supabase.from('semesters').select('*').order('created_at', { ascending: false })
  if (groupId) query = query.eq('group_id', groupId)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: 'Failed to fetch semesters' }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { name, start_date, end_date, group_id } = body

  // Server-side validation
  if (!name || typeof name !== 'string' || name.trim().length === 0 || name.length > 100)
    return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
  if (!start_date || !end_date || !group_id)
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start_date) || !/^\d{4}-\d{2}-\d{2}$/.test(end_date))
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
  if (typeof group_id !== 'string' || group_id.length > 20)
    return NextResponse.json({ error: 'Invalid group_id' }, { status: 400 })

  const { data, error } = await supabase
    .from('semesters')
    .insert({ name: name.trim(), start_date, end_date, archived: false, group_id })
    .select()
    .single()
  if (error) return NextResponse.json({ error: 'Failed to create semester' }, { status: 500 })
  return NextResponse.json(data)
}
