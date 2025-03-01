import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hiokebybfeuerkrmmrdv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpb2tlYnliZmV1ZXJrcm1tcmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0NjU1ODksImV4cCI6MjA1NjA0MTU4OX0.t-xG6DDjpFOqlNBUrZQumXtuYJ1ZeIbX1rFFu2ij1x4'
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase; 