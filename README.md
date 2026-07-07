# Zyphera-V2

Zyphera is a comprehensive service booking and marketplace platform that connects buyers with service providers. It features a robust backend powered by Django REST Framework and a dynamic, responsive frontend built with React and Vite.

## 🚀 Features
- **Multi-Role Authentication:** Dedicated dashboards and features for Buyers, Sellers (Service Providers), and Admins.
- **Service Management:** Sellers can add, manage, and list their services.
- **Booking System:** Buyers can browse services, add to cart, and make bookings with specific dates and addresses.
- **JWT Authentication:** Secure authentication using JWT (JSON Web Tokens).
- **Responsive UI:** Built with React, Bootstrap, and smooth animations using AOS and Lenis.
- **Admin Panel:** Complete overview of users, providers, services, bookings, categories, and settings.

## 🛠️ Technology Stack
### Frontend
- **Framework:** React 19 with Vite
- **Routing:** React Router v7
- **Styling:** Bootstrap, Custom CSS
- **Animations/UI:** AOS, Lenis, SweetAlert2
- **HTTP Client:** Axios

### Backend
- **Framework:** Django 6.0
- **API:** Django REST Framework (DRF)
- **Database:** SQLite (local) / PostgreSQL (production)
- **Authentication:** SimpleJWT

## 📂 Project Structure
```txt
Zyphera-V2/
├── backend/
│   ├── accounts/          # custom user model + auth domain
│   ├── bookings/          # booking domain (bookings + related endpoints)
│   ├── core/              # shared/core app
│   ├── dashboard/         # dashboard endpoints/pages backing logic
│   ├── zyphera/          # Django project settings/urls
│   ├── manage.py
│   ├── requirements.txt
│   └── build.sh
└── frontend/
    └── src/
        ├── api/           # axios client (frontend/src/api/axios.js)
        ├── context/       # AuthContext + CartContext
        ├── components/    # Navbar, Footer, CustomCursor
        ├── pages/         # route-level UI (Home/Login/Register/Cart + Buyer/Seller/Admin)
        └── utils/         # validators + toast helpers
```

High-level layout:
- **`backend/`** exposes the REST API (Django + DRF).
- **`frontend/`** is the React/Vite SPA that consumes the API.

## 🌐 API Overview
The backend is a **Django REST Framework** API. Requests from the React frontend are routed through a configured Axios client:
- `frontend/src/api/axios.js`

### Main API domains (by Django app)
- `accounts/` — authentication and user/provider account operations (JWT via SimpleJWT).
- `bookings/` — booking creation and booking management endpoints.
- `core/` — shared app endpoints (common operations used across the project).
- `dashboard/` — dashboard-oriented endpoints (admin/buyer/seller views data).

### Typical frontend flows
- **Auth**: React login/register pages obtain JWT, stored in auth context.
- **Browsing**: Buyer/seller pages request service/category data.
- **Cart + Booking**: Cart operations feed into booking requests (date/address driven).
- **Admin**: Admin pages query lists/metrics across users, providers, services, and bookings.

