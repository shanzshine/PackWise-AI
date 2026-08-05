import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()
url = os.environ.get('SUPABASE_URL')
key = os.environ.get('SUPABASE_SERVICE_KEY')
supabase = create_client(url, key)

response = supabase.table('product_analyses').select('*').order('created_at', desc=True).limit(5).execute()
for r in response.data:
    print(f"Analysis ID: {r.get('id')}, img_url: {r.get('image_url')}")
