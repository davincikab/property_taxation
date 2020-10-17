from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from .views import  get_access_token, lipa_na_mpesa_online, register_urls, call_back, validation, confirmation, lipa_na_mpesa

app_name = "mpesa"

urlpatterns = [
    path("lipa_na_mpesa/<int:plot_no>/<int:amount>/", lipa_na_mpesa, name="lipa-mpesa"),

    # mpesa
    path("get_access_token/", get_access_token, name="mpesa-access-token"),
    path("lipa_online/", lipa_na_mpesa_online, name="mpesa-online"),

    # c2b
    path("c2b/register/", register_urls, name="register-urls"),
    path("c2b/validation/", validation, name="validation"),
    path("c2b/confirmation/", confirmation, name="condfirmation"),
    path("c2b/callback/", call_back, name="callbacks")
]