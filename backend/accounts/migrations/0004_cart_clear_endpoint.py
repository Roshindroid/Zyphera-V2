"""cart clear endpoint (no DB change)."""

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('accounts', '0003_alter_service_description'),
    ]

    operations = []


