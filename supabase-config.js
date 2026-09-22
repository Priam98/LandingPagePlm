const SUPABASE_URL = "https://hnijgddpntondnatludu.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_CYpO9GQZftYfmQc7YhCtTg_YO2JAXuq";

window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);