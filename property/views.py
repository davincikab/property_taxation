from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required

# serializer
from django.core.serializers import serialize

# models
from .models import ParcelInfo, Parcels

from.forms import MpesaPaymentForm
from .mpesa import LipaNaMpesa, MpesaC2BCredentials, MpesaAccessToken

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
    parcel_info = ParcelInfo.objects.select_related('plot_no')
    parcelInfo = serialize('json', parcel_info)
    parcels = serialize('geojson', Parcels.objects.all())
    return HttpResponse(json.dumps([parcelInfo, parcels]))

class ParcelDetail():
    pass



# MPESA links
def get_access_token(request):
    return HttpResponse(MpesaAccessToken.validated_access_token)


def lipa_na_mpesa_online(request):
    access_token = MpesaAccessToken.validated_access_token
    api_url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    headers = {"Authorization": "Bearer %s" % access_token}

    mpesa_request = {
        "BusinessShortCode":LipaNaMpesa.BusinessShortCode,
        "Password":LipaNaMpesa.decode_password,
        "Timestamp": LipaNaMpesa.timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": 1,
        "PartyA": 254740368934,
        "PartyB": LipaNaMpesa.BusinessShortCode,
        "PhoneNumber": 254740368934,
        "CallBackURL": "https://sandbox.safaricom.co.ke/mpesa/",
        "AccountReference": "David",
        "TransactionDesc": "Tax Arrears"
    }

    response = requests.post(api_url, json=mpesa_request, headers=headers)
    return HttpResponse("success")


@login_required
def lipa_na_mpesa(request):
    access_token = MpesaAccessToken.validated_access_token
    api_url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    headers = {"Authorization": "Bearer %s" % access_token}

    if request.method == "POST":
        # validate the form
        form = MpesaPaymentForm(request.POST)
        if form.is_valid():
            phone_number = form.cleaned_data['phone_number']
            amount = form.cleaned_data['amount']
            mpesa_request = {
                "BusinessShortCode":LipaNaMpesa.BusinessShortCode,
                "Password":LipaNaMpesa.decode_password,
                "Timestamp": LipaNaMpesa.timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": amount,
                "PartyA": phone_number,
                "PartyB": LipaNaMpesa.BusinessShortCode,
                "PhoneNumber": phone_number,
                "CallBackURL": "https://ip_address:port/callback",
                "AccountReference": "David",
                "TransactionDesc": "Tax Arrears"
            }
    else:
        form = MpesaPaymentForm()
    return render(request, 'payment/lipa_na_mpesa.html',{'form':form})

def lipa_na_mpesa_callback_url(request):
    pass

def lipa_na_mpesa_successful(request):
    # extract information from the response and update: payment, parcelInfo, taxationHistory

    pass

