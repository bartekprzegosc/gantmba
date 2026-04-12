import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const groupId = searchParams.get('group_id')
  let query = supabase.from('semesters').select('*').order('created_at', { ascending: false })
  if (groupId) query = query.eq('group_id', groupId)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { name, start_date, end_date, group_id } = body
  if (!name || !start_date || !end_date || !group_id)
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const { data, error } = await supabase
    .from('semesters')
    .insert({ name, start_date, end_date, archived: false, group_id })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
