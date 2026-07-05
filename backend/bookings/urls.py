from django.urls import path
from .views import (
    BookingCreateView,
    BookingCancelView,
    SellerBookingsListView,
    SellerBookingStatusUpdateView,
    BuyerBookingsListView,
)

urlpatterns = [
    path('create/', BookingCreateView.as_view()),
    path('<int:pk>/cancel/', BookingCancelView.as_view()),

    # Seller endpoints (used by frontend/src/pages/seller/Requests.jsx)
    path('seller/bookings/', SellerBookingsListView.as_view()),
    path('seller/bookings/<int:pk>/status/', SellerBookingStatusUpdateView.as_view()),

    # Buyer endpoint (used by frontend/src/pages/buyer/Dashboard.jsx and Bookings.jsx)
    path('buyer/bookings/', BuyerBookingsListView.as_view()),
]

