# Zyphera-V2

Zyphera is a full-stack hyperlocal service marketplace and booking platform. It connects buyers with verified service providers (sellers), supports service discovery and booking, and now includes location-aware service coverage using Google Maps.

The application is split into a React/Vite single-page frontend and a Django/Django REST Framework backend.

## Features

### Authentication and roles
- JWT-based authentication with access and refresh tokens.
- Roles: Buyer, Seller, Admin, and Super Admin.
- Seller accounts require admin approval before their services become available.
- Protected React routes are role-aware.
- Access-token refresh is handled through the frontend Axios client and auth initialization.

### Buyer features
- Browse active services and filter by category.
- View service details, provider profiles, ratings, and reviews.
- Maintain a saved/default location with address, latitude, longitude, and Google Place ID.
- Use Google Maps to search for an address, drag a map marker, or detect the current location.
- View the **Services Near You** map and nearby service cards.
- Nearby services are ranked by distance and limited by each service's coverage radius.
- See distance, travel fee, platform fee, and calculated display price for nearby services.
- Add services to a cart.
- Book services with a date, address, buyer coordinates, and notes.
- View booking history and cancel eligible bookings.
- Submit reviews for completed bookings.
- Post a custom service request to an admin or available provider.

### Seller features
- Seller dashboard and profile management.
- Add, activate/deactivate, and manage services.
- Configure a separate **service origin/coverage location** for each service.
- Set service coverage radius and free-travel radius.
- Configure travel pricing and optional fee modifiers:
  - Price per additional kilometre
  - Platform fee
  - Peak-hour percentage
  - Weekend percentage
  - Emergency fee
- View seller bookings and update booking status through the supported workflow.
- Manage seller availability.

### Location and hyperlocal service features
- Google Maps JavaScript integration with a shared loader.
- Google Places/autocomplete support in location pickers.
- Reverse geocoding for map-selected coordinates.
- Buyer location is persisted locally and synchronized to the backend profile.
- Service locations are stored separately from the seller's business/profile location.
- Nearby-service discovery uses the Haversine distance calculation.
- Only services within their configured service radius are returned by the nearby-services endpoint.
- Travel fees are free inside the configured free radius and can be charged per kilometre outside it.
- Booking creation recalculates travel and platform fees from the buyer coordinates and the service location, rather than trusting only the frontend display price.

### Booking and pricing
- Booking states: Pending, Accepted, Completed, Cancelled.
- Bookings store base price, travel fee, platform fee, total price, service address, buyer latitude/longitude, and notes.
- Seller-side status transitions are validated by the backend.

### Reviews and administration
- One review per booking.
- Service review listings and rating summaries.
- Admin dashboard statistics.
- Seller approval/rejection management.
- Admin CRUD/management endpoints for users, providers, services, categories, bookings, requests, and reviews.
- Django admin is also enabled.

## Technology Stack

### Frontend
- React 19
- Vite
- React Router 7
- Axios
- Bootstrap 5
- SweetAlert2
- AOS
- Lenis
- Custom CSS
- Google Maps JavaScript API / Places / Geocoding

### Backend
- Django 6
- Django REST Framework 3.17
- SimpleJWT
- django-cors-headers
- SQLite for local development
- PostgreSQL supported through `DATABASE_URL` for production
- Gunicorn
- WhiteNoise
- Pillow
- `django-database-url`

## Project Structure

```text
Zyphera-V2/
├── backend/
│   ├── accounts/          # users, authentication, services, locations, reviews, cart, requests
│   ├── bookings/          # booking creation, cancellation, buyer/seller booking endpoints
│   ├── core/              # shared Django app scaffolding
│   ├── dashboard/         # admin dashboard and management API endpoints
│   ├── zyphera/           # Django settings, root URLs, WSGI
│   ├── media/              # uploaded service media (when generated locally)
│   ├── manage.py
│   ├── requirements.txt
│   └── build.sh
└── frontend/
    ├── src/
    │   ├── api/            # Axios client + JWT handling
    │   ├── context/        # Auth, cart, and buyer location state
    │   ├── components/     # reusable UI, maps, booking/review modals, route guard
    │   ├── hooks/          # Google Maps and nearby-service hooks
    │   ├── pages/          # public, buyer, seller, and admin route-level UI
    │   └── utils/          # validation and toast helpers
    ├── public/
    ├── .env                # local frontend environment variables (do not commit secrets)
    ├── package.json
    └── vite.config.js
```

