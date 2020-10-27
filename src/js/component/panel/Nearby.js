import React, { Component } from 'react';
import ReactDOM from 'react-dom'

import styled from 'styled-components'
import posed, { PoseGroup } from 'react-pose'

import {observer, inject} from 'mobx-react'
import { observable, reaction, toJS } from 'mobx';
import { withRouter, Route} from 'react-router-dom'


import ToggledPanel from 'component/ToggledPanel'

import { Masonry, 
        CellMeasurer,
        CellMeasurerCache,
        createMasonryCellPositioner} from 'react-virtualized'


import Member from './Member';
import DefaultMember from './DefaultMember'

import ScrollObserver from './ScrollObserver'
import Profile from 'component/Profile';
import {Panel as PanelStyle} from 'styled'

import panelConstant from 'constant/panel'




const memberHeight =120
const memberWidth = 80
const masonryHeight = 520
const masonryWidth = 400


const Wrapper = styled.div`
    `



const ProfileRoot = styled.div`
    position: absolute;
    top: 0px;
    z-index: 1;
    /* height: ${masonryHeight};
    width: ${masonryWidth}; */
    `

const PoseContainer = posed.div({
    
})



const MemberProfile = posed(styled(Profile)`
    position: absolute;
    top: 0px;
    ${PanelStyle}
    box-shadow: none;
    width: ${masonryWidth};
    height: ${masonryHeight};
    
    `)
    ({
        enter: { 
            y: 0,
            transition:{
                duration: 150,
                ease: 'easeInOut'
            }

        },
        exit: { 
            y: 'calc(100% + 200px)',
            transition:{
                duration: 150,
                ease: 'easeInOut'
            }
        },
    })


@withRouter
@inject('nearbyState','panelState','profileState','mapState','searchState')
@observer
class Nearby extends Component {

    constructor(props) {
        super(props);

        this.nearby = this.props.nearbyState
        this.panel = this.props.panelState
        this.profile = this.props.profileState
        this.map = this.props.mapState
        this.search = this.props.searchState

        this.masonryDom
        this.trackIconDom

        this.cache = new CellMeasurerCache({
            defaultHeight: memberHeight,
            defaultWidth: memberWidth,
            fixedWidth: true
          })

        this.cellPostionConfig = {
            cellMeasurerCache: this.cache,
            columnCount: 4,
            columnWidth: memberWidth,
            spacer: 15
        }
        
        this.cellPositioner = createMasonryCellPositioner(this.cellPostionConfig)
    }

    render() {
        return (
          <Wrapper ref={this.props.myref}  {...this.props}>
            <ToggledPanel ToggleClick={this.toggleOff}>
                
                <Masonry 
                ref={dom=>this.masonryDom=dom}
                style={{outline:'none'}}
                overscanByPixels = {150}
                cellCount={ !this.nearby.loading ? this.nearby.members.length: this.nearby.members.length+20}
                cellMeasurerCache={this.cache}
                cellPositioner={this.cellPositioner}
                cellRenderer={this.cellRenderer}
                height={masonryHeight}
                width={masonryWidth} />
                

                <ProfileRoot id='profile-root'>
                    <PoseGroup >
                    {this.profile.ids.map((id,index)=>
                        <MemberProfile withParent={false} key={index}
                        id={id} 
                        position={this.nearby.position} 
                        toggleDownClick={this.profileToggleDown}
                        profileDidRendered={this.profileDidRendered}
                        profileRequestDone={this.profileRequestDone}
                        istracking={this.search.loading}
                        trackClicked={this.trackClicked}/>
                        )}
                    </PoseGroup>
                </ProfileRoot>

            </ToggledPanel>
    
          </Wrapper>

        );
    }

    componentDidMount(){
        this.panel.set(panelConstant.NEARBY)
        this.reactionDisposer = this.mockPositionReaction()
    }

    componentWillUnmount(){
        this.profile.ids = []
        this.reactionDisposer()
    }

    
    mockPositionReaction =()=>{
        return reaction(()=>this.map.mockposition,
            position=>{
                this.cache.clearAll();
                this.cellPositioner.reset(this.cellPostionConfig);
                this.masonryDom.clearCellPositions();
            }
        )
    }

    toggleOff = ()=>{
        this.panel.init()
    }

    cellRenderer = ({ index, key, parent, style })=>{
        return (
            <CellMeasurer
            cache={this.cache}
            index={index}
            key={key}
            parent={parent} >
                <div style={style} >
                { this.setMember(key)}
                </div>
            </CellMeasurer>    
        )
    }

    setMember = (key)=>{
        const size = this.nearby.members.length

        if(size > key){
            const member = this.nearby.members[key]

            // set observerIntersction to the 10th last member
            if( key === size-10){
                return <ScrollObserver isIntersecting={this.isIntersecting}>
                            <Member {...member} 
                            headClick={this.headClick.bind(this,member.id)}/>
                       </ScrollObserver>
            }else{
                return <Member {...member} 
                        headClick={this.headClick.bind(this,member.id)}/>
            }
        }
        else {
            return <DefaultMember/>
        }
    }

    isIntersecting = ()=>{
        console.log('Intersection triggered')
        if(!this.nearby.loading) this.nearby.nextPage() 
    }

    trackClicked = (username) =>{
        this.search.submitRequest(username)
        .then(({id,position})=>{
            this.map.setFootprint(position)
        })
    }

    profileToggleDown = ()=>{
        this.profile.ids.pop()
        this.map.clearFootprint()
        this.profile.ids.length ? null: this.panel.set(panelConstant.NEARBY)
    }

    profileDidRendered = ()=>{
        this.panel.set(panelConstant.PROFILE)
    }

    profileRequestDone = (id)=>{
        this.map.clearFootprint()
        this.map.setFootprintbyRequest(id)
    }

    headClick =(id)=>{
        this.profile.ids.push(id)
    }
}




export default React.forwardRef((props,ref)=> <Nearby myref={ref} {...props}/>) 