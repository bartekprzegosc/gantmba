import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!id || typeof id !== 'string')
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  const { error } = await supabase.from('subjects').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 })
  return NextResponse.json({ success: true })
}
