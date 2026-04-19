import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dwrqqzncjfdbngtjleqg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3cnFxem5jamZkYm5ndGpsZXFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MDIzNzYsImV4cCI6MjA5MjE3ODM3Nn0.Z0qcokP8Ifj8kv4NdqxUpBhsjUJfGa8XZ-4xZknswb8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
