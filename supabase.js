const SUPABASE_URL = 'https://rvgwbakqagmywppqeqyn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_NOi3piRzUy8TmX7oDENjng_GMT_zHIg';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);
