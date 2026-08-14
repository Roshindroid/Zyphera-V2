from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Q, Sum
from django.shortcuts import get_object_or_404

from django.contrib.auth.hashers import check_password
from .models import User, SellerAdditionalDetails, Category, Service, Cart, CartItem, PostRequest, ServiceLocation, Review
from .serializers import (
    RegisterSerializer, UserSerializer, CategorySerializer, ServiceSerializer,
    BookingSerializer, CartItemSerializer, SellerSerializer, ServiceLocationSerializer, ReviewSerializer
)
from .utils import haversine, calculate_travel_fee
from bookings.models import Booking


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        identifier = request.data.get('username')
        password = request.data.get('password')

        user_obj = User.objects.filter(Q(username=identifier) | Q(email=identifier)).first()
        user = None
        if user_obj:
            user = authenticate(request, username=user_obj.username, password=password)

        if user:
            if user.role == 'seller':
                details = SellerAdditionalDetails.objects.filter(user=user).first()
                if details and not details.is_approved:
                    return Response({'error': 'Your account is pending admin approval.'}, status=status.HTTP_403_FORBIDDEN)
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            })
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    def post(self, request):
        try:
            token = RefreshToken(request.data.get('refresh'))
            token.blacklist()
            return Response({'message': 'Logged out successfully'})
        except Exception:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        user = request.user
        data = request.data
        user.first_name = data.get('full_name', user.first_name)
        user.email = data.get('email', user.email)
        user.phone = data.get('phone', user.phone)
        user.location = data.get('location', user.location)
        if 'latitude' in data:
            user.latitude = data.get('latitude')
        if 'longitude' in data:
            user.longitude = data.get('longitude')
        if 'place_id' in data:
            user.place_id = data.get('place_id')
        user.save()

        if user.role == 'seller':
            details, _ = SellerAdditionalDetails.objects.get_or_create(user=user, defaults={'description': ''})
            details.experience = int(data.get('experience', details.experience))
            details.description = data.get('bio', details.description)
            if 'business_address' in data:
                details.business_address = data.get('business_address')
            if 'business_lat' in data:
                details.business_lat = data.get('business_lat')
            if 'business_lng' in data:
                details.business_lng = data.get('business_lng')
            details.save()

        return Response(UserSerializer(user).data)


class CategoryListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ServiceListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ServiceSerializer

    def get_queryset(self):
        qs = Service.objects.filter(
            is_active=True,
            seller__selleradditionaldetails__is_approved=True,
            seller__selleradditionaldetails__is_available=True,
        ).select_related('category', 'seller')

        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(Q(category__slug=category) | Q(category__name__iexact=category))

        featured = self.request.query_params.get('featured')
        if featured:
            return qs.order_by('-created_at')[:6]

        return qs.order_by('-created_at')


class NearbyServicesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            buyer_lat = float(request.query_params.get('lat'))
            buyer_lng = float(request.query_params.get('lng'))
        except (TypeError, ValueError):
            return Response({'error': 'lat and lng query params are required.'}, status=status.HTTP_400_BAD_REQUEST)

        services = Service.objects.filter(
            is_active=True,
            seller__selleradditionaldetails__is_approved=True,
            seller__selleradditionaldetails__is_available=True,
            location_data__isnull=False,
        ).select_related('category', 'seller', 'location_data')

        category = request.query_params.get('category')
        if category:
            services = services.filter(
                Q(category__slug=category) | Q(category__name__iexact=category)
            )

        results = []
        for service in services:
            loc = service.location_data
            distance = haversine(buyer_lat, buyer_lng, loc.latitude, loc.longitude)
            if distance > float(loc.radius_km):
                continue
            travel_fee = calculate_travel_fee(distance, loc)
            display_price = service.price + travel_fee + loc.platform_fee
            results.append({
                'id': service.id,
                'title': service.title,
                'description': service.description,
                'price': str(service.price),
                'price_unit': service.price_unit,
                'category': {'id': service.category.id, 'name': service.category.name, 'icon_class': service.category.icon_class} if service.category else None,
                'seller_name': service.seller.first_name or service.seller.username,
                'distance_km': round(distance, 1),
                'travel_fee': str(travel_fee),
                'platform_fee': str(loc.platform_fee),
                'display_price': str(display_price),
                'is_free_travel': travel_fee == 0,
                'location_data': {
                    'address': loc.address,
                    'latitude': float(loc.latitude),
                    'longitude': float(loc.longitude),
                    'radius_km': loc.radius_km,
                },
            })

        results.sort(key=lambda x: x['distance_km'])
        return Response(results)


class AvailableSellersView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = SellerSerializer

    def get_queryset(self):
        return User.objects.filter(
            role='seller',
            selleradditionaldetails__is_approved=True,
            selleradditionaldetails__is_available=True,
        ).select_related('selleradditionaldetails')


class AboutStatsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        total_users = User.objects.count()
        return Response({
            'total_users_count': total_users,
            'users_formatted': f"{total_users // 1000}K+" if total_users >= 1000 else str(total_users),
            'pros_count': SellerAdditionalDetails.objects.filter(is_approved=True).count(),
            'category_count': Category.objects.count(),
            'avg_rating': 4.8,
        })


class PostRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        from django.core.mail import send_mail
        from django.conf import settings as django_settings

        title = request.data.get('title')
        details = request.data.get('details')
        location = request.data.get('location')
        recipient_id = request.data.get('recipient')

        recipient = None
        target_email = getattr(django_settings, 'DEFAULT_FROM_EMAIL', 'admin@zyphera.com')
        if recipient_id and str(recipient_id) != 'admin':
            recipient = get_object_or_404(User, id=recipient_id)
            target_email = recipient.email

        PostRequest.objects.create(
            sender=request.user if request.user.is_authenticated else None,
            recipient=recipient,
            title=title,
            details=details,
            location=location,
        )

        subject = f"New Service Request: {title}"
        body = f"Hello,\n\nYou have received a new service request on Zyphera.\n\nTitle: {title}\nLocation: {location}\nDetails: {details}\n\nPlease log in to your dashboard to view more details."
        send_mail(subject, body, getattr(django_settings, 'DEFAULT_FROM_EMAIL', 'noreply@zyphera.com'), [target_email], fail_silently=True)

        return Response({'status': 'success'}, status=status.HTTP_201_CREATED)


# --- Cart ---

class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        items = cart.items.select_related('service', 'service__category', 'service__seller')
        serializer = CartItemSerializer(items, many=True, context={'request': request})
        total = sum(item.service.price for item in items)
        return Response({'items': serializer.data, 'total_price': str(total), 'count': items.count()})

    def post(self, request):
        service_id = request.data.get('service_id')
        service = get_object_or_404(Service, pk=service_id, is_active=True)
        cart, _ = Cart.objects.get_or_create(user=request.user)
        _, created = CartItem.objects.get_or_create(cart=cart, service=service)
        return Response({'status': 'added' if created else 'exists'})


class CartItemDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        item = get_object_or_404(CartItem, pk=pk, cart__user=request.user)
        item.delete()
        return Response({'status': 'removed'})


class CartClearView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart.items.all().delete()
        return Response({'status': 'cleared'})



# --- Seller ---

class SellerDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'seller':
            return Response({'error': 'Forbidden'}, status=403)
        details = get_object_or_404(SellerAdditionalDetails, user=request.user)
        total_earnings = Booking.objects.filter(service__seller=request.user, status='completed').aggregate(Sum('total_price'))['total_price__sum'] or 0
        active_services = Service.objects.filter(seller=request.user, is_active=True).count()
        pending_requests = Booking.objects.filter(service__seller=request.user, status='pending').count()
        recent_bookings = Booking.objects.filter(service__seller=request.user).select_related('buyer', 'service').order_by('-created_at')[:5]
        return Response({
            'stats': {
                'total_earnings': str(total_earnings),
                'active_services_count': active_services,
                'pending_requests_count': pending_requests,
                'is_available': details.is_available,
                'avg_rating': 4.9,
            },
            'recent_bookings': BookingSerializer(recent_bookings, many=True).data,
        })


class SellerServicesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'seller':
            return Response({'error': 'Forbidden'}, status=403)
        services = Service.objects.filter(seller=request.user).select_related('category', 'location_data').order_by('-created_at')
        return Response(ServiceSerializer(services, many=True, context={'request': request}).data)

    def post(self, request):
        if request.user.role != 'seller':
            return Response({'error': 'Forbidden'}, status=403)
        data = request.data.copy()
        category_id = data.get('category_id') or data.get('category')
        service = Service.objects.create(
            seller=request.user,
            title=data.get('title'),
            description=data.get('description'),
            price=data.get('price'),
            price_unit=data.get('price_unit', 'hr'),
            category_id=category_id or None,
            image=request.FILES.get('image'),
        )
        # create ServiceLocation if coordinates provided
        if data.get('latitude') and data.get('longitude'):
            ServiceLocation.objects.create(
                service=service,
                address=data.get('address', ''),
                latitude=float(data.get('latitude')),
                longitude=float(data.get('longitude')),
                radius_km=float(data.get('radius_km', 10)),
                free_radius_km=float(data.get('free_radius_km', 2)),
                price_per_km=data.get('price_per_km', 0),
                platform_fee=data.get('platform_fee', 0),
                peak_hour_pct=float(data.get('peak_hour_pct', 0)),
                weekend_pct=float(data.get('weekend_pct', 0)),
                emergency_fee=data.get('emergency_fee', 0),
            )
        return Response({'status': 'created', 'id': service.id}, status=status.HTTP_201_CREATED)


class ToggleServiceStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        service = get_object_or_404(Service, pk=pk)
        if service.seller != request.user and request.user.role not in User.ADMIN_ROLES:
            return Response({'error': 'Forbidden'}, status=403)
        active = request.data.get('active')
        service.is_active = str(active).lower() == 'true' if active is not None else not service.is_active
        service.save()
        return Response({'is_active': service.is_active})


