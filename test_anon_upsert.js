import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase
    .from('accessories')
    .upsert({ accessory_name: 'Pet Cage', weight_g: 30 }, { onConflict: 'accessory_name' })
    .select();
  
  if (error) {
    console.error("Anon Upsert error:", error);
  } else {
    console.log("Anon Upsert result:", data);
  }
}

test();
