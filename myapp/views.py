from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login as django_login, logout as django_logout
from django.contrib.auth.models import User
from django.db.models import Q
from .models import Bus, Offer, Booking
import json
import time
import math

# ---- Seeding Helpers ----
def seed_fn(n):
    x = math.sin(n) * 10000
    return x - math.floor(x)

def ensure_seeded_offers():
    if Offer.objects.count() == 0:
        DEFAULT_OFFERS = [
            { "code": "FIRST50", "title": "Flat 50% OFF", "description": "On your first booking. Up to ₹250 off.", "color": "grad-rose-orange", "icon": "🎁", "percent": 50, "max_off": 250 },
            { "code": "MONSOON25", "title": "Monsoon Saver", "description": "25% off on all AC Sleeper buses.", "color": "grad-sky-indigo", "icon": "☔", "percent": 25, "max_off": 400 },
            { "code": "WEEKEND15", "title": "Weekend Wanderer", "description": "Extra 15% on Fri-Sun departures.", "color": "grad-violet-fuchsia", "icon": "🌴", "percent": 15, "max_off": 300 },
            { "code": "EARLYBIRD", "title": "Early Bird 30D", "description": "30% off when booking 30+ days ahead.", "color": "grad-emerald-teal", "icon": "🐦", "percent": 30, "max_off": 600 },
            { "code": "GROUP6", "title": "Group of 6", "description": "Book 6 seats, get 1 free.", "color": "grad-amber-rose", "icon": "👥", "percent": 16, "max_off": 800 },
            { "code": "WOMEN20", "title": "Women Travel", "description": "Flat 20% off on Ladies seats.", "color": "grad-pink-rose", "icon": "💗", "percent": 20, "max_off": 350 }
        ]
        for o in DEFAULT_OFFERS:
            Offer.objects.create(
                code=o["code"],
                title=o["title"],
                description=o["description"],
                color=o["color"],
                icon=o["icon"],
                percent=o["percent"],
                max_off=o["max_off"]
            )

def ensure_seeded_buses(from_city, to_city):
    # Check if we have buses for this route
    if not Bus.objects.filter(from_city__iexact=from_city, to_city__iexact=to_city).exists():
        OPERATORS = ["VRL Travels","SRS Travels","Orange Tours","Neeta Tours","Kallada","Patel Travels","Zingbus","Intrcity SmartBus","RedBus Express","Sharma Travels"]
        TYPES = ["AC Sleeper","Non-AC Sleeper","AC Seater","Volvo Multi-Axle","AC Semi-Sleeper","Sleeper + Seater"]
        AMENITIES = ["WiFi","Charging Point","Blanket","Water Bottle","Reading Light","Snacks","Live Tracking","Movies"]
        
        seed_base = sum(ord(c) for c in (from_city + to_city))
        for i in range(8):
            def r(n):
                return seed_fn(seed_base + i * 13 + n)
            dep = int(math.floor(r(1) * 22)) + 1
            dur = 4 + int(math.floor(r(2) * 10))
            arr = (dep + dur) % 24
            op_idx = int(math.floor(r(3) * len(OPERATORS)))
            t_idx = int(math.floor(r(4) * len(TYPES)))
            price = 400 + int(math.floor(r(5) * 1600))
            rating = f"{3.8 + r(6) * 1.2:.1f}"
            amen = [a for j, a in enumerate(AMENITIES) if r(7 + j) > 0.5][:4]
            if not amen:
                amen = ["WiFi", "Charging Point"]
            
            dep_mins = "30" if r(8) > 0.5 else "00"
            arr_mins = "30" if r(9) > 0.5 else "00"
            
            Bus.objects.create(
                operator=OPERATORS[op_idx],
                bus_type=TYPES[t_idx],
                from_city=from_city,
                to_city=to_city,
                price=price,
                departure=f"{dep:02d}:{dep_mins}",
                arrival=f"{arr:02d}:{arr_mins}",
                duration=f"{dur}h {int(math.floor(r(10) * 60))}m",
                seats_available=5 + int(math.floor(r(11) * 35)),
                total_seats=40,
                amenities=",".join(amen),
                eco_friendly=r(12) > 0.7,
                is_custom=False
            )

# ---- Template Views ----

def index(request):
    """Home page with hero, offers, popular routes"""
    ensure_seeded_offers()
    # Get top 3 offers for strip
    offers_list = Offer.objects.all()[:3]
    return render(request, 'myapp/index.html', {'offers': offers_list})

