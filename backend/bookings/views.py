from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404

from accounts.models import Service, ServiceLocation
from accounts.utils import haversine, calculate_travel_fee
from decimal import Decimal
from .models import Booking
from accounts.serializers import BookingSerializer


class BookingCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        service = get_object_or_404(Service, pk=request.data.get('service_id'), is_active=True)
        base_price = service.price
        travel_fee = Decimal('0.00')
        platform_fee = Decimal('0.00')

        buyer_lat = request.data.get('buyer_lat')
        buyer_lng = request.data.get('buyer_lng')

        loc = ServiceLocation.objects.filter(service=service).first()
        if loc and buyer_lat and buyer_lng:
            distance = haversine(float(buyer_lat), float(buyer_lng), loc.latitude, loc.longitude)
            travel_fee = calculate_travel_fee(distance, loc)
            platform_fee = loc.platform_fee

        total_price = base_price + travel_fee + platform_fee

        booking = Booking.objects.create(
            buyer=request.user,
            service=service,
            booking_date=request.data.get('booking_date'),
            base_price=base_price,
            travel_fee=travel_fee,
            platform_fee=platform_fee,
            total_price=total_price,
            address=request.data.get('address', ''),
            buyer_lat=buyer_lat,
            buyer_lng=buyer_lng,
            notes=request.data.get('notes', ''),
        )
        return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)


class BookingCancelView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        booking = get_object_or_404(Booking, pk=pk, buyer=request.user)
        if booking.status == 'completed':
            return Response({'error': 'Cannot cancel a completed booking.'}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = 'cancelled'
        booking.save(update_fields=['status'])
        return Response(BookingSerializer(booking).data, status=status.HTTP_200_OK)


class BuyerBookingsListView(APIView):
    """List bookings for the logged-in buyer."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        status_filter = request.query_params.get('status')

        qs = Booking.objects.filter(buyer=request.user).select_related(
            'service',
            'service__category',
        )

        if status_filter:
            qs = qs.filter(status=status_filter)

        data = BookingSerializer(qs.order_by('-created_at'), many=True).data
        return Response(data, status=status.HTTP_200_OK)


class SellerBookingsListView(APIView):
    """List bookings for the logged-in seller."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        status_filter = request.query_params.get('status')

        qs = Booking.objects.filter(service__seller=request.user).select_related(
            'buyer',
            'service',
            'service__category',
        )

        if status_filter:
            qs = qs.filter(status=status_filter)

        data = BookingSerializer(qs.order_by('-created_at'), many=True).data
        return Response(data, status=status.HTTP_200_OK)


class SellerBookingStatusUpdateView(APIView):
    """Update booking status for the logged-in seller."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        new_status = request.data.get('status')

        if new_status not in {'accepted', 'completed', 'cancelled'}:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

        booking = get_object_or_404(Booking, pk=pk, service__seller=request.user)

        # Enforce basic state transitions (optional but prevents weird updates)
        if booking.status == 'completed':
            return Response({'error': 'Cannot change status of a completed booking.'}, status=status.HTTP_400_BAD_REQUEST)

        if booking.status == 'pending' and new_status in {'accepted', 'cancelled'}:
            booking.status = new_status
        elif booking.status == 'accepted' and new_status == 'completed':
            booking.status = new_status
        elif new_status == 'cancelled':
            # Allow cancelling from accepted too (matches common flows)
            booking.status = new_status
        else:
            return Response({'error': 'Invalid status transition'}, status=status.HTTP_400_BAD_REQUEST)

        booking.save(update_fields=['status'])
        return Response(BookingSerializer(booking).data, status=status.HTTP_200_OK)

