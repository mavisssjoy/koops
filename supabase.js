const SUPABASE_URL = 'https://rvgwbakqagmywppqeqyn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2Z3diYWtxYWdteXdwcHFlcXluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNzU4OTIsImV4cCI6MjA5Njk1MTg5Mn0.pRH_8tPIq34sJSnaVwWWuRg3QL33wk3hYQkuZ-0e2QE';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);
