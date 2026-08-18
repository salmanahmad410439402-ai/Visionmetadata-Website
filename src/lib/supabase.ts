import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ipkxauigyrlkywlukcex.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlwa3hhdWlneXJsa3l3bHVrY2V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NzAxOTAsImV4cCI6MjA4NjA0NjE5MH0.wiBEqKT0mUW4GUbxHOSJWQxG3l-WujiovbKgg5EqoBk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
