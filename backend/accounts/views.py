from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect

from rest_framework import generics, permissions, status
from rest_framework.parsers import (
    JSONParser,
    FormParser,
    MultiPartParser,
)
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import UserProfile
from .serializers import (
    ChangePasswordSerializer,
    RegisterSerializer,
    UserSerializer,
    UserProfileSerializer,
)


class CSRFTokenView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({
            "csrfToken": get_token(request)
        })


@method_decorator(csrf_protect, name="dispatch")
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        return Response(
            {
                "message": "Registration successful.",
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


@method_decorator(csrf_protect, name="dispatch")
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = str(
            request.data.get("username", "")
        ).strip()

        password = request.data.get("password", "")

        if not username or not password:
            return Response(
                {
                    "error": (
                        "Username and password are required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(
            request,
            username=username,
            password=password,
        )

        if user is None:
            return Response(
                {
                    "error": "Invalid username or password."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        login(request, user)

        return Response({
            "message": "Login successful.",
            "user": UserSerializer(user).data,
            "csrfToken": get_token(request),
            "redirect": (
                "/admin/dashboard"
                if user.is_staff
                else "/"
            ),
        })


class LogoutView(APIView):
    permission_classes = [
        permissions.IsAuthenticated
    ]

    def post(self, request):
        logout(request)

        return Response({
            "message": "Logged out successfully."
        })


class CurrentUserView(APIView):
    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get(self, request):
        return Response({
            "user": UserSerializer(request.user).data
        })


@method_decorator(csrf_protect, name="dispatch")
class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer

    permission_classes = [
        permissions.IsAuthenticated
    ]

    parser_classes = [
        JSONParser,
        FormParser,
        MultiPartParser,
    ]

    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(
            user=self.request.user
        )

        return profile


class ChangePasswordView(APIView):
    permission_classes = [
        permissions.IsAuthenticated
    ]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={"request": request},
        )

        serializer.is_valid(raise_exception=True)

        user = request.user

        if not user.check_password(
            serializer.validated_data["old_password"]
        ):
            return Response(
                {
                    "error": (
                        "Current password is incorrect."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(
            serializer.validated_data["new_password"]
        )

        user.save()
        logout(request)

        return Response({
            "message": (
                "Password changed successfully. "
                "Please log in again."
            )
        })