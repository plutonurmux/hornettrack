"""web URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url
from main.views import index
import main.track as tk


urlpatterns = [
    # url(r'^admin/', admin.site.urls),
    url(r'^$',index),
    url(r'^nearby$',index),
    url(r'^about$',index),
    url(r'^like$',index),
    url(r'^history/',tk.historyResponse),
    url(r'^accurate/',tk.accurateResponse),
    url(r'^rough/',tk.roughResponse),
    url(r'^footprint/',tk.footprintResponse),
    url(r'^delete/',tk.deleteVictimId),
    url(r'^clear/',tk.clearFootprintCreater)
]
