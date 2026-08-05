import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()
url = os.environ.get('SUPABASE_URL')
key = os.environ.get('SUPABASE_SERVICE_KEY')
supabase = create_client(url, key)

response = supabase.table('approval_requests').select('req_id, submitted_at, report_snapshot').order('submitted_at', desc=True).limit(5).execute()
for r in response.data:
    snap = r.get('report_snapshot', {}) or {}
    has_img = 'imageDataUrl' in snap and bool(snap['imageDataUrl'])
    print(f"{r['req_id']}: {r['submitted_at']} has_img={has_img}")
