
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.shortcuts import get_object_or_404

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.serializers import UserSerializer
from posts.models import Category, Comment, Post
from posts.serializers import (
    CategorySerializer,
    CommentSerializer,
    PostSerializer,
)

User = get_user_model()


class IsAdminUser(permissions.BasePermission):
    message = "Admin access is required."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )


class DashboardStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response({
            "total_users": User.objects.count(),
            "total_posts": Post.objects.count(),
            "pending_posts": Post.objects.filter(
                approval_status=Post.APPROVAL_PENDING
            ).count(),
            "approved_posts": Post.objects.filter(
                approval_status=Post.APPROVAL_APPROVED
            ).count(),
            "rejected_posts": Post.objects.filter(
                approval_status=Post.APPROVAL_REJECTED
            ).count(),
            "total_categories": Category.objects.count(),
            "total_comments": Comment.objects.count(),
            "pending_comments": Comment.objects.filter(
                is_approved=False
            ).count(),
        })


class AdminPostListView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = (
            Post.objects.select_related(
                "author", "category"
            )
            .order_by("-created_at")
        )

        approval = self.request.query_params.get(
            "status", ""
        ).strip()

        search = self.request.query_params.get(
            "search", ""
        ).strip()

        if approval:
            queryset = queryset.filter(
                approval_status=approval
            )

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(author__username__icontains=search)
            )

        return queryset


class AdminPostDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = PostSerializer
    permission_classes = [IsAdminUser]

    queryset = Post.objects.select_related(
        "author", "category"
    )


class ApprovePostView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk)

        post.approval_status = Post.APPROVAL_APPROVED
        post.is_published = True
        post.rejection_reason = ""
        post.save()

        return Response({
            "message": "Post approved successfully.",
            "post": PostSerializer(
                post,
                context={"request": request},
            ).data,
        })


class RejectPostView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk)

        reason = str(
            request.data.get("reason", "")
        ).strip()

        if not reason:
            return Response(
                {"error": "A rejection reason is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        post.approval_status = Post.APPROVAL_REJECTED
        post.is_published = False
        post.rejection_reason = reason
        post.save()

        return Response({
            "message": "Post rejected.",
            "post": PostSerializer(
                post,
                context={"request": request},
            ).data,
        })


class AdminCategoryListCreateView(
    generics.ListCreateAPIView
):
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUser]
    pagination_class = None

    queryset = Category.objects.all().order_by("name")


class AdminCategoryDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUser]

    queryset = Category.objects.all()


class AdminCommentListView(generics.ListAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = (
            Comment.objects.select_related(
                "user", "post"
            )
            .order_by("-created_at")
        )

        pending = self.request.query_params.get(
            "pending", ""
        ).lower()

        if pending == "true":
            queryset = queryset.filter(is_approved=False)

        return queryset


class AdminCommentDetailView(
    generics.RetrieveDestroyAPIView
):
    serializer_class = CommentSerializer
    permission_classes = [IsAdminUser]

    queryset = Comment.objects.select_related(
        "user", "post"
    )


class ApproveCommentView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        comment = get_object_or_404(Comment, pk=pk)

        comment.is_approved = True
        comment.save(
            update_fields=[
                "is_approved",
                "updated_at",
            ]
        )

        return Response({
            "message": "Comment approved."
        })


class UnapproveCommentView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        comment = get_object_or_404(Comment, pk=pk)

        comment.is_approved = False
        comment.save(
            update_fields=[
                "is_approved",
                "updated_at",
            ]
        )

        return Response({
            "message": "Comment hidden."
        })


class AdminUserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return User.objects.all().order_by(
            "-date_joined"
        )


class AdminUserDetailView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    queryset = User.objects.all()


class ToggleUserActiveView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk)

        if user.pk == request.user.pk:
            return Response(
                {"error": "You cannot deactivate yourself."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user.is_superuser:
            return Response(
                {"error": "Superusers cannot be deactivated here."},
                status=status.HTTP_403_FORBIDDEN,
            )

        user.is_active = not user.is_active
        user.save(update_fields=["is_active"])

        return Response({
            "message": "User status updated.",
            "is_active": user.is_active,
        })
