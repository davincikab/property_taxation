from django.db import models
from django.contrib.auth.models import AbstractUser

from PIL import Image

class User(AbstractUser):
    username = models.CharField("Username", max_length=50, unique=True)
    email = models.EmailField("Email", max_length=254)
    first_name = models.CharField("First Name", max_length=50)
    last_name = models.CharField("Last Name", max_length=50)
    surname = models.CharField("Surname", max_length=50)
    id_number = models.BigIntegerField("Id Number", unique=True)
    is_taxpayer = models.BooleanField("Tax Payer", default=False)


    USERNAME_FIELD = 'username'
    EMAIL_FIELD = 'email'
    REQUIRED_FIELDS = ['id_number', 'email']

    def __str__(self):
        return self.username
    
    def get_full_name(self):
        return self.first_name +" " + self.last_name + " " + self.surname
    
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    image = models.ImageField("Profile Picture", upload_to="profile_picture", default="user.png")
    phone_number = models.CharField("Phone Number", max_length=13, null=True)

    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"

    def __str__(self):
        return self.user.username
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        image = Image.open(self.image.path)

        if image.height > 300 or image.width > 300:
            output_size = (300, 300)
            image.thumbnail(output_size)
            image.save(self.image.path)


    # def get_absolute_url(self):
    #     return reverse("_detail", kwargs={"pk": self.pk})
