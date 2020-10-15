from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.views.generic.base import TemplateView
from django.views.generic.edit import FormView, CreateView
from django.contrib.auth.mixins import LoginRequiredMixin

from django.forms.models import model_to_dict

from .forms import UserCreateForm, ProfileForm, UserDetailsForm
from .models import UserProfile, User

class ProfileCreateView(LoginRequiredMixin, FormView):
    login_url = "/user/login/"
    model = UserProfile
    form_class = ProfileForm
    template_name = "user/create_profile.html"
    success_url = "/user/account/"     

    def get_initial(self):  
        user = User.objects.get(username = self.request.user.username)
        try:
            profile = UserProfile.objects.get(user=self.request.user)

            profile = {**model_to_dict(profile), **model_to_dict(user)}
        except UserProfile.DoesNotExist:
            profile = model_to_dict(user)
        
        return profile

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context
    
    def form_valid(self, form):
        profile = form.save(commit=False)

        try:
            profile = UserProfile.objects.get(user=self.request.user)
            form = ProfileForm(self.request.POST or None, instance=profile)
            form.save()
        except UserProfile.DoesNotExist:
            profile.user = self.request.user
            profile.save()

        print('Valid')
        user_details = self.request.user

        from operator import itemgetter
        first_name, last_name, surname = itemgetter('first_name', 'last_name', 'surname')(self.request.POST)

        user_details.first_name = first_name
        user_details.last_name = last_name
        user_details.surname = surname

        user_details.save()

        return redirect(self.success_url)
    
    def form_invalid(self, form):
        print(form)
        print(form.errors)
        return HttpResponse("Invalid data")


class UserCreateView(FormView):
    model = User
    template_name = "user/register.html"
    form_class= UserCreateForm
    success_url = "/user/login/"

    def form_valid(self, form):
        form.save()
        return redirect(self.success_url)


class ProfileView(LoginRequiredMixin, TemplateView):
    login_url = '/user/login/' 
    template_name = "user/user_profile.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        try:
            context["profile"] = UserProfile.objects.get(user = self.request.user)
        except UserProfile.DoesNotExist:
            context["profile"] = {}
        
        print(context['profile'])
        return context
    


