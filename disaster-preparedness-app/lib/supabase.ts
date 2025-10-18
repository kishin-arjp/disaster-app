import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// データベース型定義
export interface FamilyLocation {
  id: string
  family_code: string
  member_id: string
  member_name: string
  latitude: number
  longitude: number
  accuracy: number
  address?: string
  status: "safe" | "need_help" | "evacuating" | "unknown"
  message?: string
  battery_level?: number
  updated_at: string
  created_at: string
}

export interface FamilyMember {
  id: string
  family_code: string
  member_name: string
  device_id: string
  is_active: boolean
  last_seen: string
  created_at: string
}
