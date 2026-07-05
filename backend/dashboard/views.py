from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Q

from accounts.models import User, SellerAdditionalDetails, Service, Category, PostRequest
from bookings.models import Booking
from accounts.serializers import UserSerializer, ServiceSerializer, BookingSerializer, CategorySerializer


def is_admin(user):
    return user.is_authenticated and (user.role in User.ADMIN_ROLES or user.is_superuser)


class AdminStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Forbidden'}, status=403)
        pending = SellerAdditionalDetails.objects.filter(is_approved=False).select_related('user').order_by('-created_at')[:5]
        return Response({
            'total_users': User.objects.count(),
            'pending_sellers': SellerAdditionalDetails.objects.filter(is_approved=False).count(),
            'active_sellers': SellerAdditionalDetails.objects.filter(is_approved=True).count(),
            'total_bookings': Booking.objects.count(),
            'total_revenue': str(Booking.objects.filter(status='completed').aggregate(Sum('total_price'))['total_price__sum'] or 0),
            'total_services': Service.objects.count(),
            'total_categories': Category.objects.count(),
            'total_requests': PostRequest.objects.count(),
            'latest_pending': [
                {
                    'id': s.pk,
                    'username': s.user.username,
                    'full_name': s.user.first_name or s.user.username,
                    'email': s.user.email,
                    'experience': s.experience,
                    'description': s.description,
                    'phone': s.user.phone,
                    'location': s.user.location,
                    'created_at': s.created_at,
                }
                for s in pending
            ],
        })


class AdminUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Forbidden'}, status=403)
        users = User.objects.all().order_by('-date_joined')
        return Response([
            {
                'id': u.id,
                'username': u.username,
                'full_name': u.first_name or u.username,
                'email': u.email,
                'role': u.role,
                'is_active': u.is_active,
                'date_joined': u.date_joined,
            }
            for u in users
        ])

    def delete(self, request, pk):
        if not is_admin(request.user):
            return Response({'error': 'Forbidden'}, status=403)
        user = get_object_or_404(User, pk=pk)
        if user != request.user:
            user.delete()
        return Response({'status': 'deleted'})


class AdminSellerApprovalsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Forbidden'}, status=403)
        pending = SellerAdditionalDetails.objects.filter(is_approved=False).select_related('user').order_by('-created_at')
        return Response([
            {
                'id': s.pk,
                'username': s.user.username,
                'full_name': s.user.first_name or s.user.username,
                'email': s.user.email,
                'experience': s.experience,
                'description': s.description,
                'phone': s.user.phone,
                'location': s.user.location,
                'created_at': s.created_at,
            }
            for s in pending
        ])

    def post(self, request, pk):
        if not is_admin(request.user):
            return Response({'error': 'Forbidden'}, status=403)
        details = get_object_or_404(SellerAdditionalDetails, pk=pk)
        details.is_approved = True
        details.save()
        return Response({'status': 'approved'})

    def delete(self, request, pk):
        if not is_admin(request.user):
            return Response({'error': 'Forbidden'}, status=403)
        details = get_object_or_404(SellerAdditionalDetails, pk=pk)
        details.user.delete()
        return Response({'status': 'rejected'})


class AdminServicesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Forbidden'}, status=403)
        qs = Service.objects.all().select_related('seller', 'category').order_by('-created_at')
        q = request.query_params.get('q')
        category_id = request.query_params.get('category')
        if q:
            qs = qs.filter(Q(title__icontains=q) | Q(seller__username__icontains=q) | Q(seller__first_name__icontains=q))
        if category_id:
            qs = qs.filter(category_id=category_id)
        return Response(ServiceSerializer(qs, many=True, context={'request': request}).data)

    def delete(self, request, pk):
        if not is_admin(request.user):
            return Response({'error': 'Forbidden'}, status=403)
        service = get_object_or_404(Service, pk=pk)
        service.delete()
        return Response({'status': 'deleted'})


class AdminCategoriesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Forbidden'}, status=403)
        return Response(CategorySerializer(Category.objects.all(), many=True).data)

    def post(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Forbidden'}, status=403)
        name = request.data.get('name')
        slug = request.data.get('slug')
        icon_class = request.data.get('icon_class', 'bi-briefcase-fill')
        if not name:
            return Response({'error': 'Name required'}, status=400)
        cat = Category.objects.create(name=name, slug=slug, icon_class=icon_class)
        return Response(CategorySerializer(cat).data, status=201)

    def delete(self, request, pk):
        if not is_admin(request.user):
            return Response({'error': 'Forbidden'}, status=403)
        get_object_or_404(Category, pk=pk).delete()
        return Response({'status': 'deleted'})


class AdminBookingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Forbidden'}, status=403)
        bookings = Booking.objects.all().select_related('buyer', 'service').order_by('-created_at')
        return Response(BookingSerializer(bookings, many=True).data)


class AdminRequestsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Forbidden'}, status=403)
        reqs = PostRequest.objects.all().select_related('sender', 'recipient').order_by('-created_at')
        return Response([
            {
                'id': r.id,
                'title': r.title,
                'details': r.details,
                'location': r.location,
                'sender': r.sender.username if r.sender else 'Anonymous',
                'recipient': r.recipient.username if r.recipient else 'Admin',
                'created_at': r.created_at,
            }
            for r in reqs
        ])