class ToggleAvailabilityView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        details = get_object_or_404(SellerAdditionalDetails, user=request.user)
        available = request.data.get('available')
        details.is_available = str(available).lower() == 'true' if available is not None else not details.is_available
        details.save()
        return Response({'is_available': details.is_available})


class SellerBookingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'seller':
            return Response({'error': 'Forbidden'}, status=403)
        status_filter = request.query_params.get('status')
        qs = Booking.objects.filter(service__seller=request.user).select_related('buyer', 'service', 'service__category').order_by('-created_at')
        if status_filter and status_filter != 'all':
            qs = qs.filter(status=status_filter)
        return Response(BookingSerializer(qs, many=True).data)


class UpdateBookingStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        booking = get_object_or_404(Booking, pk=pk, service__seller=request.user)
        new_status = request.data.get('status')
        if new_status in ['accepted', 'completed', 'cancelled']:
            booking.status = new_status
            booking.save()
        return Response(BookingSerializer(booking).data)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        current = request.data.get('current_password')
        new = request.data.get('new_password')
        if not check_password(current, user.password):
            return Response({'error': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
        if len(new) < 8:
            return Response({'error': 'New password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new)
        user.save()
        return Response({'message': 'Password updated successfully.'})


class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        password = request.data.get('password')
        if not check_password(password, user.password):
            return Response({'error': 'Incorrect password.'}, status=status.HTTP_400_BAD_REQUEST)
        user.delete()
        return Response({'message': 'Account deleted.'}, status=status.HTTP_204_NO_CONTENT)


# --- Buyer Bookings ---

class ServiceLocationUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        service = get_object_or_404(Service, pk=pk, seller=request.user)
        data = request.data
        loc, _ = ServiceLocation.objects.get_or_create(service=service, defaults={
            'address': '', 'latitude': 0, 'longitude': 0
        })
        float_fields = ['latitude', 'longitude', 'radius_km', 'free_radius_km', 'peak_hour_pct', 'weekend_pct']
        other_fields = ['address', 'price_per_km', 'platform_fee', 'emergency_fee']

        for field in float_fields:
            if field in data and data[field] is not None and data[field] != '':
                setattr(loc, field, float(data[field]))
        for field in other_fields:
            if field in data and data[field] is not None:
                setattr(loc, field, data[field])

        loc.save()
        return Response(ServiceLocationSerializer(loc).data)


class BuyerBookingsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BookingSerializer

    def get_queryset(self):
        return Booking.objects.filter(buyer=self.request.user).select_related('service', 'service__category').order_by('-created_at')


class ServiceDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        service = get_object_or_404(
            Service.objects.select_related('category', 'seller', 'seller__selleradditionaldetails', 'location_data'),
            pk=pk, is_active=True
        )
        reviews = service.reviews.select_related('buyer').order_by('-created_at')
        avg = round(sum(r.rating for r in reviews) / len(reviews), 1) if reviews else None
        seller = service.seller
        details = SellerAdditionalDetails.objects.filter(user=seller).first()
        return Response({
            **ServiceSerializer(service, context={'request': request}).data,
            'reviews': ReviewSerializer(reviews, many=True).data,
            'seller': {
                'id': seller.id,
                'name': seller.first_name or seller.username,
                'bio': details.description if details else '',
                'experience': details.experience if details else 0,
                'business_address': details.business_address if details else None,
            },
        })


class PublicSellerView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        seller = get_object_or_404(User, pk=pk, role='seller')
        details = SellerAdditionalDetails.objects.filter(user=seller, is_approved=True).first()
        if not details:
            return Response({'error': 'Seller not found or not approved.'}, status=status.HTTP_404_NOT_FOUND)
        services = Service.objects.filter(seller=seller, is_active=True).select_related('category')
        all_reviews = Review.objects.filter(service__seller=seller).select_related('buyer')
        avg = round(sum(r.rating for r in all_reviews) / len(all_reviews), 1) if all_reviews else None
        return Response({
            'id': seller.id,
            'name': seller.first_name or seller.username,
            'bio': details.description,
            'experience': details.experience,
            'business_address': details.business_address,
            'avg_rating': avg,
            'review_count': all_reviews.count(),
            'services': ServiceSerializer(services, many=True, context={'request': request}).data,
        })


class ReviewCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from bookings.models import Booking
        booking_id = request.data.get('booking_id')
        booking = get_object_or_404(Booking, pk=booking_id, buyer=request.user, status='completed')
        if hasattr(booking, 'review'):
            return Response({'error': 'You have already reviewed this booking.'}, status=status.HTTP_400_BAD_REQUEST)
        rating = int(request.data.get('rating', 0))
        if not 1 <= rating <= 5:
            return Response({'error': 'Rating must be between 1 and 5.'}, status=status.HTTP_400_BAD_REQUEST)
        review = Review.objects.create(
            booking=booking,
            service=booking.service,
            buyer=request.user,
            rating=rating,
            comment=request.data.get('comment', ''),
        )
        return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)


class ServiceReviewsView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ReviewSerializer

    def get_queryset(self):
        return Review.objects.filter(service_id=self.kwargs['pk']).select_related('buyer').order_by('-created_at')
