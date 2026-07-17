from django.urls import path
from . import views

app_name = 'myapp'

urlpatterns = [
    path('', views.index, name='index'),
    path('search/', views.search, name='search'),
    path('seats/', views.seats, name='seats'),
    path('booking/', views.booking, name='booking'),
    path('confirmation/', views.confirmation, name='confirmation'),
    path('offers/', views.offers, name='offers'),
    path('advance/', views.advance, name='advance'),
    path('charter/', views.charter, name='charter'),
    path('my-trips/', views.my_trips, name='my-trips'),
    path('track/', views.track, name='track'),
    path('support/', views.support, name='support'),
    path('admin-dashboard/', views.admin_dashboard, name='admin-dashboard'),
    path('404/', views.page_not_found, name='404'),

    # Auth APIs
    path('api/auth/current/', views.api_auth_current, name='api-auth-current'),
    path('api/auth/login/', views.api_auth_login, name='api-auth-login'),
    path('api/auth/signup/', views.api_auth_signup, name='api-auth-signup'),
    path('api/auth/logout/', views.api_auth_logout, name='api-auth-logout'),

    # Booking APIs
    path('api/bookings/create/', views.api_booking_create, name='api-booking-create'),
    path('api/bookings/cancel/', views.api_booking_cancel, name='api-booking-cancel'),
    path('api/my-trips/', views.api_my_trips, name='api-my-trips'),

    # Admin APIs
    path('api/admin/stats/', views.api_admin_stats, name='api-admin-stats'),
    path('api/admin/coupons/', views.api_admin_coupons, name='api-admin-coupons'),
    path('api/admin/buses/', views.api_admin_buses, name='api-admin-buses'),
    path('api/admin/users/', views.api_admin_users, name='api-admin-users'),
    path('api/admin/bookings/', views.api_admin_bookings, name='api-admin-bookings'),
]

