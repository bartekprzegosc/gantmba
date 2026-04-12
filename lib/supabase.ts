import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Semester = {
  id: string
  name: string
  start_date: string
  end_date: string
  archived: boolean
  group_id: string
  created_at: string
}

export type Subject = {
  id: string
  semester_id: string
  name: string
  deadline: string
  created_at: string
}
