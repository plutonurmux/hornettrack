import React, { Component } from 'react';
import ReactDom from 'react-dom'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencilAlt, faCrosshairs, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons'
import { observer, inject } from 'mobx-react';

import mapboxgl from 'mapbox-gl/dist/mapbox-gl'

import api from 'api'
import { Icon } from 'styled';

const Wrapper = styled.div`
    `

const Control = styled.div`
    `



const IconWrapper = styled.div`
    display: flex;
    align-items: center;
    background-color: white;
    ${Icon}
    margin: 10px;
    font-size: 25px;
    `


class MapControl extends Component {

    constructor(props) {
        super(props);
        // Required
        // controls : Control Object Array
        // Control : Object {Icon, name, iconClicked}
    }
    
    render() {
        return (
            <Wrapper ref={this.props.myref} {...this.props}>
                { this.props.controls.map((c,index)=>
                    <Control key={index} onClick={c.iconClicked}>
                        <IconWrapper>{c.Icon}</IconWrapper>
                    </Control>
                )}
            </Wrapper>
        );
    }
}



export default React.forwardRef((props,ref)=> <MapControl myref={ref} {...props}/>) 