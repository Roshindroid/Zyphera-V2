from rest_framework import serializers
from .models import User, SellerAdditionalDetails, Category, Service, Cart, CartItem, ServiceLocation, Review
from bookings.models import Booking


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    full_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    experience = serializers.IntegerField(write_only=True, required=False, default=0)
    bio = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'email', 'password', 'role', 'phone', 'location', 'latitude', 'longitude', 'place_id', 'experience', 'bio']

    def create(self, validated_data):
        full_name = validated_data.pop('full_name', '')
        experience = validated_data.pop('experience', 0)
        bio = validated_data.pop('bio', '')
        user = User.objects.create_user(**validated_data)
        if full_name:
            user.first_name = full_name
            user.save()
        if user.role == User.SELLER:
            SellerAdditionalDetails.objects.create(user=user, experience=experience, description=bio)
        return user


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='first_name', read_only=True)
    is_available = serializers.SerializerMethodField()
    experience = serializers.SerializerMethodField()
    bio = serializers.SerializerMethodField()
    business_address = serializers.SerializerMethodField()
    business_lat = serializers.SerializerMethodField()
    business_lng = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'email', 'role', 'phone', 'location', 'latitude', 'longitude', 'place_id', 'is_available', 'experience', 'bio', 'business_address', 'business_lat', 'business_lng']

    def get_is_available(self, obj):
        if obj.role == 'seller':
            details = SellerAdditionalDetails.objects.filter(user=obj).first()
            return details.is_available if details else False
        return None

    def get_experience(self, obj):
        if obj.role == 'seller':
            details = SellerAdditionalDetails.objects.filter(user=obj).first()
            return details.experience if details else 0
        return None

    def get_bio(self, obj):
        if obj.role == 'seller':
            details = SellerAdditionalDetails.objects.filter(user=obj).first()
            return details.description if details else ''
        return None

    def get_business_address(self, obj):
        if obj.role == 'seller':
            details = SellerAdditionalDetails.objects.filter(user=obj).first()
            return details.business_address if details else None
        return None

    def get_business_lat(self, obj):
        if obj.role == 'seller':
            details = SellerAdditionalDetails.objects.filter(user=obj).first()
            return details.business_lat if details else None
        return None

    def get_business_lng(self, obj):
        if obj.role == 'seller':
            details = SellerAdditionalDetails.objects.filter(user=obj).first()
            return details.business_lng if details else None
        return None


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'icon_class']


class SellerSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='first_name')
    experience = serializers.SerializerMethodField()
    is_available = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'experience', 'is_available']

    def get_experience(self, obj):
        details = SellerAdditionalDetails.objects.filter(user=obj).first()
        return details.experience if details else 0

    def get_is_available(self, obj):
        details = SellerAdditionalDetails.objects.filter(user=obj).first()
        return details.is_available if details else False


class ReviewSerializer(serializers.ModelSerializer):
    buyer_name = serializers.CharField(source='buyer.first_name', read_only=True)
    buyer_username = serializers.CharField(source='buyer.username', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'rating', 'comment', 'buyer_name', 'buyer_username', 'created_at']


class ServiceLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceLocation
        fields = ['address', 'latitude', 'longitude', 'radius_km', 'free_radius_km',
                  'price_per_km', 'platform_fee', 'peak_hour_pct', 'weekend_pct', 'emergency_fee']


class ServiceSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), source='category', write_only=True, required=False, allow_null=True)
    seller_name = serializers.CharField(source='seller.first_name', read_only=True)
    image_url = serializers.SerializerMethodField()
    location_data = ServiceLocationSerializer(read_only=True)
    avg_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = ['id', 'title', 'description', 'image', 'image_url', 'price', 'price_unit',
                  'category', 'category_id', 'seller_name', 'is_active', 'created_at', 'location_data',
                  'avg_rating', 'review_count']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

    def get_avg_rating(self, obj):
        reviews = obj.reviews.all()
        if not reviews:
            return None
        return round(sum(r.rating for r in reviews) / len(reviews), 1)

    def get_review_count(self, obj):
        return obj.reviews.count()


class BookingSerializer(serializers.ModelSerializer):
    service_title = serializers.CharField(source='service.title', read_only=True)
    service_icon = serializers.CharField(source='service.category.icon_class', read_only=True)
    buyer_name = serializers.CharField(source='buyer.first_name', read_only=True)
    buyer_phone = serializers.CharField(source='buyer.phone', read_only=True)
    category_name = serializers.CharField(source='service.category.name', read_only=True)
    has_review = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = ['id', 'service', 'service_title', 'service_icon', 'category_name', 'buyer_name', 'buyer_phone',
                  'booking_date', 'status', 'base_price', 'travel_fee', 'platform_fee', 'total_price',
                  'address', 'buyer_lat', 'buyer_lng', 'notes', 'created_at', 'has_review']

    def get_has_review(self, obj):
        return hasattr(obj, 'review')


class CartItemSerializer(serializers.ModelSerializer):
    service = ServiceSerializer(read_only=True)
    service_id = serializers.PrimaryKeyRelatedField(queryset=Service.objects.all(), source='service', write_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'service', 'service_id', 'added_at']

