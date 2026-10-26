
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.shortcuts import get_object_or_404

from rest_framework import generics, permissions, status
from rest_framework.parsers import (
    JSONParser,
    FormParser,
    MultiPartParser,
)
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, Comment, Post, PostLike
from .serializers import (
    AuthorSerializer,
    CategorySerializer,
    CommentSerializer,
    PostSerializer,
)

User = get_user_model()


class CategoryListView(generics.ListAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    queryset = Category.objects.all().order_by("name")


class PublicPostListView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = (
            Post.objects.filter(
                approval_status=Post.APPROVAL_APPROVED,
                is_published=True,
            )
            .select_related(
                "author",
                "author__blog_profile",
                "category",
            )
            .order_by("-created_at")
        )

        search = self.request.query_params.get(
            "search", ""
        ).strip()

        category = self.request.query_params.get(
            "category", ""
        ).strip()

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(content__icontains=search)
                | Q(author__username__icontains=search)
            )

        if category:
            queryset = queryset.filter(
                category__slug=category
            )

        return queryset


class PublicPostDetailView(generics.RetrieveAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]

    queryset = (
        Post.objects.filter(
            approval_status=Post.APPROVAL_APPROVED,
            is_published=True,
        )
        .select_related(
            "author",
            "author__blog_profile",
            "category",
        )
    )


class MyPostListView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Post.objects.filter(author=self.request.user)
            .select_related(
                "author",
                "author__blog_profile",
                "category",
            )
            .order_by("-created_at")
        )


class CreatePostView(generics.CreateAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [
        JSONParser,
        FormParser,
        MultiPartParser,
    ]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class MyPostDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [
        JSONParser,
        FormParser,
        MultiPartParser,
    ]

    def get_queryset(self):
        return (
            Post.objects.filter(author=self.request.user)
            .select_related(
                "author",
                "author__blog_profile",
                "category",
            )
        )


class PublicCommentListView(generics.ListAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        post = get_object_or_404(
            Post,
            pk=self.kwargs["post_id"],
            approval_status=Post.APPROVAL_APPROVED,
            is_published=True,
        )

        return (
            Comment.objects.filter(
                post=post,
                is_approved=True,
            )
            .select_related("user", "post")
            .order_by("-created_at")
        )


class CreateCommentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, post_id):
        post = get_object_or_404(
            Post,
            pk=post_id,
            approval_status=Post.APPROVAL_APPROVED,
            is_published=True,
        )

        serializer = CommentSerializer(
            data={
                "body": request.data.get("body", ""),
            },
            context={"request": request},
        )

        serializer.is_valid(raise_exception=True)

        comment = serializer.save(
            user=request.user,
            post=post,
            is_approved=False,
        )

        return Response(
            {
                "message": "Comment submitted for admin approval.",
                "comment_id": comment.pk,
            },
            status=status.HTTP_201_CREATED,
        )


class TogglePostLikeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, post_id):
        post = get_object_or_404(
            Post,
            pk=post_id,
            approval_status=Post.APPROVAL_APPROVED,
            is_published=True,
        )

        like, created = PostLike.objects.get_or_create(
            post=post,
            user=request.user,
        )

        if created:
            liked = True
            message = "Post liked successfully."
        else:
            like.delete()
            liked = False
            message = "Post unliked successfully."

        return Response(
            {
                "message": message,
                "is_liked": liked,
                "likes_count": post.likes.count(),
            },
            status=status.HTTP_200_OK,
        )


class PublicAuthorDetailView(generics.RetrieveAPIView):
    serializer_class = AuthorSerializer
    permission_classes = [permissions.AllowAny]

    queryset = User.objects.filter(
        is_active=True,
        blog_posts__approval_status=Post.APPROVAL_APPROVED,
        blog_posts__is_published=True,
    ).distinct().select_related("blog_profile")


class PublicAuthorPostsView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        author = get_object_or_404(
            User.objects.filter(
                is_active=True,
                blog_posts__approval_status=Post.APPROVAL_APPROVED,
                blog_posts__is_published=True,
            ).distinct(),
            pk=self.kwargs["pk"],
        )

        return (
            Post.objects.filter(
                author=author,
                approval_status=Post.APPROVAL_APPROVED,
                is_published=True,
            )
            .select_related(
                "author",
                "author__blog_profile",
                "category",
            )
            .order_by("-created_at")
        )
