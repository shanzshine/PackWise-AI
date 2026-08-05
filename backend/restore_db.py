import os
import json
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()
url = os.environ.get('SUPABASE_URL')
key = os.environ.get('SUPABASE_SERVICE_KEY')
supabase = create_client(url, key)

with open('database_backup.json', 'r') as f:
    backup = json.load(f)

print("Restoring app_user...")
if backup.get('app_user'):
    supabase.table('app_user').upsert(backup['app_user']).execute()

print("Restoring product_families...")
if backup.get('product_families'):
    supabase.table('product_families').upsert(backup['product_families']).execute()

print("Restoring accessories...")
if backup.get('accessories'):
    supabase.table('accessories').upsert(backup['accessories']).execute()

print("Restore complete!")
