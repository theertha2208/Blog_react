
import bleach

from django.contrib.auth.models import User
from django.utils.html import strip_tags
from rest_framework import serializers

from .models import Category, Post, Comment


ALLOWED_BLOG_TAGS = [
    "p", "br", "h1", "h2", "h3",
    "strong", "b", "em", "i", "u",
    "ol", "ul", "li", "span",
    "blockquote", "a",
]

ALLOWED_BLOG_ATTRIBUTES = {
    "a": ["href", "title"],
    "ol": ["class"],
    "ul": ["class"],
    "li": ["class", "data-list"],
    "span": ["class"],
}


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "slug",
            "created_at",
        ]


class AuthorSerializer(serializers.ModelSerializer):
    bio = serializers.SerializerMethodField()
    profile_picture_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "bio",
            "profile_picture_url",
        ]

    def get_bio(self, obj):
        profile = getattr(obj, "blog_profile", None)
        return profile.bio if profile else ""

    def get_profile_picture_url(self, obj):
        profile = getattr(obj, "blog_profile", None)

        if not profile or not profile.profile_picture:
            return None

        request = self.context.get("request")

        if request:
            return request.build_absolute_uri(
                profile.profile_picture.url
            )

        return profile.profile_picture.url


class CommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    class Meta:
        model = Comment
        fields = [
            "id",
            "post",
            "username",
            "body",
            "is_approved",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "post",
            "username",
            "is_approved",
            "created_at",
            "updated_at",
        ]

    def validate_body(self, value):
        body = value.strip()

        if len(body) < 3:
            raise serializers.ValidationError(
                "Comment must contain at least 3 characters."
            )

        if len(body) > 2000:
            raise serializers.ValidationError(
                "Comment cannot exceed 2000 characters."
            )

        return body


class PostSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)

    author_name = serializers.CharField(
        source="author.username",
        read_only=True,
    )

    category_name = serializers.CharField(
        source="category.name",
        read_only=True,
    )

    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all()
    )

    image_url = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id",
            "title",
            "slug",
            "content",
            "author",
            "author_name",
            "category",
            "category_name",
            "image",
            "image_url",
            "is_published",
            "approval_status",
            "rejection_reason",
            "likes_count",
            "is_liked",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "slug",
            "author",
            "author_name",
            "category_name",
            "image_url",
            "is_published",
            "approval_status",
            "rejection_reason",
            "likes_count",
            "is_liked",
            "created_at",
            "updated_at",
        ]

    def get_image_url(self, obj):
        if not obj.image:
            return None

        request = self.context.get("request")

        if request:
            return request.build_absolute_uri(
                obj.image.url
            )

        return obj.image.url

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_is_liked(self, obj):
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            return False

        return obj.likes.filter(
            user=request.user
        ).exists()

    def validate_title(self, value):
        title = value.strip()

        if len(title) < 5:
            raise serializers.ValidationError(
                "Blog title must contain at least 5 characters."
            )

        return title

    def validate_content(self, value):
        cleaned = bleach.clean(
            value.strip(),
            tags=ALLOWED_BLOG_TAGS,
            attributes=ALLOWED_BLOG_ATTRIBUTES,
            protocols=[
                "http",
                "https",
                "mailto",
            ],
            strip=True,
            strip_comments=True,
        )

        if len(strip_tags(cleaned).strip()) < 20:
            raise serializers.ValidationError(
                "Blog content must contain at least 20 characters."
            )

        return cleaned

    def create(self, validated_data):
        validated_data["approval_status"] = Post.APPROVAL_PENDING
        validated_data["is_published"] = False
        validated_data["rejection_reason"] = ""

        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data["approval_status"] = Post.APPROVAL_PENDING
        validated_data["is_published"] = False
        validated_data["rejection_reason"] = ""

        return super().update(
            instance,
            validated_data,
        )