def search(request):
    """Search results page with filters"""
    from_city = request.GET.get('from', 'Mumbai')
    to_city = request.GET.get('to', 'Pune')
    ensure_seeded_buses(from_city, to_city)

    # Get both seeded and custom buses for this route
    buses = Bus.objects.filter(
        Q(from_city__iexact=from_city, to_city__iexact=to_city) |
        Q(from_city__iexact=from_city, to_city__iexact=to_city, is_custom=True)
    )

    buses_list = []
    for b in buses:
        buses_list.append({
            "id": str(b.id),
            "name": b.operator,
            "type": b.bus_type,
            "departure": b.departure,
            "arrival": b.arrival,
            "duration": b.duration,
            "price": b.price,
            "rating": "4.2", # Static rating for display
            "seatsAvailable": b.seats_available,
            "totalSeats": b.total_seats,
            "amenities": b.amenities.split(",") if b.amenities else ["WiFi", "Charging Point"],
            "ecoFriendly": b.eco_friendly
        })

    return render(request, 'myapp/search.html', {
        'buses_json': json.dumps(buses_list),
        'from_city': from_city,
        'to_city': to_city
    })

def seats(request):
    """Seat selection page"""
    bus_id = request.GET.get('busId')
    from_city = request.GET.get('from', 'Mumbai')
    to_city = request.GET.get('to', 'Pune')
    date_str = request.GET.get('date', '')

    bus_obj = None
    if bus_id:
        try:
            # Custom buses might be integers in DB or standard ids
            if bus_id.startswith("CB"):
                bus_obj = Bus.objects.filter(id=int(bus_id[2:])).first()
            elif bus_id.isdigit():
                bus_obj = Bus.objects.filter(id=int(bus_id)).first()
        except ValueError:
            pass

    if not bus_obj:
        # Fallback to seeded buses if matching id is not direct
        ensure_seeded_buses(from_city, to_city)
        # Find any bus as fallback
        bus_obj = Bus.objects.filter(from_city__iexact=from_city, to_city__iexact=to_city).first()

    if not bus_obj:
        return redirect('myapp:index')

    bus_data = {
        "id": str(bus_obj.id),
        "name": bus_obj.operator,
        "type": bus_obj.bus_type,
        "departure": bus_obj.departure,
        "arrival": bus_obj.arrival,
        "duration": bus_obj.duration,
        "price": bus_obj.price,
        "totalSeats": bus_obj.total_seats,
        "seatsAvailable": bus_obj.seats_available
    }

    # Fetch booked seats from database for this bus and date
    booked_bookings = Booking.objects.filter(
        bus_name=bus_obj.operator,
        from_city__iexact=from_city,
        to_city__iexact=to_city,
        date=date_str,
        status="confirmed"
    )
    booked_seats_list = []
    for b in booked_bookings:
        if b.seats:
            booked_seats_list.extend(b.seats.split(","))

    return render(request, 'myapp/seats.html', {
        'bus_json': json.dumps(bus_data),
        'booked_seats': json.dumps(booked_seats_list),
        'from_city': from_city,
        'to_city': to_city,
        'date': date_str
    })

def booking(request):
    """Booking & payment page"""
    return render(request, 'myapp/booking.html')

def confirmation(request):
    """Booking confirmation page"""
    booking_id = request.GET.get('id', '')
    booking_obj = Booking.objects.filter(booking_id=booking_id).first()
    
    if not booking_obj:
        return render(request, 'myapp/confirmation.html', {'booking_found': False})

    booking_data = {
        "id": booking_obj.booking_id,
        "busName": booking_obj.bus_name,
        "busType": booking_obj.bus_type,
        "from": booking_obj.from_city,
        "to": booking_obj.to_city,
        "date": booking_obj.date,
        "departure": booking_obj.departure,
        "arrival": booking_obj.arrival,
        "seats": booking_obj.seats.split(","),
        "total": booking_obj.total,
        "passenger": {
            "name": booking_obj.passenger_name,
            "phone": booking_obj.passenger_phone,
            "email": booking_obj.passenger_email
        },
        "km": booking_obj.km
    }

    return render(request, 'myapp/confirmation.html', {
        'booking_found': True,
        'booking_json': json.dumps(booking_data),
        'booking': booking_obj
    })

def offers(request):
    """Offers page"""
    ensure_seeded_offers()
    offers_list = Offer.objects.all()
    
    offers_data = []
    for o in offers_list:
        offers_data.append({
            "code": o.code,
            "title": o.title,
            "desc": o.description,
            "color": o.color,
            "icon": o.icon,
            "percent": o.percent,
            "maxOff": o.max_off
        })

    return render(request, 'myapp/offers.html', {'offers_json': json.dumps(offers_data)})

def advance(request):
    """30-day advance booking page"""
    return render(request, 'myapp/advance.html')

