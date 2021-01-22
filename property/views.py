from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.decorators import login_required
from django.db.models import Count, Sum
from django.views.decorators.csrf import csrf_exempt

# serializer
from django.core.serializers import serialize

# models
from .models import ParcelInfo, Parcels, TaxationHistory

# utils
import json
import requests
from datetime import datetime

def landing_page(request):
    if request.GET.get('plot_no'):
        plot_no = request.GET.get('plot_no')
        try:
            parcel = ParcelInfo.objects.get(parcel = plot_no)
            parcel = {'arrears':parcel.arrears, 'parcel':parcel.parcel}
        except ParcelInfo.DoesNotExist:
            parcel = "None"
        
        context = {'parcel':parcel}
    else:
        context =  {}
        
    return render(request, 'property/landing.html', context)

def graph_data(request):
    arrears_zone = ParcelInfo.objects.values('parcel__zone').annotate(total=Sum('arrears'))
    collection_history = TaxationHistory.objects.values('payed_on__year').annotate(total=Sum('amount'))
    payment_mode = TaxationHistory.objects.values('payment_mode').annotate(total=Sum('amount'))

    arrears_zone = [{ar['parcel__zone']:ar['total']} for ar in arrears_zone]
    collection_history = [{ar['payed_on__year']:ar['total']} for ar in collection_history]
    payment_mode = [{ar['payment_mode']:ar['total']} for ar in payment_mode ]

    return JsonResponse({'arrear':arrears_zone, 'collection':collection_history, 'payment_mode':payment_mode})

    # 
# Create your views here.
def map_view(request):
    return render(request, 'property/map.html')

def dashboard_view(request):
    context = {}
    context['parcels_count'] = Parcels.objects.all().count()
    context['owner_count'] = ParcelInfo.objects.values('id_number').annotate(Count('id_number', distinct=True)).count()
    context['arrears'] = ParcelInfo.objects.aggregate(total = Sum('arrears'))

    # collected this year
    currentTime = datetime.now()
    year = currentTime.year
    dt = datetime(year, 1, 1)
    context['collected'] = TaxationHistory.objects.filter(payed_on__gte = dt).aggregate(total=Sum('amount'))
    context['arrears_zone'] = ParcelInfo.objects.values('parcel__zone').annotate(total=Sum('arrears'))
    context['collection_history'] = TaxationHistory.objects.values('payed_on__year').annotate(total=Sum('amount'))
    context['payment_mode'] = TaxationHistory.objects.values('payment_mode').annotate(total=Sum('amount'))

    return render(request, 'property/dashboard.html', context)


# load the data
def land_parcels(request):
    # fetch related data
    parcel_info = ParcelInfo.objects.select_related('parcel')
    parcelInfo = serialize('json', parcel_info)
    parcels = serialize('geojson', Parcels.objects.all())
    return HttpResponse(json.dumps([parcelInfo, parcels]))

class ParcelDetail():
    pass

@csrf_exempt
def ussd_callback(request):
    response = ""
    if request.method == "POST":
        session_id = request.POST.get("sessionId", None)
        service_code = request.POST.get("serviceCode", None)
        phone_number = request.POST.get("phoneNumber", None)
        text = request.POST.get("text", "default")

        if text == "":
            response += "CON Input Your Id Number"
        elif text == "0":
            response = "END"
        elif text != "":
            try:
                id_number = int(text)

                # get the land with the given Id
                parcels = ParcelInfo.objects.filter(id_number=id_number)

                if len(parcels) == 0:
                    response += "END No Land Registered with this " + str(id_number) + " number"
                else:
                    response += "END Land Rates Arrears for " + str(id_number) + ".\n"
                    for parcel in parcels:
                        print(parcel.parcel.plot_no)
                        response += "LR No. " + str(parcel.parcel.plot_no) + " has Ksh " + str(parcel.arrears) + " not paid.\n"
            except ValueError:
                response += "CON Invalid Input. Try Again"
        
        return HttpResponse(response)
            
