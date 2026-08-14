from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, LogoutView, ProfileView,
    ChangePasswordView, DeleteAccountView,
    CategoryListView, ServiceListView, NearbyServicesView, ServiceDetailView,
    AvailableSellersView, PublicSellerView, AboutStatsView, PostRequestView,
    CartView, CartItemDeleteView, CartClearView,
    SellerDashboardView, SellerServicesView, ToggleServiceStatusView, ToggleAvailabilityView,
    SellerBookingsView, UpdateBookingStatusView,
    ServiceLocationUpdateView,
    BuyerBookingsView,
    ReviewCreateView, ServiceReviewsView,
)

auth_urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('logout/', LogoutView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
]

urlpatterns = [
    path('categories/', CategoryListView.as_view()),
    path('services/', ServiceListView.as_view()),
    path('services/nearby/', NearbyServicesView.as_view()),
    path('services/<int:pk>/', ServiceDetailView.as_view()),
    path('services/<int:pk>/reviews/', ServiceReviewsView.as_view()),
    path('sellers/', AvailableSellersView.as_view()),
    path('sellers/<int:pk>/', PublicSellerView.as_view()),
    path('about/stats/', AboutStatsView.as_view()),
    path('requests/', PostRequestView.as_view()),

    path('profile/', ProfileView.as_view()),
    path('profile/change-password/', ChangePasswordView.as_view()),
    path('profile/delete/', DeleteAccountView.as_view()),

    path('cart/', CartView.as_view()),
    path('cart/remove/<int:pk>/', CartItemDeleteView.as_view()),

    # Clear whole cart
    path('cart/clear/', CartClearView.as_view()),

    path('seller/dashboard/', SellerDashboardView.as_view()),
    path('seller/services/', SellerServicesView.as_view()),
    path('seller/services/<int:pk>/toggle/', ToggleServiceStatusView.as_view()),
    path('seller/services/<int:pk>/location/', ServiceLocationUpdateView.as_view()),
    path('seller/availability/', ToggleAvailabilityView.as_view()),
    path('seller/bookings/', SellerBookingsView.as_view()),
    path('seller/bookings/<int:pk>/status/', UpdateBookingStatusView.as_view()),

    path('buyer/bookings/', BuyerBookingsView.as_view()),

    path('reviews/', ReviewCreateView.as_view()),
]
