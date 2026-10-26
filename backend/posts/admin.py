
from django.contrib import admin
from django.utils import timezone

from .models import Category, Post, Comment


# --------------------------------------------------
# CATEGORY ADMIN
# --------------------------------------------------

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "slug",
        "created_at",
    )

    search_fields = (
        "name",
        "description",
    )

    prepopulated_fields = {
        "slug": ("name",),
    }

    ordering = ("name",)


# --------------------------------------------------
# BLOG POST ADMIN
# --------------------------------------------------

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "title",
        "author",
        "category",
        "approval_status",
        "is_published",
        "created_at",
    )

    list_filter = (
        "approval_status",
        "is_published",
        "category",
        "created_at",
    )

    search_fields = (
        "title",
        "content",
        "author__username",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    list_select_related = (
        "author",
        "category",
    )

    list_per_page = 20

    actions = [
        "approve_posts",
        "reject_posts",
    ]

    fieldsets = (
        (
            "Blog Information",
            {
                "fields": (
                    "title",
                    "slug",
                    "content",
                    "author",
                    "category",
                    "image",
                )
            },
        ),
        (
            "Publication Status",
            {
                "fields": (
                    "approval_status",
                    "is_published",
                    "rejection_reason",
                )
            },
        ),
        (
            "Dates",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )

    @admin.action(description="Approve selected blog posts")
    def approve_posts(self, request, queryset):

        updated = queryset.update(
            approval_status=Post.APPROVAL_APPROVED,
            is_published=True,
            rejection_reason="",
            updated_at=timezone.now(),
        )

        self.message_user(
            request,
            f"{updated} blog post(s) approved successfully.",
        )

    @admin.action(description="Reject selected blog posts")
    def reject_posts(self, request, queryset):

        updated = queryset.update(
            approval_status=Post.APPROVAL_REJECTED,
            is_published=False,
            updated_at=timezone.now(),
        )

        self.message_user(
            request,
            f"{updated} blog post(s) rejected successfully.",
        )

    def save_model(self, request, obj, form, change):
        # Keep publication status consistent with approval.
        if obj.approval_status == Post.APPROVAL_APPROVED:
            obj.is_published = True
            obj.rejection_reason = ""
        else:
            obj.is_published = False

        super().save_model(request, obj, form, change)


# --------------------------------------------------
# COMMENT ADMIN
# --------------------------------------------------

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "user",
        "post",
        "is_approved",
        "created_at",
    )

    list_filter = (
        "is_approved",
        "created_at",
    )

    search_fields = (
        "user__username",
        "post__title",
        "body",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    list_select_related = (
        "user",
        "post",
    )

    actions = [
        "approve_comments",
        "unapprove_comments",
    ]

    @admin.action(description="Approve selected comments")
    def approve_comments(self, request, queryset):

        updated = queryset.update(
            is_approved=True,
            updated_at=timezone.now(),
        )

        self.message_user(
            request,
            f"{updated} comment(s) approved successfully.",
        )

    @admin.action(description="Unapprove selected comments")
    def unapprove_comments(self, request, queryset):

        updated = queryset.update(
            is_approved=False,
            updated_at=timezone.now(),
        )

        self.message_user(
            request,
            f"{updated} comment(s) unapproved successfully.",
        )
