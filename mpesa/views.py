
from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages
from django.utils import timezone

from.forms import MpesaPaymentForm
from .mpesa import LipaNaMpesa, MpesaC2BCredentials, MpesaAccessToken
from .models import MpesaPayment

from property.models import TaxationHistory, ParcelInfo

# utils
import requests
import json
from datetime import datetime


NGROK_URL = 'https://4eaef5c97567.ngrok.io'

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
    print(response.text)
    return HttpResponse("success")


@login_required(login_url='/user/login/' )
def lipa_na_mpesa(request, plot_no, amount):
    access_token = MpesaAccessToken.validated_access_token
    api_url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    headers = {"Authorization": "Bearer %s" % access_token}

    # check if the parcels are registered to user
    parcel = ParcelInfo.objects.get(parcel = plot_no)
    if parcel.id_number != request.user.id_number:
        messages.warning(request, f'Parcel with Plot Number {plot_no} not registered to you.')
        return redirect('/user/account/')
    if request.method == "POST":
        # validate the form
        form = MpesaPaymentForm(request.POST)
        if form.is_valid():
            phone_number = form.cleaned_data['phone_number']
            amount = form.cleaned_data['amount']
            text_description = "Lipa Arrear. Plot " + str(plot_no)
            id_number = request.user.id_number
            
            mpesa_request = {
                "BusinessShortCode":LipaNaMpesa.BusinessShortCode,
                "Password":LipaNaMpesa.decode_password,
                "Timestamp": LipaNaMpesa.timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": amount,
                "PartyA": int(phone_number),
                "PartyB": LipaNaMpesa.BusinessShortCode,
                "PhoneNumber": int(phone_number),
                "CallBackURL": f"{NGROK_URL}/api/c2b/callback/?id_number={id_number}",
                "AccountReference": "Lipa Tax",
                "TransactionDesc": text_description
            }

            response = requests.post(api_url, json=mpesa_request, headers=headers)
            json_response = json.loads(response.text)

            print(json_response)
            if "errorCode" in json_response:
                messages.warning(request, "Payment Failed")
                return redirect('/user/account/')

            # redirect if success
            messages.success(request, "Payment Processing")
            return redirect('/user/account/?payment=true')
    else: 
        # pass user data
        initial_data = {
            'amount':amount,
            'phone_number':request.user.userprofile.phone_number,
            'plot_no':plot_no
        }

        form = MpesaPaymentForm(initial_data)
    return render(request, 'payment/lipa_na_mpesa.html',{'form':form})

@csrf_exempt
def register_urls(request):
    access_token = MpesaAccessToken.validated_access_token
    api_url = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl"
    headers = {"Authorization": "Bearer %s" % access_token}

    request = { 
        "ShortCode": LipaNaMpesa.c2bShortCode,
        "ResponseType": "Completed",
        "ConfirmationURL": f"{NGROK_URL}/api/c2b/confirmation",
        "ValidationURL": f"{NGROK_URL}/api/c2b/validation"
    }

    # send the request
    response = requests.post(api_url, json=request, headers=headers)
    return HttpResponse(response.text)

@csrf_exempt
def call_back(request):
    print("Callbacks .....")
    response_body = request.body.decode('utf-8')
    mpesa_info = json.loads(response_body)
    
    # result code
    result_code = mpesa_info['Body']['stkCallback']['ResultCode']
    print(mpesa_info)
    print(request.GET.get('id_number'))
    # if success 
    if result_code == 0:
        metadata = mpesa_info['Body']['stkCallback']['CallbackMetadata']['Item']
        transaction_code = metadata[1]['Value']
        value = metadata[0]['Value']
        id_number = request.GET.get('id_number')

        # update the parcelInfo
        parcel_info = ParcelInfo.objects.get(id_number = id_number)

        balance = int(parcel_info.arrears) - int(value)
        parcel_info.arrears = balance
        parcel_info.save()

        # create a tax history report
        taxHistory = TaxationHistory(
            plot_no=parcel_info.parcel.plot_no,
            payed_on=timezone.now(),
            payment_mode="MPESA",
            amount=value,
            balance=balance,
            transaction_id=transaction_code,
            id_number=int(id_number)
        )

        taxHistory.save()

    # if calcelled
    if result_code != 0:
        resultDesc = mpesa_info['Body']['stkCallback']['ResultDesc']
        # messages.warning(request, resultDesc)
        # return redirect('/user/account/')


    return HttpResponse("Success")

@csrf_exempt
def validation(request):
    print("Validating ......")
    context = {
        'ResultCode':0,
        'ResultDesc':'Accepted'
    }

    return JsonResponse(dict(context))


@csrf_exempt
def confirmation(request):
    print("Confirmation ......")
    response_body = request.body.decode('utf-8')
    mpesa_info = json.loads(response_body)

    print(mpesa_info)
    # create a MpesaPayment object
    payment = MpesaPayment(
        first_name=mpesa_info['FirstName'],
        last_name=mpesa_info['LastName'],
        middle_name=mpesa_info['MiddleName'],
        description=mpesa_info['TransID'],
        phone_number=mpesa_info['MSISDN'],
        amount=mpesa_info['TransAmount'],
        reference=mpesa_info['BillRefNumber'],
        organization_balance=mpesa_info['OrgAccountBalance'],
        type=mpesa_info['TransactionType'],
    )

    payment.save()

    # context response
    context = {
        "ResultCode": 0,
        "ResultDesc": "Accepted"
    }

    # return a response
    return JsonResponse(dict(context))



# TODO
# model relationship: parcelInfo and users 


# Success Response
{
    'Body': {
        'stkCallback': {
        'MerchantRequestID': '8083-53694812-1', 
        'CheckoutRequestID': 'ws_CO_161020201355257848', 
        'ResultCode': 0, 
        'ResultDesc': 'The service request is processed successfully.', 
        'CallbackMetadata': {
            'Item': [
                {'Name': 'Amount', 'Value': 1.0}, 
                {'Name': 'MpesaReceiptNumber', 'Value': 'OJG4JQKFH2'}, 
                {'Name': 'Balance'}, 
                {'Name': 'TransactionDate', 'Value': 20201016134509},
                {'Name': 'PhoneNumber', 'Value': 254740368934}
            ]
        }
    }
    }
}

# Calcelled  response 
{
    'Body': {
        'stkCallback': {
            'MerchantRequestID': '16456-220807334-1', 
            'CheckoutRequestID': 'ws_CO_161020201857254659', 
            'ResultCode': 1032, 
            'ResultDesc': 'Request cancelled by user'
            }
    }
}


# Successful payment
# success message
# redirect
# update plot info, arrears
