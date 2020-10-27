import React, { Component } from 'react';
import styled from 'styled-components'
import { observer, inject } from 'mobx-react';

import L from 'leaflet'
import 'leaflet.gridlayer.googlemutant'



import mapConstant from 'constant/map'
import api from 'api'



const MapContainer = styled.div`
    position: absolute;
    top: 0px;
    width: 100%;
    height: 100%;
    z-index: 0;
    `

@inject('mapState')
@observer
class LMap extends Component {
    
    constructor(props) {
        super(props);
        
        this.map = this.props.mapState
        this.center = mapConstant.DEFAULT_CENTER_POSITION
        this._map
    }
    

    componentDidMount(){
        this._map = L.map('map')
        this.map.init(this._map)



        api.getBrowserUserPosition().then( here=>{
            this.center = here
            console.log('Browser Position:', this.center)
        })
        .catch(error=>{
            console.log(error)
        }).finally(()=>{
            this.map.setMyPosition(this.center, mapConstant.StreetZoomSize)
        })
    }
    render() {
        return (
            <MapContainer id='map'/>
        );
    }
}

export default LMap;


