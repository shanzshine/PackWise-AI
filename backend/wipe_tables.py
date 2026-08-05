import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()
url = os.environ.get('SUPABASE_URL')
key = os.environ.get('SUPABASE_SERVICE_KEY')
supabase = create_client(url, key)

print("Deleting all rows from approval_requests...")
res1 = supabase.table('approval_requests').delete().neq('req_id', '000').execute()
print(f"Deleted approval_requests: {len(res1.data)} rows.")

print("Deleting all rows from product_analyses...")
res2 = supabase.table('product_analyses').delete().neq('id', '000').execute()
print(f"Deleted product_analyses: {len(res2.data)} rows.")
