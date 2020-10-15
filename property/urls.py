from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from .views import map_view, dashboard_view, land_parcels, landing_page, get_access_token, lipa_na_mpesa_online

app_name = "property"

urlpatterns = [
    path("", landing_page, name="landing"),
    path("map/", map_view, name="map"),
    path("dashboard/", dashboard_view, name="dashboard"),
    path("parcels/", land_parcels, name="land-parcels"),

    # mpesa
    path("get_access_token/", get_access_token, name="mpesa-access-token"),
    path("lipa_online/", lipa_na_mpesa_online, name="mpesa-online")
]

# configure static anf media files
if settings.DEBUG:
    urlpatterns +=  static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns +=  static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)