def charter(request):
    """Charter a bus page"""
    return render(request, 'myapp/charter.html')

def my_trips(request):
    """My trips / booking history"""
    return render(request, 'myapp/my-trips.html')

def track(request):
    """Track your bus page"""
    return render(request, 'myapp/track.html')

def support(request):
    """Support / help page"""
    return render(request, 'myapp/support.html')

def admin_dashboard(request):
    """Admin dashboard page"""
    return render(request, 'myapp/admin.html')

def page_not_found(request):
    """Custom 404 page"""
    return render(request, 'myapp/404.html')

# ---- API Views ----

@csrf_exempt
def api_auth_current(request):
    if request.user.is_authenticated:
        return JsonResponse({
            "logged_in": True,
            "user": {
                "name": request.user.first_name or request.user.username,
                "email": request.user.email
            }
        })
    return JsonResponse({"logged_in": False})

@csrf_exempt
def api_auth_login(request):
    if request.method == "POST":
        data = json.loads(request.body)
        email = data.get("email")
        password = data.get("password")
        try:
            user_obj = User.objects.get(email=email)
            user = authenticate(request, username=user_obj.username, password=password)
            if user is not None:
                django_login(request, user)
                return JsonResponse({
                    "success": True,
                    "user": {
                        "name": user.first_name or user.username,
                        "email": user.email
                    }
                })
        except User.DoesNotExist:
            pass
        return JsonResponse({"success": False, "error": "Invalid credentials"})
    return JsonResponse({"success": False, "error": "POST method required"})

@csrf_exempt
def api_auth_signup(request):
    if request.method == "POST":
        data = json.loads(request.body)
        name = data.get("name", "").strip()
        email = data.get("email", "").strip()
        password = data.get("password")
        
        if User.objects.filter(email=email).exists():
            return JsonResponse({"success": False, "error": "Email already exists"})
        
        username = email.split("@")[0]
        if User.objects.filter(username=username).exists():
            username = f"{username}_{User.objects.count()}"
            
        user = User.objects.create_user(username=username, email=email, password=password)
        user.first_name = name
        user.save()
        
        django_login(request, user)
        return JsonResponse({
            "success": True,
            "user": {
                "name": user.first_name,
                "email": user.email
            }
        })
    return JsonResponse({"success": False, "error": "POST method required"})

@csrf_exempt
def api_auth_logout(request):
    django_logout(request)
    return JsonResponse({"success": True})

@csrf_exempt
def api_booking_create(request):
    if request.method == "POST":
        data = json.loads(request.body)
        booking_id = "BE" + str(int(time.time()))[-8:]
        
        booking_obj = Booking.objects.create(
            booking_id=booking_id,
            user=request.user if request.user.is_authenticated else None,
            bus_name=data.get('busName'),
            bus_type=data.get('busType'),
            from_city=data.get('from'),
            to_city=data.get('to'),
            date=data.get('date'),
            departure=data.get('departure', '—'),
            arrival=data.get('arrival', '—'),
            seats=",".join(data.get('seats', [])),
            total=int(data.get('total', 0)),
            passenger_name=data.get('passenger', {}).get('name'),
            passenger_phone=data.get('passenger', {}).get('phone'),
            passenger_email=data.get('passenger', {}).get('email'),
            status="confirmed",
            kind=data.get('kind', 'seat'),
            km=data.get('km'),
            fleet_name=data.get('fleetName', '')
        )
        return JsonResponse({"success": True, "booking_id": booking_id})
    return JsonResponse({"success": False, "error": "POST method required"})

@csrf_exempt
def api_booking_cancel(request):
    if request.method == "POST":
        data = json.loads(request.body)
        booking_id = data.get("booking_id")
        booking_obj = Booking.objects.filter(booking_id=booking_id).first()
        if booking_obj:
            booking_obj.status = "cancelled"
            booking_obj.save()
            return JsonResponse({"success": True})
        return JsonResponse({"success": False, "error": "Booking not found"})
    return JsonResponse({"success": False, "error": "POST method required"})

@csrf_exempt
def api_my_trips(request):
    if request.user.is_authenticated:
        bookings = Booking.objects.filter(user=request.user).order_by('-booked_at')
    else:
        bookings = []
        
    bookings_list = []
    for b in bookings:
        bookings_list.append({
            "id": b.booking_id,
            "busName": b.bus_name,
            "busType": b.bus_type,
            "from": b.from_city,
            "to": b.to_city,
            "date": b.date,
            "departure": b.departure,
            "arrival": b.arrival,
            "seats": b.seats.split(","),
            "total": b.total,
            "status": b.status,
            "kind": b.kind
        })
    return JsonResponse(bookings_list, safe=False)

