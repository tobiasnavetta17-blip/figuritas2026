import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pglklqrykhrhsbcitibi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnbGtscXJ5a2hyaHNiY2l0aWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTIzMTMsImV4cCI6MjA5Mjc4ODMxM30.lk8-mtLkS6ukPAM-iW-NRUJl0cWGME8eW9XEl-aHgs4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)