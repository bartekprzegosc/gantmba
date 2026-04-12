import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  // Whitelist allowed fields — prevent mass assignment
  const allowed: Record<string, unknown> = {}
  if (typeof body.archived === 'boolean') allowed.archived = body.archived
  if (typeof body.name === 'string' && body.name.trim().length > 0 && body.name.length <= 100)
    allowed.name = body.name.trim()
  if (typeof body.start_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.start_date))
    allowed.start_date = body.start_date
  if (typeof body.end_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.end_date))
    allowed.end_date = body.end_date

  if (Object.keys(allowed).length === 0)
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })

  const { data, error } = await supabase
    .from('semesters')
    .update(allowed)
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: 'Failed to update semester' }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { error } = await supabase.from('semesters').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Failed to delete semester' }, { status: 500 })
  return NextResponse.json({ success: true })
}
