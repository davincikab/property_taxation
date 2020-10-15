from django import forms

class MpesaPaymentForm(forms.Form):
    amount = forms.IntegerField(label="Amount", required=True)
    phone_number = forms.CharField(label="Phone Number", max_length=10, required=True)
