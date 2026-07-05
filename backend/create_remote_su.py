import os
import django
from django.core.management import call_command

# 1. PASTE YOUR EXACT EXTERNAL DATABASE URL FROM RENDER HERE
# Make sure it starts with postgres:// or postgresql://
REMOTE_DB_URL = "postgresql://zyphera_db_user:xuRGg3gmQfVmOdMLCu6FaVZqtVoP6mkM@dpg-d959b8faqgkc73ervp50-a.oregon-postgres.render.com/zyphera_db"

# Set the environment variable purely inside this script
os.environ['DATABASE_URL'] = REMOTE_DB_URL
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'zyphera.settings')

print("Connecting to remote database...")
try:
    django.setup()
    print("Successfully connected! Now creating superuser:")
    call_command('createsuperuser')
except Exception as e:
    print(f"Failed to connect or create user. Error: {e}")
