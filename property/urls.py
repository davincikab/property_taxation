from django.urls import path
from django.conf import settings
# from django.urls import static

from .views import map_view, dashboard_view, land_parcels

app_name = "property"
urlpatterns = [
    path("map/", map_view, name="map-view"),
    path("parcels/", land_parcels, name="land-parcels"),
]
