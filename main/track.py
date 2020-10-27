import requests
import json

from threading import Thread 
from multiprocessing import Queue

import numpy as np
from geopy.distance import great_circle
from scipy.optimize import fsolve
from math import floor,ceil

from django.http import JsonResponse,HttpResponse
from .models import Creeper,Victim,Footprint


# the target info
# for user do not display photo, you can only use id to find him
TEST = 'gtk1' # gtk1 34258994

class Track:
    def __init__(self,uuid,token=None):
        self.uuid = uuid
        self.token = token

    def login(self):
        # this spent a little seconds to get accessToken
        # for firfox hackerbar replace : , to = &

        # POST json to https://volta.gethornet.com/api/v3/session.json
        # params ={
        #     "session[id]":"email",
        #     "session[provider]":"Hornet",
        #     "session[secret]":"password"
        # }
        
        # POST json to https://gethornet.com/api/v3/session.json with abaritary id
        # posting normal data, you should syntax as: data=params
        # json data, json=jsparams 
        head = {"Content-Type":"application/json; charset=UTF-8"}
        jsparams = {"session":{"id":"{}".format(self.uuid),"provider":"UDID","secret":""}}

        r = requests.post("https://gethornet.com/api/v3/session.jsonn", headers=head, json=jsparams)
        jsdata = r.json()
        
        #print(json.dumps(jsdata,indent=4))
        token = jsdata['session']['access_token']
        return token

    def idrequest(self,identity):
        url = "https://volta.gethornet.com/api/v3/members/{}.json".format(identity)
        heads = {
            "Authorization": "Hornet {}".format(self.token)
        }

        r= requests.get(url=url,headers=heads)

        # Unauthorized Error - hornet token error
        if r.status_code==401:
            # Do relogin and document te token
            print('Unauthorized and relogin') 
            self.token = self.login()
            return self.detailinfo(name,location)

        return r

    def memberinfo(self,name,location):

        url = "https://volta.gethornet.com/api/v3/members/{}/public.json".format(name)
        heads = { 
            "Authorization": "Hornet {}".format(self.token),
            "X-Device-Location":"{},{}".format(location[0],location[1]),
            "Origin": 'https://hornet.com'
        }

        r = requests.get(url=url,headers=heads)
        #connection status/content
        #print(r)

        # Unauthorized Error - hornet token error
        if r.status_code==401:
            # Do relogin and document te token
            print('Unauthorized and relogin') 
            self.token = self.login()
            return self.memberinfo(name,location)

        # NotFound - the user donot exist or not public his information 	
        if r.status_code==404:
            print('{} is not public or not exist'.format(name))

        # Success	
        if r.status_code==200:
            jsondata = r.json()
            #member information
            #print(json.dumps(jsondata,indent=4))
            return jsondata
    
    def memberdistance(self,name,location):
        info = self.memberinfo(name,location)
        distance= info['member']['distance']*1000

        if 100 < distance < 1000:
            normd = distance/100
            if int(normd)==normd:
                return self.memberdistance(name,location)
            else:
                modified = (floor(normd)+ceil(normd))*50
                # print(location,modified)
                return modified
        elif 80<distance<=100:
            # print(location,90)
            return 90
        else:
            # print(location,distance)
            return distance
    
    def trilaterate4Hornet(self,name,guess,guess_backup):
        # 111320 meter / 1 degree in latitude
        LAT = 111320

        lat_unit = np.array([1/LAT,0])
        guess0 = np.array(guess)
        d0 = self.memberdistance(name,guess0)

        if d0/LAT > 120:
            guess0 = np.array(guess_backup)
            d0 = self.memberdistance(name,guess0)

        count = 0
        while True:
            # guess0 would be looply update 
            lat0 = guess0[0]
            lng0 = guess0[1]

            guess1 = guess0-d0*lat_unit
            d1 = self.memberdistance(name,guess1)
            
            fun = lambda r: [great_circle(guess0,r).meters-d0
                            ,great_circle(guess1,r).meters-d1]

            modify = lambda res: [ (res[0]+90)%180 -90 if abs(res[0]) > 90 else res[0]
                                  ,(res[1]+180)%360 -180 if abs(res[1]) > 180  else res[1] ]
        
            res_a = modify(fsolve(fun,guess0))
            res_b = modify(np.array([res_a[0], lng0*2-res_a[1]]))

            da = self.memberdistance(name,res_a)
            db = None
            if da==80:
                print('name: {}\nLatlng: {}\nCount: {}'.format(name,res_a,count))
                return res_a
            else:
                db = self.memberdistance(name,res_b)
                if db==80:
                    print('name: {}\nLatlng: {}\nCount: {}'.format(name,res_a,count))
                    return res_b
                else:
                    count+=1
                    if da<db:
                        guess0=res_a
                        d0=da
                    else:
                        guess0=res_b
                        d0=db

    def optimizeAccuracy(self,name,location80):
        que = Queue()
        thread = []
        f = lambda probe: que.put(probe) if self.memberdistance(name,probe)==80 else None 

        drange = np.linspace(-160,160,num=21)/111320
        for dx in drange:
            for dy in drange:
                probe = np.array(location80)+np.array([dx,0]+np.array([0,dy]))
                t=Thread(target=f,args=(probe,))
                t.start()
                thread.append(t)

        for t in thread:
            t.join()
        
        effectloction = []
        while not que.empty():
            effectloction.append(que.get())
            
        return  np.sum(effectloction,axis=0)/len(effectloction)


