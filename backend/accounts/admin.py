from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, SellerAdditionalDetails, Category, Service, PostRequest, Cart, CartItem

# Register your models here.

admin.site.register(User, UserAdmin)
admin.site.register(SellerAdditionalDetails)
admin.site.register(Category)
admin.site.register(Service)
admin.site.register(PostRequest)
admin.site.register(Cart)
admin.site.register(CartItem)
