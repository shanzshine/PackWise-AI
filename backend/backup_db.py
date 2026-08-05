import os
import json
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()
url = os.environ.get('SUPABASE_URL')
key = os.environ.get('SUPABASE_SERVICE_KEY')
supabase = create_client(url, key)

backup = {}

# Backup users
res_users = supabase.table('users').select('*').execute()
backup['users'] = res_users.data

# Backup product_families
res_pf = supabase.table('product_families').select('*').execute()
backup['product_families'] = res_pf.data

# Backup accessories
res_acc = supabase.table('accessories').select('*').execute()
backup['accessories'] = res_acc.data

with open('database_backup.json', 'w') as f:
    json.dump(backup, f, indent=2)

print("Backup complete!")
