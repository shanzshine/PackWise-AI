import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase.from('accessories').select('*');
  if (error) {
    console.error("accessories query error:", error.message);
  } else {
    console.log("current accessories in db:", data);
  }
}

check();
