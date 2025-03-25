

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_rename_front_note_title'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Pet',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('pet_type', models.CharField(choices=[('cat', 'Cat'), ('fish', 'Fish'), ('turtle', 'Turtle'), ('dog', 'Dog'), ('bunny', 'Bunny'), ('hamster', 'Hamster'), ('reptile', 'Reptile')], max_length=20)),
                ('stat', models.IntegerField(default=50)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='pet', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
