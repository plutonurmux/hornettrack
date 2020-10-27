from django.shortcuts import render
from .models import Victim,Creeper
from .track import Track
from user_agents import parse
import uuid 

# Create your views here.

def index(request):
    #  in cookie based: request.COOKIES['uuid']
    #                   response.set_cookie('uuid',UUID)

    response=None
    AGENT = parse(request.META['HTTP_USER_AGENT'])

    if 'uuid' not in request.COOKIES or not Creeper.objects.filter(uuid=request.COOKIES['uuid']):
        INVALID_AFTER = 60*60*24*365*100
        response = render(request,'index.html') if AGENT.is_pc else render(request,'legacy-index.html')
        UUID = uuid.uuid1().hex
        TOKEN = Track(UUID).login()
        response.set_cookie('uuid',UUID,max_age=INVALID_AFTER)
        response.set_cookie('token',TOKEN,max_age=INVALID_AFTER)
        Creeper.objects.create(uuid=UUID)
    else:
        UUID = request.COOKIES['uuid']
        #  too powerful and clean!!? 
        #  double underline foreign to whose and again foreign to created_by ...
        victims = Victim.objects.filter(whose__created_by__uuid=UUID).distinct()
        response = render(request,'index.html',{'victims':victims}) if AGENT.is_pc else render(request,'legacy-index.html',{'victims':victims})

    return response