from django.dispatch import receiver
from django.core.signals import post_save
from .models import User, UserProfile

@receiver(sender=User)
def create_pprofile(sender, instance, created,**kwargs):
    if created:
        UserProfile.objects.create(user=instance)