## Architecture

```text
React / Vite SPA
       |
       | Axios + JWT
       v
Django REST Framework API
       |
       +--> accounts
       |      +-- Users / Roles
       |      +-- Services
       |      +-- Service Locations
       |      +-- Categories
       |      +-- Cart
       |      +-- Reviews
       |      +-- Requests
       |
       +--> bookings
       |      +-- Booking creation / cancellation
       |      +-- Buyer booking APIs
       |      +-- Seller booking APIs
       |
       +--> dashboard
       |      +-- Admin statistics / management
       |
       v
SQLite (local) / PostgreSQL (production)
```

## Location Model

Zyphera intentionally separates the following concepts:

### Buyer location
Stored on the `accounts.User` model:
- `location`
- `latitude`
- `longitude`
- `place_id`

The frontend exposes this through `LocationContext`, persists it in `localStorage` under `buyer_location`, and synchronizes it to `PATCH /api/profile/` when authenticated.

### Seller business location
Stored on `SellerAdditionalDetails`:
- `business_address`
- `business_lat`
- `business_lng`

This is the seller's business/office location and is separate from the origin of an individual service.

### Service location
Stored in the one-to-one `ServiceLocation` model:
- `address`
- `latitude`
- `longitude`
- `radius_km`
- `free_radius_km`
- `price_per_km`
- `platform_fee`
- `peak_hour_pct`
- `weekend_pct`
- `emergency_fee`

This location is the operating/origin point used for nearby-service matching and distance-based pricing.

## Nearby-Service Logic

The nearby-service endpoint is:

```text
GET /api/services/nearby/?lat=<buyer_lat>&lng=<buyer_lng>&category=<optional>
```

The backend:

1. Selects active services whose sellers are approved and available.
2. Requires a `ServiceLocation`.
3. Calculates buyer-to-service distance with the Haversine formula.
4. Removes services outside the service's `radius_km`.
5. Calculates the travel fee using the service's free radius and price-per-kilometre configuration.
6. Adds the configured platform fee.
7. Returns services sorted by distance.

The frontend `useNearbyServices` hook refreshes the nearby list every 15 seconds while the page is active.

## Pricing Logic

The travel-fee helper is implemented in `backend/accounts/utils.py`.

Conceptually:

```text
if distance <= free_radius:
    travel_fee = 0
else:
    travel_fee = (distance - free_radius) * price_per_km
```

For nearby-service display and booking creation, the backend combines:

```text
base price + travel fee + platform fee
```

The `peak_hour_pct`, `weekend_pct`, and `emergency_fee` fields are stored as service-location pricing configuration, while the current booking calculation path applies the base/travel/platform components directly.

## Google Maps Configuration

The frontend uses the environment variable:

```env
VITE_GOOGLE_MAPS_KEY=YOUR_GOOGLE_MAPS_API_KEY
```

The Google Cloud project should have these APIs enabled:

- Maps JavaScript API
- Places API
- Geocoding API

For local development, restrict the browser API key to the frontend origins you actually use, for example:

```text
http://localhost:5173/*
http://127.0.0.1:5173/*
```

Do not commit a real API key to source control. Keep the actual value in the local `frontend/.env` file and provide a safe placeholder in shared documentation/configuration.

## API Overview

### Authentication

```text
POST /api/auth/register/
POST /api/auth/login/
POST /api/auth/logout/
POST /api/auth/token/refresh/
```

### Services and categories

```text
GET  /api/categories/
GET  /api/services/
GET  /api/services/nearby/?lat=<lat>&lng=<lng>
GET  /api/services/<id>/
GET  /api/services/<id>/reviews/
```

### Profile and account

```text
GET   /api/profile/
PATCH /api/profile/
POST  /api/profile/change-password/
DELETE /api/profile/delete/
```

### Seller

```text
GET   /api/seller/dashboard/
GET   /api/seller/services/
PATCH /api/seller/services/<id>/location/
PATCH /api/seller/services/<id>/toggle/
PATCH /api/seller/availability/
GET   /api/seller/bookings/
PATCH /api/seller/bookings/<id>/status/
```

### Buyer / booking

