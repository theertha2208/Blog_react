
from django.urls import path

from .views import (
    CategoryListView,
    PublicPostListView,
    PublicPostDetailView,
    MyPostListView,
    CreatePostView,
    MyPostDetailView,
    PublicCommentListView,
    CreateCommentView,
    TogglePostLikeView,
    PublicAuthorDetailView,
    PublicAuthorPostsView,
)


urlpatterns = [
    # Categories
    path(
        "categories/",
        CategoryListView.as_view(),
    ),

    # Public Blog Posts
    path(
        "posts/",
        PublicPostListView.as_view(),
    ),

    path(
        "posts/<int:pk>/",
        PublicPostDetailView.as_view(),
    ),

    # User Blog Posts
    path(
        "my-posts/",
        MyPostListView.as_view(),
    ),

    path(
        "my-posts/create/",
        CreatePostView.as_view(),
    ),

    path(
        "my-posts/<int:pk>/",
        MyPostDetailView.as_view(),
    ),

    # Comments
    path(
        "posts/<int:post_id>/comments/",
        PublicCommentListView.as_view(),
    ),

    path(
        "posts/<int:post_id>/comments/create/",
        CreateCommentView.as_view(),
    ),

    # Like and Unlike
    path(
        "posts/<int:post_id>/like/",
        TogglePostLikeView.as_view(),
        name="toggle-post-like",
    ),

    # Public Author Profiles
    path(
        "authors/<int:pk>/",
        PublicAuthorDetailView.as_view(),
        name="public-author-detail",
    ),

    path(
        "authors/<int:pk>/posts/",
        PublicAuthorPostsView.as_view(),
        name="public-author-posts",
    ),
]
