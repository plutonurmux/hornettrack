import {observable,action, reaction} from 'mobx'
import L from 'leaflet'
import 'leaflet.gridlayer.googlemutant'
import { Lmock , Lfootprint, Lmyposition} from 'component/LMapMarker'
import authConstnat from 'constant/auth'
import mapConstant from 'constant/map'
import api from 'api';


class Map{
    map
    mockGroup
    mypositionGroup
    footprintGroup
    @observable mockposition 


    init= (map)=>{
        this.map = map
        // Set default Style
        L.gridLayer.googleMutant({
            type:'roadmap'  // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
        }).addTo(this.map)

        this.map.removeControl(this.map.zoomControl)
        

        // init layerGroup
        this.mockGroup = L.layerGroup().addTo(this.map)
        this.mypositionGroup = L.layerGroup().addTo(this.map)
        this.footprintGroup = L.layerGroup().addTo(this.map)
    }

    @action mockTo =(position)=>{
        this.mockposition = position
        this.mockGroup.clearLayers()

        L.marker(position,{icon:Lmock,zIndexOffset:1000})
            .addTo(this.mockGroup)
        this.mockGroup.addTo(this.map)
    }

    @action setMyPosition=(position,zoomsize)=>{
        this.map.setView(position,zoomsize)
        this.mockTo(position)

        this.mypositionGroup.clearLayers()
        L.marker(position,{icon:Lmyposition,zIndexOffset:10})
            .addTo(this.mypositionGroup)
        this.mypositionGroup.addTo(this.map)
    }

    setFootprintbyRequest = (id)=>{
        api.footprintRequest({
            id: id,
            CSRF_TOKEN : authConstnat.CSRF_TOKEN
        })
        .then( footprints=>{
            if(footprints.length){
                let latest = footprints.slice(-1)[0]
                this.map.setView(latest, mapConstant.DistrictZoomSize)

                footprints.map((position)=>{
                    L.marker(position,{icon: Lfootprint,zIndexOffset:2000}).addTo(this.footprintGroup)
                })
                this.footprintGroup.addTo(this.map)
            }
        })
    }

    setFootprint(position){
        this.map.setView(position, mapConstant.StreetZoomSize)
        L.marker(position,{icon: Lfootprint}).addTo(this.footprintGroup)          
        this.footprintGroup.addTo(this.map)
    }


    clearFootprint= ()=>{
        this.footprintGroup.clearLayers()
        this.footprintGroup.addTo(this.map)
    }


    registClickMock = ()=>{
        this.map.addEventListener('click', this.onMapClick)
    }

    unregistClickMock = ()=>{
        this.map.removeEventListener('click', this.onMapClick)
    }


    onMapClick =(e)=>{
        const position = e.latlng
        this.mockTo(position)
    }   



}

export default new Map()