# ---- Admin Dashboard APIs ----

@csrf_exempt
def api_admin_stats(request):
    stats = {
        "bookings_count": Booking.objects.count(),
        "offers_count": Offer.objects.count(),
        "custom_buses_count": Bus.objects.filter(is_custom=True).count(),
        "users_count": User.objects.count()
    }
    return JsonResponse(stats)

@csrf_exempt
def api_admin_coupons(request):
    ensure_seeded_offers()
    if request.method == "GET":
        offers = Offer.objects.all().order_by('-id')
        offers_list = [{
            "code": o.code,
            "title": o.title,
            "desc": o.description,
            "color": o.color,
            "icon": o.icon,
            "percent": o.percent,
            "maxOff": o.max_off
        } for o in offers]
        return JsonResponse(offers_list, safe=False)
        
    elif request.method == "POST":
        data = json.loads(request.body)
        action = data.get("action", "add")
        if action == "add":
            code = data.get("code").upper()
            if Offer.objects.filter(code=code).exists():
                return JsonResponse({"success": False, "error": "Coupon code already exists"})
            
            Offer.objects.create(
                code=code,
                title=data.get("title"),
                description=data.get("desc"),
                color=data.get("color", "grad-rose-orange"),
                icon=data.get("icon", "🎟️"),
                percent=int(data.get("percent", 10)),
                max_off=int(data.get("maxOff", 200))
            )
            return JsonResponse({"success": True})
        elif action == "remove":
            code = data.get("code")
            Offer.objects.filter(code=code).delete()
            return JsonResponse({"success": True})
        elif action == "reset":
            Offer.objects.all().delete()
            ensure_seeded_offers()
            return JsonResponse({"success": True})
            
    return JsonResponse({"success": False, "error": "Invalid request"})

@csrf_exempt
def api_admin_buses(request):
    if request.method == "GET":
        buses = Bus.objects.filter(is_custom=True).order_by('-id')
        buses_list = [{
            "id": f"CB{b.id}",
            "name": b.operator,
            "type": b.bus_type,
            "from": b.from_city,
            "to": b.to_city,
            "price": b.price,
            "departure": b.departure,
            "arrival": b.arrival
        } for b in buses]
        return JsonResponse(buses_list, safe=False)
        
    elif request.method == "POST":
        data = json.loads(request.body)
        action = data.get("action", "add")
        if action == "add":
            Bus.objects.create(
                operator=data.get("name"),
                bus_type=data.get("type", "AC Sleeper"),
                from_city=data.get("from"),
                to_city=data.get("to"),
                price=int(data.get("price", 500)),
                departure=data.get("departure", "22:00"),
                arrival=data.get("arrival", "04:00"),
                duration="6h 00m",
                seats_available=40,
                total_seats=40,
                amenities="WiFi,Charging Point",
                eco_friendly=False,
                is_custom=True
            )
            return JsonResponse({"success": True})
        elif action == "remove":
            bus_id = data.get("id")
            if bus_id.startswith("CB"):
                Bus.objects.filter(id=int(bus_id[2:])).delete()
            else:
                Bus.objects.filter(id=int(bus_id)).delete()
            return JsonResponse({"success": True})
            
    return JsonResponse({"success": False, "error": "Invalid request"})

@csrf_exempt
def api_admin_users(request):
    if request.method == "GET":
        users = User.objects.all().order_by('-id')
        users_list = [{
            "name": u.first_name or u.username,
            "email": u.email or "—"
        } for u in users]
        return JsonResponse(users_list, safe=False)
        
    elif request.method == "POST":
        data = json.loads(request.body)
        email = data.get("email")
        User.objects.filter(email=email).delete()
        return JsonResponse({"success": True})
        
    return JsonResponse({"success": False, "error": "Invalid request"})

@csrf_exempt
def api_admin_bookings(request):
    if request.method == "GET":
        bookings = Booking.objects.all().order_by('-booked_at')
        bookings_list = [{
            "id": b.booking_id,
            "busName": b.bus_name,
            "busType": b.bus_type,
            "from": b.from_city,
            "to": b.to_city,
            "date": b.date,
            "departure": b.departure,
            "arrival": b.arrival,
            "seats": b.seats.split(","),
            "total": b.total,
            "passenger": {
                "name": b.passenger_name,
                "phone": b.passenger_phone,
                "email": b.passenger_email
            },
            "status": b.status,
            "kind": b.kind
        } for b in bookings]
        return JsonResponse(bookings_list, safe=False)
        
    return JsonResponse({"success": False, "error": "Invalid request"})

