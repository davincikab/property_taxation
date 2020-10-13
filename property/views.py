from django.shortcuts import render
from django.http import HttpResponse

# serializer
from django.core.serializers import serialize

# models
from .models import ParcelInfo, Parcels

def landing_page(request):
    return render (request, 'property/landing.html')

# Create your views here.
def map_view(request):
    return render(request, 'property/map.html')

def dashboard_view(request):
    return render(request, 'property/dashboard.html')


# load the data
def land_parcels(request):
    parcels = serialize('geojson', Parcels.objects.all())
    return HttpResponse(parcels)

class ParcelDetail():
    pass