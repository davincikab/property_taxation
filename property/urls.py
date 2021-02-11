from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from .views import map_view, dashboard_view, land_parcels, landing_page, graph_data, ussd_callback, send_message

app_name = "property"

urlpatterns = [
    path("", landing_page, name="landing"),
    path("map/", map_view, name="map"),
    path("dashboard/", dashboard_view, name="dashboard"),
    path("parcels/", land_parcels, name="land-parcels"),
    path("graph_data/", graph_data, name="graph-data"),
    path("ussd_callback/",ussd_callback, name="ussd-callback"),
    path("send_message/", send_message, name="send-message")
]

# configure static anf media files
if settings.DEBUG:
    urlpatterns +=  static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns +=  static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)