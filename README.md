# 🚌 BusEase — Bus Booking & Management System

BusEase is a modern, fully-featured **Bus Booking & Management System** built with **Bootstrap 5** on the frontend, persisting data seamlessly using browser **local storage** and local SQLite database, integrated with a **Django** backend structure.

This project is a Python Django Web Application that serves templates dynamically and is ready for backend operations.

---

## 🌟 Key Features

- **Dynamic Search & Filters**: Search buses between 40+ cities, filter by AC/Non-AC, Sleeper/Seater, Amenities, Departure Times, and sort by Price or Ratings.
- **Interactive Seat Selection**: Choose premium, regular, or ladies-only seats with real-time seat validation.
- **Checkout & Booking Flow**: Interactive booking form with coupon applications, dynamic price calculations, and simulated payment methods (UPI, Card, NetBanking).
- **E-Ticket & PNR Confirmation**: Real-time generation of printable electronic tickets with simulated PNR numbers.
- **My Trips & Ticket Cancellation**: Access booking history and cancel active tickets instantly.
- **Offers & Promo Coupons**: View active discounts and copy promo codes directly to your clipboard.
- **30-Day Fare Trends**: Interactive calendar view showing daily price trends.
- **Charter Bus Quote Builder**: Customized request forms for whole-bus rentals.
- **Live Tracking System**: Simulation of real-time bus location tracking.
- **Help Desk & Interactive Chatbot**: Virtual support bot capable of resolving queries dynamically.
- **Admin Management Panel**: Secure administrator dashboard to manage system resources.

---

## 📂 Project Architecture & File Locations

Here is a quick overview of how the repository is structured so you know exactly where everything is located:

```text
📁 Project - Bus Book/                  # Repository Root Directory
│
├── 📁 myenv/                           # Python Virtual Environment
│
├── 📁 project/                         # Django Root Directory
│   │
│   ├── 📁 project/                     # Main Django Project Settings Folder
│   │   ├── settings.py                 # Django settings (databases, static assets)
│   │   └── urls.py                     # Root URL configuration mapping
│   │
│   ├── 📁 myapp/                       # Main Django Application App
│   │   ├── urls.py                     # Route-to-view mappings for the Django app
│   │   ├── views.py                    # Django view functions rendering HTML templates
│   │   │
│   │   ├── 📁 templates/myapp/         # Adapted Django HTML templates
│   │   │   ├── base.html               # Master layout with Navbar & Footer wrappers
│   │   │   ├── index.html              # Landing / Home page
│   │   │   ├── admin.html              # Admin dashboard panel
│   │   │   └── ... (other view files)
│   │   │
│   │   └── 📁 static/myapp/assets/     # Static Assets served by Django
│   │       ├── css/styles.css          # Custom HSL-based design system and CSS utilities
│   │       ├── js/data.js              # Shared data layer & LocalStorage APIs
│   │       ├── js/common.js            # Core components (Navbar, Footer, Chatbot, Auth Modal)
│   │       └── js/search-form.js       # Search form functionality
│   │
│   ├── 📄 manage.py                    # Django command-line execution entry point
│   └── 📄 db.sqlite3                   # Local SQLite database file for Django
│
└── 📄 README.md                        # Project Main Documentation (This file)
```

---

## 🚦 URL Routing

### Django Web Application Routes
When running the Django server, the application uses the following paths (defined in [project/myapp/urls.py](file:///c:/Users/rajpa/Desktop/Tops-Backend/Project%20-%20Bus%20Book/project/myapp/urls.py)):

| Path Pattern | View Function | Template Rendered | Purpose |
| :--- | :--- | :--- | :--- |
| `/` | `views.index` | `myapp/index.html` | Home / Landing Page with Search |
| `/search/` | `views.search` | `myapp/search.html` | Search Results with Filters |
| `/seats/` | `views.seats` | `myapp/seats.html` | Interactive Seat Selector |
| `/booking/` | `views.booking` | `myapp/booking.html` | Passenger Info & Payments |
| `/confirmation/` | `views.confirmation` | `myapp/confirmation.html` | E-Ticket & PNR Details |
| `/offers/` | `views.offers` | `myapp/offers.html` | Coupon Catalogue |
| `/advance/` | `views.advance` | `myapp/advance.html` | 30-day Price Trends Calendar |
| `/charter/` | `views.charter` | `myapp/charter.html` | Custom Bus Booking Quote Builder |
| `/my-trips/` | `views.my_trips` | `myapp/my-trips.html` | Booking History & Cancellations |
| `/track/` | `views.track` | `myapp/track.html` | Live Bus Tracking Demo |
| `/support/` | `views.support` | `myapp/support.html` | FAQ Section & Live Chatbot |
| `/admin-dashboard/` | `views.admin_dashboard` | `myapp/admin.html` | Main Administrative Dashboard |
| `/404/` | `views.page_not_found` | `myapp/404.html` | Not Found page |

---

## 🔐 Admin Panel Management

The administrative panel allows managers to dynamically update live variables. 

- **Access URL**: `/admin-dashboard/`
- **Access Credentials**: Secret PIN code: **`2468`**

### Administrative Capabilities:
1. **Coupons Store**: Manage discount codes (Add code, edit percent off, delete, or reset settings). Coupon updates apply instantly to current checkouts on the booking page.
2. **Buses Directory**: Register custom buses with specific operators, seat arrangements, timings, pricing models, and travel durations.
3. **User Management**: Review registered email addresses, track login profiles, and remove accounts if necessary.
4. **Bookings Log**: View a full audit trail of bookings containing PNRs, selected seats, total billing details, and trip status.

---

## 🚀 How to Run the Project

1. **Prerequisites**: Ensure you have Python installed.
2. **Activate the Virtual Environment**:
   The project comes with a pre-configured virtual environment `myenv`. Activate it using:
   ```bash
   # Windows PowerShell
   .\myenv\Scripts\Activate.ps1
   
   # Windows Command Prompt
   .\myenv\Scripts\activate.bat
   
   # macOS / Linux
   source myenv/bin/activate
   ```
3. **Install Dependencies**:
   If needed, install Django (it should be installed in `myenv` already):
   ```bash
   pip install django
   ```
4. **Navigate to the Project Directory**:
   ```bash
   cd project
   ```
5. **Launch the Development Server**:
   ```bash
   python manage.py runserver
   ```
6. Open your browser and navigate to: **`http://127.0.0.1:8000/`**

> [!WARNING]
> Do not open `.html` templates directly in the browser. The application uses Django templates, routing, and database integrations which require running the Django development server.