```text
GET   /api/buyer/bookings/
POST  /api/bookings/create/
PATCH /api/bookings/<id>/cancel/
```

### Cart

```text
GET    /api/cart/
POST   /api/cart/
DELETE /api/cart/remove/<id>/
POST   /api/cart/clear/
```

### Reviews and requests

```text
POST /api/reviews/
POST /api/requests/
```

### Admin API

```text
GET    /api/admin/stats/
GET    /api/admin/users/
PATCH  /api/admin/users/<id>/
GET    /api/admin/approvals/
POST   /api/admin/approvals/<id>/approve/
POST   /api/admin/approvals/<id>/reject/
GET    /api/admin/services/
PATCH  /api/admin/services/<id>/
GET    /api/admin/categories/
POST   /api/admin/categories/
PATCH  /api/admin/categories/<id>/
DELETE /api/admin/categories/<id>/
GET    /api/admin/bookings/
GET    /api/admin/requests/
GET    /api/admin/reviews/
DELETE /api/admin/reviews/<id>/
```

The exact HTTP methods should be confirmed against the view implementation when extending these APIs; some endpoint classes accept multiple methods depending on the action.

## Frontend Routes

### Public

```text
/
/login
/register
/services
/services/:id
/sellers/:id
/about
/contact
```

### Buyer

```text
/cart
/buyer/dashboard
/buyer/bookings
/buyer/profile
/buyer/profile/edit
```

### Seller

```text
/seller/dashboard
/seller/services
/seller/requests
/seller/profile
/seller/add-service
/seller/services/:id/location
```

### Admin

```text
/admin/dashboard
/admin/users
/admin/providers
/admin/services
/admin/categories
/admin/bookings
/admin/requests
/admin/settings
/admin/reviews
```

## Authentication Flow

1. Login/register returns a JWT access token, refresh token, and serialized user.
2. `AuthContext` persists all three values in `localStorage`.
3. The shared Axios client attaches the access token as a Bearer token.
4. On startup, `AuthContext` attempts a silent refresh when a refresh token exists and waits for initialization before `ProtectedRoute` redirects.
5. If an authenticated API request returns `401`, the Axios interceptor coordinates a refresh request and retries the failed request.
6. Only a definitively invalid/expired refresh token causes the frontend to clear authentication state and dispatch `auth:logout`.

## Local Development

### Prerequisites

- Node.js 18+
- Python 3.10+
- Git
- A Google Cloud project/API key for map features

### Backend

```bash
cd backend
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

macOS/Linux:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Apply migrations:

```bash
python manage.py migrate
```

Create an admin/superuser if needed:

```bash
python manage.py createsuperuser
```

Run Django:

```bash
python manage.py runserver
```

Default development API base:

```text
http://127.0.0.1:8000/api
```

### Frontend

```bash
cd frontend
npm install
```

Set the local Google Maps key and, if needed, API base URL in `frontend/.env`:

```env
VITE_GOOGLE_MAPS_KEY=YOUR_GOOGLE_MAPS_API_KEY
VITE_API_URL=http://127.0.0.1:8000/api
```

Start Vite:

```bash
npm run dev
```

Default development frontend:

```text
http://localhost:5173
```

Build for production:

```bash
npm run build
```

Run the configured linter:

```bash
npm run lint
```

## Production Notes

The backend is configured to use SQLite when `DATABASE_URL` is absent and PostgreSQL when it is provided. `build.sh` is intended for the backend deployment flow, and Gunicorn serves `zyphera.wsgi:application` in production.

Recommended production configuration includes:

```text
SECRET_KEY=<strong-secret>
DEBUG=False
DATABASE_URL=<postgresql-url>
ALLOWED_HOSTS=<backend-host>
FRONTEND_URL=<frontend-origin>
```

The frontend requires production versions of:

```text
VITE_API_URL=<backend-api-base-url>
VITE_GOOGLE_MAPS_KEY=<restricted-browser-api-key>
```

Do not commit production secrets or API keys.

## Current Development State

The project currently includes the first working layer of its hyperlocal-service architecture: buyer location persistence, Google Maps location picking, per-service coverage locations/radii, nearby-service discovery, distance-based travel fees, and backend-backed booking fee storage.

The structure is intentionally suitable for future enhancements such as richer pricing rules, multiple service coverage zones, technician assignment, ETA/live tracking, and more advanced geospatial queries.
