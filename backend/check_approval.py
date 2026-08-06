import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

supabase = create_client(url, key)

res = supabase.table('approval').select('req_id, sku, sustainability').execute()
for r in res.data:
    print(r)
