
import styled, {keyframes} from 'styled-components'
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMapMarker,
         faFlag, faStar  } from '@fortawesome/free-solid-svg-icons'
import ReactDOMServer from 'react-dom/server';


import L from 'leaflet'


const MarkerWrapper = styled.div`
    display: flex;
    justify-content: center;
    transform: translate3d(-50%,-100%,0);
    `

const Marker = styled(FontAwesomeIcon)`
    font-size: 40px;
    color: ${props=> props.color};
    stroke-width: 7%;
    stroke: white;
    filter: drop-shadow(3px 3px 2px rgba(0, 0, 0, 0.6));
    user-select: none;
    `

const InnerMarker = styled(FontAwesomeIcon)`
    position: absolute;
    color:white;
    top: 10px;
    `



const ComponentToIcon = (component)=>{
    return L.divIcon({
        className: 'custom-leaflet-icon',
        iconSize: [0,0],
        html: ReactDOMServer.renderToString(component)
    })
}


export const Lmock = ComponentToIcon(
    <MarkerWrapper>
        <Marker color={'cornflowerblue'} icon={faMapMarker}/>
        <InnerMarker icon={faFlag}/>
    </MarkerWrapper>
)



const MyPositionWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    transform: translate(-50%,-50%);
    `

const fading = keyframes`
    from {
        opacity: 0.4
    }

    to{
        opacity: 0.1
    }
    `

const MyPostionOutSide = styled.div`
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    opacity: 0.4;
    border: 8px solid dodgerblue;
    animation: ${fading} 1s ease-in-out infinite;
    animation-direction: alternate-reverse;
    `

const MyPostionInside = styled.div`
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid white;
    background-color: dodgerblue;    

    `

           
export const Lmyposition = ComponentToIcon(
    <MyPositionWrapper>
        <MyPostionOutSide/>
        <MyPostionInside/>
    </MyPositionWrapper>
)

export const Lfootprint = ComponentToIcon(
    <MarkerWrapper>
        <Marker color={'orangered'} icon={faMapMarker}/>
        <InnerMarker icon={faStar}/>
    </MarkerWrapper>
)

