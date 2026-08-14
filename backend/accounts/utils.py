import math
from decimal import Decimal


def haversine(lat1, lng1, lat2, lng2):
    """Return distance in km between two coordinates."""
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def calculate_travel_fee(distance_km, service_location):
    """Return travel fee in Decimal based on distance and service pricing rules."""
    free_r = float(service_location.free_radius_km)
    if distance_km <= free_r:
        return Decimal('0.00')
    billable = distance_km - free_r
    return (Decimal(str(billable)) * service_location.price_per_km).quantize(Decimal('0.01'))