def historyResponse(requests):
    if 'uuid' in requests.COOKIES:
        UUID = requests.COOKIES['uuid']
        victims = Victim.objects.filter(whose__created_by__uuid=UUID).distinct().values('identify')
        return JsonResponse({'victims':list(victims)})

def roughResponse(requests):
    INVALID_AFTER = 60*60*24*365*100
    uuid = requests.COOKIES['uuid']
    token = requests.COOKIES['token']
    track = Track(uuid,token)

    guess =(25.053069, 121.513006)
    guess_backup = (37.422002, -122.083956)

    # decode bytes
    data = requests.body.decode('utf-8')
    jsondata = json.loads(data)
    name = jsondata['name']
    location = track.trilaterate4Hornet(name,guess,guess_backup)

    response = JsonResponse({'lat':location[0],'lng':location[1]})
    response.set_cookie('token',track.token,max_age=INVALID_AFTER)
    
    return response

def accurateResponse(requests):
    INVALID_AFTER = 60*60*24*365*100
    uuid = requests.COOKIES['uuid']
    token = requests.COOKIES['token']
    track = Track(uuid,token)

    guess =(25.053069, 121.513006)
    guess_backup = (37.422002, -122.083956)

    # decode bytes
    data = requests.body.decode('utf-8')
    jsondata = json.loads(data)
    name = jsondata['name']
    location = track.trilaterate4Hornet(name,guess,guess_backup)
    location = track.optimizeAccuracy(name,location)

    #insert into database if success
    info = track.memberinfo(name,location)
    identify = info['member']['id']
    # last appear can only request by id
    idrequest = track.idrequest(identify).json()
    appear_at = idrequest['member']['last_online'] 

    # QuerySet return false if there is no such victim in database
    if not Victim.objects.filter(identify=identify):
        Victim.objects.create(identify=identify)

    Footprint.objects.create(
        whose=Victim.objects.get(identify=identify),
        latitude = location[0],
        longitude = location[1],
        created_by = Creeper.objects.get(uuid=uuid),
        created_at = appear_at
    )
    
    response = JsonResponse({'identify':identify,'lat':location[0],'lng':location[1]})
    response.set_cookie('token',track.token,max_age=INVALID_AFTER)

    return response

def footprintResponse(requests):
    data = requests.body.decode('utf-8')
    jsondata = json.loads(data)
    victimid = jsondata['id']

    foot =Footprint.objects.filter(whose__identify=victimid).order_by('created_at').values('latitude','longitude','created_at')
    # foot_center = list((np.max(foot,axis=0)+np.min(foot,axis=0))/2)

    return JsonResponse({'foot':list(foot)})

def deleteVictimId(requests):
    uuid = requests.COOKIES['uuid']
    token = requests.COOKIES['token']
    track = Track(uuid,token)

    data = requests.body.decode('utf-8')
    jsondata = json.loads(data)
    deleteid = jsondata['id']
 
    if track.idrequest(deleteid).status_code == 404:
        # while delete victim,
        # the footprint which pointed from victim will be also deleted
        Victim.objects.get(identify=deleteid).delete()
    
    return HttpResponse(status=204)

def clearFootprintCreater(requests):
    uuid = requests.COOKIES['uuid']
    token = requests.COOKIES['token']
    track = Track(uuid,token)

    data = requests.body.decode('utf-8')
    jsondata = json.loads(data)
    clearid = jsondata['id']

    # set the creator of such footprint id as public (None)  
    Footprint.objects.filter(created_by__uuid=uuid,whose__identify=clearid).update(created_by=None)
    
    return HttpResponse(status=204)


