from django.db import models

class Victim(models.Model):
    identify = models.IntegerField(blank=False)

class Creeper(models.Model):
    uuid = models.TextField(blank=False)
    created_at = models.DateTimeField(auto_now_add=True)

class Footprint(models.Model):
    # in django 2.0 on_delete should be set
    # while a victim is deleted his account, the footprint is no longer useful
    # Cascadely delete these footprints. 
    whose = models.ForeignKey(Victim,related_name='whose',on_delete=models.CASCADE)
    latitude = models.FloatField()
    longitude = models.FloatField()
    created_by = models.ForeignKey(Creeper,related_name='created_by',null=True,on_delete=models.SET_NULL)
    created_at = models.DateTimeField(blank=False)
    