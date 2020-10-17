from django.contrib import admin
from .models import TaxationHistory, ParcelInfo

# Register your models here.
@admin.register(TaxationHistory)
class TaxationHistoryAdmin(admin.ModelAdmin):
    list_display = ('transaction_id', 'plot_no', 'amount', 'payment_mode', 'balance', 'payed_on')
    list_filter = ('payment_mode', 'is_waived')

@admin.register(ParcelInfo)
class ParcelInfoAdmin(admin.ModelAdmin):
    list_display = ('parcel','id_number', 'id_number', 'arrears', 'owner')
    list_fileter = ('is_cleared')