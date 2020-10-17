from django import forms
from django.contrib.auth.forms import UserCreationForm

from .models import User, UserProfile

class UserCreateForm(UserCreationForm):
    class Meta:
        model = User
        fields = ['username', 'email', 'id_number', 'password1', 'password2']
    
class UserDetailsForm(forms.ModelForm):
    class Meta:
        model = User
        exclude = ['username', 'password1', 'password2']

class ProfileForm(forms.ModelForm):
    first_name = forms.CharField(label="First Name", max_length=50, required=False)
    last_name = forms.CharField(label="Last Name", max_length=50, required=False)
    surname = forms.CharField(label="Surname", max_length=50, required=False)
    email = forms.EmailField(label="Email", required=False)
    phone_number = forms.CharField(
        label="Phone Number", max_length=13, required=False,
        help_text="Phone Number format: 254700111222",
        widget=forms.TextInput(attrs={
            'placeholder':'254700111222',
            'pattern':r'254[0-9]{9}'
        })
    )
    
    class Meta:
        model = UserProfile
        fields = ['image', 'phone_number']