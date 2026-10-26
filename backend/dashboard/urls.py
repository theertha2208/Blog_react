
from django.urls import path

from .views import (
    DashboardStatsView,
    AdminPostListView,
    AdminPostDetailView,
    ApprovePostView,
    RejectPostView,
    AdminCategoryListCreateView,
    AdminCategoryDetailView,
    AdminCommentListView,
    AdminCommentDetailView,
    ApproveCommentView,
    UnapproveCommentView,
    AdminUserListView,
    AdminUserDetailView,
    ToggleUserActiveView,
)

urlpatterns = [
    path("stats/", DashboardStatsView.as_view()),

    path("posts/", AdminPostListView.as_view()),
    path("posts/<int:pk>/", AdminPostDetailView.as_view()),
    path("posts/<int:pk>/approve/", ApprovePostView.as_view()),
    path("posts/<int:pk>/reject/", RejectPostView.as_view()),

    path(
        "categories/",
        AdminCategoryListCreateView.as_view(),
    ),
    path(
        "categories/<int:pk>/",
        AdminCategoryDetailView.as_view(),
    ),

    path("comments/", AdminCommentListView.as_view()),
    path(
        "comments/<int:pk>/",
        AdminCommentDetailView.as_view(),
    ),
    path(
        "comments/<int:pk>/approve/",
        ApproveCommentView.as_view(),
    ),
    path(
        "comments/<int:pk>/unapprove/",
        UnapproveCommentView.as_view(),
    ),

    path("users/", AdminUserListView.as_view()),
    path("users/<int:pk>/", AdminUserDetailView.as_view()),
    path(
        "users/<int:pk>/toggle-active/",
        ToggleUserActiveView.as_view(),
    ),
]
