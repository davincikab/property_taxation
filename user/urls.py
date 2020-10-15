from django.urls import path

# authentication
from django.contrib.auth.views import LoginView, LogoutView
from .views import ProfileView, UserCreateView, ProfileCreateView


# application namspace
app_name = "user"

urlpatterns = [
    path("register/", UserCreateView.as_view(), name="register"),
    path("login/", LoginView.as_view(template_name="user/login.html"), name="login"),
    path("logout/", LogoutView.as_view(template_name="user/logout.html"), name="logout"),

    path("create_profile/", ProfileCreateView.as_view(), name="create-profile"),
    path("account/", ProfileView.as_view(), name="profile")
]   