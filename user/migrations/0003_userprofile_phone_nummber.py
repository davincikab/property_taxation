# Generated by Django 3.1.1 on 2020-10-15 09:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0002_user_is_taxpayer'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='phone_nummber',
            field=models.CharField(max_length=13, null=True, verbose_name='Phone Number'),
        ),
    ]
