# Generated by Django 3.1.1 on 2020-10-15 09:27

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0003_userprofile_phone_nummber'),
    ]

    operations = [
        migrations.RenameField(
            model_name='userprofile',
            old_name='phone_nummber',
            new_name='phone_number',
        ),
    ]
