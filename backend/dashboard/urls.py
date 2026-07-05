from django.urls import path
from .views import (
    AdminStatsView, AdminUsersView, AdminSellerApprovalsView,
    AdminServicesView, AdminCategoriesView, AdminBookingsView, AdminRequestsView,
)

urlpatterns = [
    path('stats/', AdminStatsView.as_view()),
    path('users/', AdminUsersView.as_view()),
    path('users/<int:pk>/', AdminUsersView.as_view()),
    path('approvals/', AdminSellerApprovalsView.as_view()),
    path('approvals/<int:pk>/approve/', AdminSellerApprovalsView.as_view()),
    path('approvals/<int:pk>/reject/', AdminSellerApprovalsView.as_view()),
    path('services/', AdminServicesView.as_view()),
    path('services/<int:pk>/', AdminServicesView.as_view()),
    path('categories/', AdminCategoriesView.as_view()),
    path('categories/<int:pk>/', AdminCategoriesView.as_view()),
    path('bookings/', AdminBookingsView.as_view()),
    path('requests/', AdminRequestsView.as_view()),
]
