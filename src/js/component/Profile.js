import React, { Component } from 'react';
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretDown, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons'


import authConstant  from 'constant/auth'
import Swiper from 'react-id-swiper'
import api from 'api';
import { observer, inject } from 'mobx-react';
import { observable } from 'mobx';



const Wrapper = styled.div`
    position: relative;
    z-index: 1;
    height: 800px;
    width: 600px;
    overflow-y: scroll;
    background-color: white;
    `

const Sticky = styled.div`
    top: 0px;
    position: sticky;
    height: 0px;
    z-index:2;
    `

const TopBar= styled.div`
    display: flex;
    align-items: center;
    background-color: rgba(0,0,0,0.3);
    `

const ToggleDown = styled.div`
    height: 40px;
    width: 40px;
    font-size: 28px;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px ;
    margin-left: auto;
    cursor: pointer;
    `

const Username = styled.div`
    color: white;
    margin-left: 20px;
    `

const Gallery = styled.div`
    height: fit-content;
    `


const Photo = styled.img`
    margin-top: -5%;
    margin-bottom: -20%;
    background-color: whitesmoke;
    user-select:none;
    `



const Cover = styled.div`
    position: absolute;
    height: fit-content;
    bottom: 0px;
    width: 100%;
    color: white;
    background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 100%);
    z-index: 2;
    `

const Container =styled.div`
    margin: 10 20 15 20;
    display: flex;
    align-items: center;

    `

const Displayname = styled.div`
    font-size: 30px;
    margin-bottom: 10px;
    `
        
const Identity = styled.div`
    display: flex;
    align-content:center;
    font-size: 18px;
    `

const Fitness = styled.div`
    margin-right: 5px;
    `

const AboutYouu = styled.div`
    white-space: pre-line;
    word-wrap: break-word;
    margin: 20px;
    `

const TrackIcon = styled.div`
    margin-left: auto;
    font-size: 25px;
    height: 50px;
    width: 50px;
    margin-top: 5px;
    border: 1px solid rgba(255,255,255,0.6);
    background: rgba(0,0,0,0.3);
    color: ${ ({lock})=> lock? 'rgba(255,255,255,0.3)':'white'};
    border-radius: 50%;
    box-shadow: 3px 3px 2px rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    `


@observer
class Profile extends Component {

    @observable done = false

    constructor(props) {
        super(props);

    
        // Required
        // id : number
        this.id = this.props.id
        
        // Optional
        // toggleDownClick : function
        // profileDidRendered : function
        // profileRequestDone : function
        // trackClicked : function


        this.galleryDom
        this.coverDom
    }
    
    render() {
        return (
            <Wrapper ref={this.props.myref} {...this.props} 
                    onScroll={this.onProfileScroll}>
                <Sticky>
                    <TopBar>
                    <Username>
                        {this.done? this.setUsername(): null}
                    </Username>
                    <ToggleDown onClick={this.props.toggleDownClick}>
                        <FontAwesomeIcon icon={faCaretDown}/>
                    </ToggleDown>
                    </TopBar>
                </Sticky>

                
                <Gallery ref={dom=> this.galleryDom = dom} >
                    {this.done? this.setGallery(): null}
                </Gallery>
               

                <div>
                    {this.done? this.setInformation():null}
                </div>


                
            </Wrapper>
        );
    }

    setUsername (){
        return `@${this.profile.account.username}`
    }

    setGallery(){
        const params = {
            pagination: {
              el: '.swiper-pagination',
              clickable: true,
              dynamicBullets: true
            },
            resistanceRatio:0
        }

        return(
            <Swiper {...params}>
            {this.profile.photos.map((element,index)=>
                <Photo key={index} src={element.photo.full_large_url}/>
            )}
            </Swiper>
        ) 
    }

    setInformation(){
        const display_name = this.profile.display_name ? this.profile.display_name: 'No name'
        const height = this.profile.height? this.profile.height: '.'
        const weight = this.profile.weight? parseInt(this.profile.weight/1000) : '.'
        const age = this.profile.age? this.profile.age: '.'
        const role = this.profile.identity ? this.profile.identity.title : null
        const about_you = this.profile.about_you ? this.profile.about_you : null
        
        return(
            <div>
            <Cover ref={dom=> this.coverDom = dom}>
                <Container>
                    <div>
                    <Displayname>{display_name}</Displayname>
                    <Identity>
                        <Fitness>{height}</Fitness>
                        <Fitness>{weight}</Fitness>
                        <Fitness>{age}</Fitness>
                        <Fitness>{role}</Fitness>
                    </Identity>
                    </div>
                    
                    { this.profile.account.public ?
                        <TrackIcon 
                            onClick={!this.props.istracking? 
                                this.props.trackClicked.bind(this,this.profile.account.username): null}
                            lock={this.props.istracking} >
                            <FontAwesomeIcon icon={faMapMarkerAlt}/>
                        </TrackIcon>
                        : null
                    }
                      
                </Container>
            </Cover>
            <div >
                {about_you ? <AboutYouu>{about_you}</AboutYouu>: null}
            </div>

            </div>
        )
    }

    

    componentDidMount(){
        this.props.profileDidRendered ?this.props.profileDidRendered(this.id): null

        api.getMemberProfile({ 
            token: authConstant.testtoken,
            id: this.id,
            position: this.props.position
        }).then( profile =>{
            this.profile = profile
            this.done = true
        }).finally(()=>{
            this.props.profileRequestDone ? this.props.profileRequestDone(this.id) : null
        })
    }

    onProfileScroll= (e)=>{
        // prevent scroll to the lower DOM
        e.preventDefault()
        e.stopPropagation()
        const wrapperDom = e.target
        const delta = this.galleryDom.scrollHeight - wrapperDom.clientHeight
        const isGalleyBottom = wrapperDom.scrollTop >= delta
        !isGalleyBottom
            ? this.coverDom.style.transform = `translate(0px,${wrapperDom.scrollTop}px)` 
            : this.coverDom.style.transform = `translate(0px,${delta}px)`
        return true
    }
}

export default React.forwardRef((props,ref)=> <Profile myref={ref} {...props}/>) 