from django.urls import path

from .views import (
    CSRFTokenView,
    RegisterView,
    LoginView,
    LogoutView,
    CurrentUserView,
    ProfileView,
    ChangePasswordView,
)


urlpatterns = [
    path(
        "csrf/",
        CSRFTokenView.as_view(),
    ),
    path(
        "register/",
        RegisterView.as_view(),
    ),
    path(
        "login/",
        LoginView.as_view(),
    ),
    path(
        "logout/",
        LogoutView.as_view(),
    ),
    path(
        "me/",
        CurrentUserView.as_view(),
    ),
    path(
        "profile/",
        ProfileView.as_view(),
    ),
    path(
        "change-password/",
        ChangePasswordView.as_view(),
    ),
]