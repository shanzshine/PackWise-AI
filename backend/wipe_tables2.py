import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()
url = os.environ.get('SUPABASE_URL')
key = os.environ.get('SUPABASE_SERVICE_KEY')
supabase = create_client(url, key)

print("Deleting all rows from product_analyses...")
res2 = supabase.table('product_analyses').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
print(f"Deleted product_analyses: {len(res2.data)} rows.")
