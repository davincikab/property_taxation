from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required

# serializer
from django.core.serializers import serialize

# models
from .models import ParcelInfo, Parcels

# utils
import json
import requests

def landing_page(request):
    return render (request, 'property/landing.html')

# Create your views here.
def map_view(request):
    return render(request, 'property/map.html')

def dashboard_view(request):
    return render(request, 'property/dashboard.html')


# load the data
def land_parcels(request):
    # fetch related data
    parcel_info = ParcelInfo.objects.select_related('parcel')
    parcelInfo = serialize('json', parcel_info)
    parcels = serialize('geojson', Parcels.objects.all())
    return HttpResponse(json.dumps([parcelInfo, parcels]))

class ParcelDetail():
    pass



