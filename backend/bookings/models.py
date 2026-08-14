from django.db import models

# Create your models here.

class Booking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )

    buyer = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='bookings')
    service = models.ForeignKey('accounts.Service', on_delete=models.CASCADE)
    booking_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    base_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    travel_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    platform_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    address = models.TextField()
    buyer_lat = models.FloatField(null=True, blank=True)
    buyer_lng = models.FloatField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Booking #{self.id} - {self.service.title} for {self.buyer.username}"