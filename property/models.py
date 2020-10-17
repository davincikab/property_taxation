from django.contrib.gis.db import models

class Parcels(models.Model):
    id = models.BigIntegerField()
    geom = models.MultiPolygonField(srid=3857, blank=True, null=True)
    plot_no = models.BigIntegerField(primary_key=True)
    owner = models.CharField(max_length=50, blank=True, null=True),
    zone = models.CharField("Parcel Zone", max_length=50, default="Zone A")

    class Meta:
        managed = False
        db_table = 'parcels'

class TaxationHistory(models.Model):
    PAYMENT_MODE = (
        ('MPESA', "M-PESA"),
        ('Bank', "Bank")
    )

    # parcel = models.ForeignKey(Parcels, db_column='plot_no', on_delete=models.CASCADE)
    plot_no = models.BigIntegerField(blank=True, null=True)
    payed_on = models.DateTimeField("Payed On", auto_now=False, auto_now_add=False)
    is_waived = models.BooleanField("Waiver", default=False)
    payment_mode = models.CharField("Payment Method", max_length=50, choices=PAYMENT_MODE)
    amount = models.IntegerField("Amount", blank=True, null=True)
    balance = models.IntegerField("Arrear",default=0)
    transaction_id = models.CharField("Transaction Id", max_length=50)
    id_number = models.IntegerField("Id Number")

    class Meta:
        verbose_name = "Tax History"
        verbose_name_plural = "Tax History"

    def __str__(self):
        return self.transaction_id

    # def get_absolute_url(self):
    #     return reverse("_detail", kwargs={"pk": self.pk})

class ParcelInfo(models.Model):
    id = models.IntegerField(primary_key=True)
    parcel = models.OneToOneField(Parcels, db_column='plot_no', blank=True, null=True, on_delete=models.CASCADE)
    owner = models.CharField(max_length=255, blank=True, null=True)
    arrears = models.CharField(max_length=100, blank=True, null=True)
    is_cleared = models.BooleanField("Arrears Cleared", default=False)
    id_number = models.BigIntegerField("Owner Id Number", unique=False)

    class Meta:
        managed = False
        db_table = 'parcel_info'


