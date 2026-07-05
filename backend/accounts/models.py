from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.


class User(AbstractUser):

    BUYER = 'buyer'
    SELLER = 'seller'
    ADMIN = 'admin'
    SUPER_ADMIN = 'super_admin'

    ROLE_CHOICES = (
        (BUYER, 'Buyer'),
        (SELLER, 'Seller'),
        (ADMIN, 'Admin'),
        (SUPER_ADMIN, 'Super Admin'),
    )

    ADMIN_ROLES = [ADMIN, SUPER_ADMIN]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=BUYER)
    location = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=15, blank=True, null=True)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.username

    def save(self, *args, **kwargs):
        if self.is_superuser and self.role != self.SUPER_ADMIN:
            self.role = self.SUPER_ADMIN
        super().save(*args, **kwargs)

class SellerAdditionalDetails(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE
    )
    experience = models.IntegerField(default=0)
    description = models.TextField(blank=True, default='')
    is_approved = models.BooleanField(default=False)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'seller_additional_details'

    def __str__(self):
        return self.user.username

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, null=True, blank=True)
    icon_class = models.CharField(max_length=50, default='bi-briefcase-fill', help_text="Bootstrap icon class (e.g., bi-plug-fill)")

    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'categories'

    def __str__(self):
        return self.name

class Service(models.Model):
    UNIT_CHOICES = (
        ('hr', 'per hour'),
        ('day', 'per day'),
        ('visit', 'per visit'),
        ('job', 'per job'),
    )

    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='services')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='services')
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='services/', null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    price_unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default='hr')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'services'

    def __str__(self):
        return self.title
    
class PostRequest(models.Model):
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='sent_requests')
    recipient = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='received_requests', help_text="Null means sent to Admin")
    title = models.CharField(max_length=200)
    details = models.TextField()
    location = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({'Admin' if not self.recipient else self.recipient.username})"

    class Meta:
        db_table = 'post_requests'

class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'carts'

    def __str__(self):
        return f"Cart for {self.user.username}"

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'cart_items'
        unique_together = ('cart', 'service')
