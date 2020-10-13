from django.contrib.gis.db import models


class ParcelInfo(models.Model):
    id = models.IntegerField(primary_key=True)
    plot_no = models.ForeignKey('Parcels', models.DO_NOTHING, db_column='plot_no', blank=True, null=True)
    owner = models.CharField(max_length=255, blank=True, null=True)
    arrears = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'parcel_info'


class Parcels(models.Model):
    id = models.BigIntegerField()
    geom = models.MultiPolygonField(srid=3857, blank=True, null=True)
    plot_no = models.BigIntegerField(primary_key=True)
    owner = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'parcels'
