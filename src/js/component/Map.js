import React, { Component } from 'react';
import styled from 'styled-components'
import { observer, inject } from 'mobx-react';

import mapConstant from 'constant/map'
import mapboxgl from 'mapbox-gl/dist/mapbox-gl'
mapboxgl.accessToken = mapConstant.MAPBOXGL_TOKEN

import api from 'api'



const MapContainer = styled.div`
    position: absolute;
    top: 0px;
    width: 100%;
    height: 100%;

    `

@inject('mapState','nearbyState')
@observer
class Map extends Component {
    
    constructor(props) {
        super(props);
        this.map
        this.nearbyState = this.props.nearbyState
    }
    

    componentDidMount(){
        this.container = document.getElementById('map')
        api.getBrowserUserPosition().then( here=>{
            console.log('Browser Position:',here)
            this.init({center: here})

        })
        .catch(error=>{
            console.log(error)
            this.init({center: mapConstant.DEFAULT_CENTER_POSITION })
        })
    }

    init = ( {center,zoom=15}) =>{
        this.map = new mapboxgl.Map({
            container: this.container,
            style: 'mapbox://styles/mapbox/streets-v11?optimize=true',
            center: center , // starting position [lng, lat]
            zoom: zoom // starting zoom
        });
        this.props.mapState.map = this.map
        this.changeDefaultStyle()
        this.nearbyState.renew(center)
    }

    changeDefaultStyle = ()=>{
        // inspect: map.stylesheet.layers 
        this.map.on('styledata',()=>{
            const textPropertyName = [
                'country-label',
                'state-label',
                'settlement-subdivision-label',
                'settlement-label',
                'road-label',
                'poi-label',
                'airport-label'
            ]
            textPropertyName.map(name=>{
                this.map.setLayoutProperty(name, 'text-field', ['get', 'name']);
            })            
        })

    }

    render() {
        return (
            <MapContainer id='map'/>
        );
    }
}

export default Map;


