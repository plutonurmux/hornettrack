import React, { Component } from 'react'
import styled from 'styled-components'
import posed, { PoseGroup,} from 'react-pose'

import {
    Route, 
    Switch,
    BrowserRouter as Router, 
    withRouter 
} from 'react-router-dom'

import { Provider, inject, observer } from 'mobx-react';
import { observable, reaction } from 'mobx';
import state from 'state'

import api from 'api'

import Map from './LMap'
import L from 'leaflet'

import MapControl from './MapControl'
import Search from './Search'

import Navigation from 'panel/Navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane, faHeart, faCommentDots,
        faPencilAlt, faCrosshairs,
        faGlobeAmericas , faSearchLocation,
        faMapMarker  } from '@fortawesome/free-solid-svg-icons'

import panelConstant from 'constant/panel'
import authConstant from 'constant/auth'
import mapConstant from 'constant/map'


import Nearby from 'panel/Nearby';
import About from 'panel/About'
import Like from 'panel/Like'

import { Icon as IconStyle,
         Panel as PanelStyle} from 'styled';



const Wrapper = styled.div`
    `

const Board = styled.div`
    position: relative;
    display: inline-block;
    padding: 0 20px;
    width: 400px;
    `

const FlexBoard = styled.div`
    width: fit-content;
    `

const Mapcontroller = styled(MapControl)`
    display: inline-block;
    position: absolute;
    z-index: 1;
    top: calc(100% - 240px);
    `


const SearchBar = styled(Search)`
    position: relative;
    margin: 30px 0px;
    width: 100%;
    ${PanelStyle}
    `

const NavigationPanel = posed(styled(Navigation)`
     justify-content: space-around;
     height: 130px;
     width: 330px;
     /* BUG:
        with react pose, if you set margin-top
        it will animate it with an extra style
        position: abs
        top: some unexpected value 
        ...
        
        However use top property makes the Board height wrong
        -> MapControl couldnt properly laylout
        -> Set margin on SearchBar
      */
     background-color: white;
     ${PanelStyle}
    `)
    ({
        enter: { 
            opacity: 1,
        },
        exit: { 
            opacity: 0 ,
        }
    })



const slideInPose = {
    enter: { 
        x: 0,
        transition:{
            ease: 'easeInOut',
        }
    },
    exit: { 
        x: 'calc(-100% - 100px)',
        transition:{
            ease: 'easeInOut',
        }
    },
}

const NearbyPanel = posed(styled(Nearby)`
    ${PanelStyle}
    display: inline-block;
    width: 400px;
    `)
    ({...slideInPose})


const AboutPanel = posed(styled(About)`
    ${PanelStyle}
    width: 360px;

    `)
    ({...slideInPose})



const LikePanel = posed(styled(Like)`
    ${PanelStyle}
    width: 400px;

    `)
    ({...slideInPose})

const RouteContainer = posed.div({
    });



const FaIcon = styled(FontAwesomeIcon)`
    margin: auto;
    `






@withRouter
@inject('nearbyState','panelState','profileState','mapState','searchState')
@observer
class App extends Component {

    @observable draw = false

    constructor(props) {
        super(props);
        this.nearby = this.props.nearbyState
        this.panel = this.props.panelState
        this.map = this.props.mapState
        this.profile = this.props.profileState
        this.search = this.props.searchState

        
        this.navigationWidget = [
            {  Icon: <FaIcon icon={faPaperPlane}/>,
               description: "Nearby",
               color:'cornflowerblue',
               id: panelConstant.NEARBY,
               iconClicked : ()=> {
                   this.props.history.push('nearby')
                   this.panel.set(panelConstant.NEARBY)
               }
            },
            // {  Icon: <FaIcon icon={faHeart}/>,
            //     description: "Like",
            //     color: 'palevioletred',
            //     id: panelConstant.LIKE,
            //     iconClicked : ()=> {
            //         this.props.history.push('like')
            //         this.panel.set(panelConstant.LIKE)
            //     }
            // }
            ,
            {  Icon: <FaIcon icon={faCommentDots}/>,
                description: "About",
                color: 'lightslategray',
                iconClicked : ()=> {
                    this.props.history.push('about')
                    this.panel.set(panelConstant.ABOUT)
                }
            }
        ]
        

    }

