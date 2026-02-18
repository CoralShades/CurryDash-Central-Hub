/**
 * Placeholder for Supabase generated types.
 * Replace this with the output of `supabase gen types typescript` after migrations.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: Record<string, never>
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: 'admin' | 'developer' | 'qa' | 'stakeholder'
    }
  }
}

export type UserRole = Database['public']['Enums']['user_role']
