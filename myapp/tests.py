import json
from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from .models import Bus, Offer, Booking

class BusEaseTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        # Create a test user
        self.user = User.objects.create_user(
            username='testuser@example.com',
            email='testuser@example.com',
            password='testpassword'
        )
        self.user.first_name = 'Test User'
        self.user.save()

        # Create a test bus
        self.bus = Bus.objects.create(
            operator='Super Express',
            bus_type='AC Sleeper',
            from_city='Mumbai',
            to_city='Pune',
            price=600,
            departure='22:00',
            arrival='04:00',
            duration='6h 0m',
            amenities='WiFi,Charging Point',
            is_custom=False
        )

        # Create a test offer
        self.offer = Offer.objects.create(
            code='SAVE20',
            title='20% Discount',
            description='Flat 20% off',
            color='grad-rose-orange',
            icon='🎟️',
            percent=20,
            max_off=200
        )

    def test_auth_signup(self):
        response = self.client.post(
            reverse('myapp:api-auth-signup'),
            data=json.dumps({
                'name': 'New User',
                'email': 'newuser@example.com',
                'password': 'newpassword123'
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['user']['email'], 'newuser@example.com')

    def test_auth_login_logout(self):
        # Test login
        response = self.client.post(
            reverse('myapp:api-auth-login'),
            data=json.dumps({
                'email': 'testuser@example.com',
                'password': 'testpassword'
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['success'])

        # Test current auth user
        response = self.client.get(reverse('myapp:api-auth-current'))
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['logged_in'])
        self.assertEqual(response.json()['user']['email'], 'testuser@example.com')

        # Test logout
        response = self.client.post(reverse('myapp:api-auth-logout'))
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['success'])

    def test_booking_create_and_cancel(self):
        # Log in the client
        self.client.login(username='testuser@example.com', password='testpassword')
        # Also need session auth since views check request.session.get('user')
        session = self.client.session
        session['user'] = {
            'email': 'testuser@example.com',
            'name': 'Test User'
        }
        session.save()

        # Create booking
        response = self.client.post(
            reverse('myapp:api-booking-create'),
            data=json.dumps({
                'busName': 'Super Express',
                'busType': 'AC Sleeper',
                'from': 'Mumbai',
                'to': 'Pune',
                'date': '2026-08-15',
                'departure': '22:00',
                'arrival': '04:00',
                'seats': ['1A', '1B'],
                'total': 1200,
                'passenger': {
                    'name': 'Test User',
                    'email': 'testuser@example.com',
                    'phone': '9876543210'
                },
                'kind': 'seat'
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        booking_id = data['booking_id']

        # Verify booking in db
        booking = Booking.objects.get(booking_id=booking_id)
        self.assertEqual(booking.status, 'confirmed')

        # Cancel booking
        response = self.client.post(
            reverse('myapp:api-booking-cancel'),
            data=json.dumps({
                'booking_id': booking_id
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['success'])

        # Verify cancellation in db
        booking.refresh_from_db()
        self.assertEqual(booking.status, 'cancelled')

    def test_admin_stats(self):
        response = self.client.get(reverse('myapp:api-admin-stats'))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('bookings_count', data)
        self.assertIn('offers_count', data)
        self.assertIn('users_count', data)
