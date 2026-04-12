import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const semesterId = searchParams.get('semester_id')
  let query = supabase.from('subjects').select('*').order('deadline', { ascending: true })
  if (semesterId) query = query.eq('semester_id', semesterId)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { semester_id, name, deadline } = body
  if (!semester_id || !name || !deadline)
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const { data, error } = await supabase
    .from('subjects')
    .insert({ semester_id, name, deadline })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
