import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()
url = os.environ.get('SUPABASE_URL')
key = os.environ.get('SUPABASE_SERVICE_KEY')
supabase = create_client(url, key)

try:
    res1 = supabase.table('approval').select('req_id', count='exact').limit(1).execute()
    print(f"approval count: {res1.count}")
except Exception as e:
    print("Error fetching approval:", e)

try:
    res2 = supabase.table('product_analyses').select('id', count='exact').limit(1).execute()
    print(f"product_analyses count: {res2.count}")
except Exception as e:
    print("Error fetching product_analyses:", e)