    render() {
        return (
            <Wrapper>
                <Board>
                    <FlexBoard>
                        <SearchBar 
                            setInputRef ={dom=> this.inputDom = dom}
                            inputKeyDown={this.inputKeyDown}
                            loading={this.search.loading}/>            
                        <PoseGroup>
                            {/* Without passing RoutesContainer a key, PoseGroup doesn’t know that it has a new child */}
                            <RouteContainer key={this.props.location.pathname}> 
                                {/* use Switch to render the first match Route*/ }
                                <Switch location={this.props.location}>
                                <Route exact path='/' render={props=> 
                                    <NavigationPanel {...props} 
                                        widgets={this.navigationWidget}/>}/>
                                <Route path='/nearby' render={props=> 
                                    <NearbyPanel {...props} />}/>
                                <Route path='/like' render={props=>
                                    <LikePanel {...props}/>
                                    }/>
                                <Route paht='/about' render={props=>
                                    <AboutPanel {...props} />}/>
                                </Switch>
                            </RouteContainer>
                        </PoseGroup>
                    </FlexBoard>
                </Board>

                {this.setMapControl(this.panel.id)}
                <Map/>
            </Wrapper>
        );
    }

    componentDidMount(){
        this.mockpositionReaction()
        this.panelIdReaction()
    }


    mockpositionReaction= () =>{
        reaction(()=>this.map.mockposition,
            position=>{this.nearby.renew(position)}   
        )
    }


    panelIdReaction = ()=>{
        reaction(()=> this.panel.id,
        id=>{
            switch(id){
                case panelConstant.NAVIGATION:
                    this.draw = false
                    this.map.unregistClickMock()
                    this.props.history.push('/')
                    break
                case panelConstant.NEARBY:
                    this.draw? this.map.registClickMock() : null
                    this.props.history.push('/nearby')
                    break
                case panelConstant.PROFILE:
                    this.map.unregistClickMock()
                    break
            }
        })
    }
    

    inputKeyDown = (e)=>{
        // enter key
        if(e.keyCode === 13){
            const username = this.inputDom.value.replace('@','')


            this.search.submitRequest(username)
            .then(({id,position})=>{
                // onSearchSuccess
                this.inputDom.value =''
                this.props.history.push('nearby')
                // show profile panel
                this.panel.set(panelConstant.PROFILE)
                this.profile.ids.push(id)
                this.map.setFootprint(position)
            })
            this.inputDom.blur()
        }
    }

    setMapControl=(id)=>{

        const nearbyMapControl = [
            { Icon: <FaIcon color={this.draw? 'cornflowerblue': ''} icon={faPencilAlt}/>,
              description: "pencil",
              iconClicked: this.penClicked
            },
            { Icon: <FaIcon icon={faCrosshairs}/>,
              description: "position",
              iconClicked: this.myPlaceClicked
            }
        ]
    
        switch(id){
            case panelConstant.NEARBY:
                return <Mapcontroller controls={nearbyMapControl}/>
            case panelConstant.PROFILE:
                return null
            case panelConstant.Navigation:
                return null
            default:
                return null
        }
    }
    myPlaceClicked=()=>{
        api.getBrowserUserPosition()
        .then(position=>{
            this.map.setMyPosition(position, mapConstant.StreetZoomSize)
        })
        .catch(error=>{
            this.map.setMyPosition( mapConstant.DEFAULT_CENTER_POSITION, mapConstant.IslandZoomSize)
        });
    
    }

    penClicked = ()=>{
        this.draw = !this.draw
        this.draw ? this.map.registClickMock() : this.map.unregistClickMock()
    }




}


const Main = () => (
    <Provider {...state}>
        <Router>
            <App/>
        </Router>
    </Provider>
)

export default Main