// Supabase public client configuration.
// Publishable/anon key aman digunakan di frontend.
// JANGAN pernah taruh service_role key di sini.

const SUPABASE_URL = "https://hnijgddpntondnatludu.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_CYpO9GQZftYfmQc7YhCtTg_YO2JAXuq";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);