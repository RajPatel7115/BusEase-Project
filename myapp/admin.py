from django.contrib import admin
from .models import Bus, Offer, Booking

@admin.register(Bus)
class BusAdmin(admin.ModelAdmin):
    list_display = ('operator', 'from_city', 'to_city', 'price', 'departure', 'arrival', 'is_custom')
    list_filter = ('from_city', 'to_city', 'is_custom')
    search_fields = ('operator', 'from_city', 'to_city')

@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = ('code', 'title', 'percent', 'max_off')
    search_fields = ('code', 'title')

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('booking_id', 'passenger_name', 'bus_name', 'from_city', 'to_city', 'date', 'total', 'status')
    list_filter = ('status', 'kind', 'date')
    search_fields = ('booking_id', 'passenger_name', 'passenger_email', 'bus_name')

