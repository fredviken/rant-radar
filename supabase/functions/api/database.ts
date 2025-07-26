import { createClient } from "jsr:@supabase/supabase-js@2"

export const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
)

export type Job = {
  id: string
  query: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
  result?: unknown
  error_message?: string
}