from django.db import models
from django.contrib.auth.models import User

class Bus(models.Model):
    operator = models.CharField(max_length=100)
    bus_type = models.CharField(max_length=100)
    from_city = models.CharField(max_length=100)
    to_city = models.CharField(max_length=100)
    price = models.IntegerField()
    departure = models.CharField(max_length=10) # e.g. "22:00"
    arrival = models.CharField(max_length=10)   # e.g. "04:00"
    duration = models.CharField(max_length=20)  # e.g. "6h 30m"
    seats_available = models.IntegerField(default=40)
    total_seats = models.IntegerField(default=40)
    amenities = models.TextField(default="")    # Comma-separated list of amenities
    eco_friendly = models.BooleanField(default=False)
    is_custom = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.operator} ({self.from_city} -> {self.to_city})"

class Offer(models.Model):
    code = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, default="")
    color = models.CharField(max_length=100, default="grad-rose-orange")
    icon = models.CharField(max_length=50, default="🎁")
    percent = models.IntegerField(default=10)
    max_off = models.IntegerField(default=200)

    def __str__(self):
        return self.code

class Booking(models.Model):
    booking_id = models.CharField(max_length=20, unique=True, primary_key=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="bookings")
    bus_name = models.CharField(max_length=100)
    bus_type = models.CharField(max_length=100)
    from_city = models.CharField(max_length=100)
    to_city = models.CharField(max_length=100)
    date = models.CharField(max_length=20)       # YYYY-MM-DD
    departure = models.CharField(max_length=20)
    arrival = models.CharField(max_length=20)
    seats = models.TextField()                  # Comma-separated list of seats e.g. '1A,2B'
    total = models.IntegerField()
    passenger_name = models.CharField(max_length=100)
    passenger_phone = models.CharField(max_length=20)
    passenger_email = models.CharField(max_length=100)
    status = models.CharField(max_length=20, default="confirmed") # confirmed, cancelled
    booked_at = models.DateTimeField(auto_now_add=True)
    kind = models.CharField(max_length=20, default="seat")        # seat, charter
    km = models.IntegerField(null=True, blank=True)
    fleet_name = models.CharField(max_length=100, blank=True, default="")

    def __str__(self):
        return f"{self.booking_id} ({self.passenger_name})"

