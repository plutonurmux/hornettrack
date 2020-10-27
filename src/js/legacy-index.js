import React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
import Cookies from 'js-cookie'
import {
  Route,
  BrowserRouter as Router,
  Link,
  BrowserRouter,
  withRouter
} from 'react-router-dom'
import Swiper from 'react-id-swiper'
import Draggable, {DraggableCore} from 'react-draggable'
import Tappable from 'react-tappable'
import {observable,toJS} from 'mobx'
import {observer} from 'mobx-react'
import moment from 'moment-timezone'
import MediaQuery from 'react-responsive'


const CSRF_TOKEN = Cookies.get('csrftoken')
const TOKEN = Cookies.get('token')
const DialogDom = document.getElementById('dialog-root')
const MapDom = document.getElementById('map-root')
const defaultIMG = '/static/image/blank_profile.png'
const TPErail = [25.047779, 121.517133]
const navigationHieght = 50

var map
var flagGroup
var positionGroup
var trackGroup

const  blueMarker ={
  icon: L.ExtraMarkers.icon({
      icon: 'fa-circle',
      prefix: 'fas',
      markerColor: 'cyan'
  })
}
const redMarker =  {
  icon: L.ExtraMarkers.icon({
      icon: 'fa-star',
      prefix: 'fas',
      markerColor: 'orange'
  }),
  zIndexOffset:1000
};

const  blueFlag ={
  icon: L.ExtraMarkers.icon({
      icon: 'fa-flag',
      prefix: 'fas',
      markerColor: 'cyan'
  })
}

const appState = observable({
  mock: TPErail,  //🤔
  basicArray:[], //🤗
  trackId:[],  //😆
  page:1,  //🤨
  scroll:false,
  showError:false,
  errorMsg:'' 
})

appState.updatePosition = function(successCall,errorCall){
  
  const self = this

  if (navigator.geolocation){
    navigator.geolocation.getCurrentPosition(setPosition,reqAuthentication)
  }else{
    console.log("Geolocation is not supported by this browser.")
  }

  function setPosition(place){
    const position = [place.coords.latitude,place.coords.longitude]
    self.mock = position
    console.log(position)
    if(successCall) successCall(position)
  }
  
  function reqAuthentication(error){
    console.log(error.code);
    if(errorCall) errorCall(error)
  }
}

appState.setPositionMarker = function(position,zoomSize){
  map.setView(position,zoomSize)
  positionGroup.clearLayers()
  L.circleMarker(position,{fillOpacity:0.5}).addTo(positionGroup)
  positionGroup.addTo(map)
}

appState.setTrackMarker = function(position,zoomSize){
  map.setView(position,zoomSize)
  trackGroup.clearLayers()
  L.marker(position,redMarker).addTo(trackGroup)
  trackGroup.addTo(map)
}

appState.getTrackId = function(){
  axios({
    method:'get',
    url: '/history/',
    headers: {'X-CSRFToken': CSRF_TOKEN}
  })
  .then(response=> {
    this.trackId = response.data.victims.map( element=> element.identify).reverse()
  })
}

appState.updatePage = function(){
    axios({
      method:'get',
      url:`https://gethornet.com/api/v3/members/near.json?page=${this.page}&per_page=50`,
      headers: {
        'Authorization':`Hornet ${TOKEN}`,
        'X-Device-Location':`${this.mock[0]},${this.mock[1]}`
      },
      onDownloadProgress: progressEvent=>{}
    }) 
    .then(response =>{
      this.scroll = false
      // toJS make a copy of it and having no observation
      // change back to js structure
      let colneBasic = toJS(this.basicArray)
      const ids = colneBasic.map(element=>element.id)

      response.data.members.map( element=>{
        const basic = element.member
        const id = basic.id
        if(!ids.includes(id)) colneBasic.push(basic)
      })
      
      // slice the first id - yourself...
      if(this.page===1) colneBasic = colneBasic.slice(1);
      
      // finally setstate
      this.basicArray = colneBasic
      this.page = this.page+1

      // ballbacks 
      // const e = this.drag;  
      // if ((e.scrollHeight-e.clientHeight)<=0) this.updatePage()
    });
}

appState.reFreshPage = function(){
  this.basicArray=[]
  this.page =1
  this.updatePage()
}

appState.mockTo = function(location){
  this.mock = location
  flagGroup.clearLayers()
  L.marker(location,blueFlag).addTo(flagGroup)
  flagGroup.addTo(map)
  // you cannot use this here, causing callback params is replaced
  this.reFreshPage()
}

appState.onMapClick = function(ev){
  const location = [ev.latlng.lat,ev.latlng.lng]
  appState.mockTo(location)
}

appState.accurateRequest = function(name,successCall,errorCall){
  axios({
    method:'get',
    url:'https://volta.gethornet.com/api/v3/members/'+name+'/public.json',
    headers:{'Authorization':`Hornet ${TOKEN}`},
  })
  .then(response=>{
    const id = response.data.member.id

    if(response.data.member.distance){
      axios({
        method:'post',
        url:'/accurate/',
        headers: {'X-CSRFToken': CSRF_TOKEN},
        timeout:60000,
        data:{name:name}
      })
      .then(response=>{
        const data = response.data 
        const location = [data.lat,data.lng]
        const cloneId = toJS(appState.trackId)

        if(cloneId.includes(id)){
          const index = cloneId.indexOf(id)
          cloneId.splice(index,1)
        }
        appState.trackId= [id,...cloneId]
        appState.setTrackMarker(location,18)

        if(successCall) successCall()
        ga('send',{
          hitType:'event',
          eventCategory:'track',
          eventAction:'success',
          eventLabel: name });  
      })
      .catch(error=>{
        this.errorMsg = 'Ohh! Magic fails, please try again.'
        this.showError=true
        setTimeout(()=>{this.showError=false},3000)
        if(errorCall) errorCall()

        error.response ? 
        this.sendErrorToGA(name,error.response.status) :
        this.sendErrorToGA(name,error.code)
      })
      
    }else{
      this.errorMsg = 'This id do not show distance'
      this.showError = true
      setTimeout(()=>{this.showError=false},3000)
      if(errorCall) errorCall()

      const status = 'not show distance'
      this.sendErrorToGA(name,status)
    }
  })
  .catch(error=>{
    this.errorMsg = 'This id do not exist or not public'
    this.showError= true
    setTimeout(()=>{this.showError=false},3000)
    if(errorCall) errorCall()

    const status = 'not found'
    this.sendErrorToGA(name,status)
  })
}

// under DEV! 
// expect me in next verson~
// geocoding api need to bundle on static IP, which means I have no time dealing with "QuotaGuard Static"!?
appState.roughRequest = function(name){
  axios({
    method:'post',
    url:'/rough/',
    headers: {'X-CSRFToken': CSRF_TOKEN},
    data:{name:name}
  })
  .then(response=>{
    const data = response.data

    axios({
      method:'get',
      url:`https://maps.googleapis.com/maps/api/geocode/json?latlng=${data.lat},${data.lng}&key=AIzaSyBtak-BMvNWuWY6P1qUt2zj2U7oTH2SeaU`
    })
    .then(response=>{
      console.log(response)
    })
    .catch(error=>{

    })

  })
  .catch(error=>{

  })

}

appState.sendErrorToGA = function(name,status){ 
  ga('send',{
    hitType:'event',
    eventCategory:'track',
    eventAction:'error',
    eventLabel: status+' '+name
  });
}

appState.footprintRequest= function(id,successCall,errorCall){
  axios({
    method:'post',
    url:'/footprint/',
    headers: {'X-CSRFToken': CSRF_TOKEN},
    data:{id:id}
  })
  .then(response=>{
    const foot = response.data.foot
    const latest = foot.slice(-1)[0]
    map.setView([latest.latitude,latest.longitude],14)

    trackGroup.clearLayers()
    foot.map((footprint,index,array)=>{
      const location = [footprint.latitude,footprint.longitude]

      if(index==array.length-1)
        L.marker(location,redMarker).addTo(trackGroup)
      else 
        L.marker(location,blueMarker).addTo(trackGroup)
    })
    trackGroup.addTo(map)
    if(successCall) successCall()
    
  })
  .catch(error=>{
    if(errorCall) errorCall()
  })

}

// {id: , islover: }
@withRouter
@observer
class Dialog extends React.Component{

  @observable detail=null
  @observable sync=false

  constructor(props){
    super(props)
    this.onGlobeClick = this.onGlobeClick.bind(this)
    this.onStarClick = this.onStarClick.bind(this)
    this.onSyncClick = this.onSyncClick.bind(this)
  }

  componentDidMount(){
    axios({
      method:'get',
      url:'https://volta.gethornet.com/api/v3/members/'+this.props.id+'.json',
      headers: {'Authorization':`Hornet ${TOKEN}`},
      onDownloadProgress: progressEvent=>{}
    }) 
    .then(response =>{
      this.detail=response.data.member
    })
  }

  render(){
    const params = {
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
        dynamicBullets: true
      },
      resistanceRatio:0
    };
    const detail = this.detail

    let lastonline=null
    if(detail){
      const now = moment(Date.now())
      const then = moment(detail.last_online)
      const duration = moment.duration(now.diff(then))
      const day = duration.days()
      const hour = duration.hours()
      const minute = duration.minutes()
      
      if(day){
        lastonline = day+' day'
      }else if(hour){
        lastonline = hour+' hour'
      }else if(minute){
        lastonline = minute+' minute'
      }
    }

    const flexcenter = {
      display:'flex',
      alignItems:'center'
    }

    const blueLocation ={
      fontSize: '13px',
      paddingRight: '5px',
      color: 'cornflowerblue'
    }

    const greenOnline ={
      fontSize: '12px',
      paddingRight: '5px',
      color: 'springgreen'
    }
    const grayOffline={
      fontSize: '12px',
      paddingRight: '5px',
      color: 'lightgray'
    }

    const orangeFans = {
      fontSize: '12px',
      paddingRight: '5px',
      color: 'orange'
    }

    return(
      <div>
      <div className='dialog'>
        {detail &&  //if axios have loaded
          <div className='dialog-wrapper'>
            
            <div className='dialog-content'>
              <div className='dialog-topbar'>
                <img className='topbar-sticky' src={detail.photos.length ? detail.photos[0].photo.thumbnail_url : defaultIMG}/>
                <div className='topbar-account'>
                  { detail.display_name ? <div className='displayname'>{detail.display_name}</div> : null }
                  <div className='username'>{`@${detail.account.username}`}</div>
                  <div className='identity'>
                    <span className='fitness'>{detail.height ? detail.height : '.'}</span>
                    <span className='fitness'>{detail.weight ? parseInt(detail.weight/1000) : '.'}</span>
                    <span className='fitness'>{detail.age ? detail.age : '.'}</span>
                    {detail.identity ? <span className='fitness'>{detail.identity.title}</span> : null}
                  </div>
                </div>
                <div className='topbar-widget-wrapper'>
                  { this.props.islover ? 
                    <div className='fas fa-globe topbar-widget' onClick={()=>{this.onGlobeClick(detail.id)}}/>  :
                    <div className='fas fa-star topbar-widget' onClick={this.onStarClick}/>
                  }
                  <div className={`fas fa-sync-alt topbar-widget ${this.sync ? 'icon-rotate' : '' }`}
                       onClick={()=>{this.onSyncClick(detail.account.username)}}/>
                </div>
              </div>

              <div className='private-info'>
                <div style={flexcenter}>
                  <i className='fas fa-circle' style={detail.online ? greenOnline : grayOffline }/>
                  <span>{detail.online ? `online` : `${lastonline} ago`}</span>
                </div>

                { detail.distance ?
                  <div style={flexcenter}>
                    <i className="fas fa-location-arrow" style={blueLocation}/>
                    <span>{`${detail.distance} km`}</span>
                  </div>
                  : null
                }

                <div style={flexcenter}>
                  <i className="fas fa-user" style={orangeFans}/>
                  <span onClick={()=>{this.props.history.push(`${this.props.match.url}/f`)}}>
                    {detail.followers_count}
                  </span>
                </div>
              </div>
              
              {detail.about_you ? <div className='about-you'>{detail.about_you}</div>: null}
            </div>
            
            <div className="gallery">
              <Swiper {...params}>
              {detail.photos.length ? 
                detail.photos.map( (element,index)=>
                  <div key={index}>
                    <img className='gallery-img' src={element.photo.full_large_url}/>
                  </div> ) :
                <div>
                  <img className='gallery-img' src={defaultIMG}/>
                </div>
              }
              </Swiper>
            </div>
            
            <Route path={`${this.props.match.url}/f`} render={()=> 
                ReactDOM.createPortal(<FansDialog id={this.props.id} fansnum={detail.followers_count}/>,DialogDom)}/>
          </div>
        }
      </div>
      </div>
    )
  }

  onGlobeClick(id){
    appState.footprintRequest(id)
  }

  onStarClick(){
  }
  
  onSyncClick(name){
    if(!this.sync){
      this.sync=true
     

      const success=()=>{
        this.sync=false
      }
      
      const error=()=>{
        this.sync=false
      }
      
      appState.accurateRequest(name,success.bind(this),error.bind(this))
    }
  }


}

// {id: , fansnum: }
@withRouter
@observer
class FansDialog extends React.Component{

  @observable fans=[]

  constructor(props){
    super(props)

    this.page=1
    this.per_page=25
    this.scroll=false

    this.handleScroll = this.handleScroll.bind(this)
  }
 
  render(){
    return(
      <div className='dialog' ref={(dom)=>{this.scrollDom = dom}} onScroll={()=>{this.handleScroll()}}>
        <div className='group'>
          {this.fans.map( element=>{
            return <Member key={element.id} basic={element}/>
          })}
        </div>
      </div>
    )
  }

  componentDidMount(){
    this.updatePage()
  }

  updatePage(){
    axios({
      method:'get',
      url: `https://gethornet.com/api/v3/members/${this.props.id}/followers?page=${this.page}&per_page=${this.per_page}`,
      headers: {'Authorization':`Hornet ${TOKEN}`},
      onDownloadProgress: progressEvent=>{}
    })
    .then(response=>{
      // toJS make a copy of it and having no observation
      // cahnge back to js structure
      let colneBasic = toJS(this.fans)
      const ids = colneBasic.map(element=>element.id)

      response.data.members.map( element=>{
        const basic = element.member
        const id = basic.id
        if(!ids.includes(id)) colneBasic.push(basic)
      })
      
      // finally setstate
      this.fans = colneBasic
      this.page = this.page+1
      this.scroll = false
    })
  }
  
  handleScroll(){
    const e = this.scrollDom
    const reachBottom= (e.scrollHeight-e.clientHeight)-e.scrollTop <= 50
    const loaded = this.per_page*(this.page-1)
    const total = this.props.fansnum 
    // waterfall style
    if(!this.scroll && reachBottom && loaded<total){
      this.scroll = true
      this.updatePage();
    }
  }
}

/*  either { basic:{....}} or { id: }  
*/ 
@withRouter //auto inject {match:,history:,...}
@observer
class Member extends React.Component{

  @observable detail=null
  @observable loaded=false
  @observable press=false
  @observable sync=false

  constructor(props){
    super(props)
    
    this.getMemberInfo = this.getMemberInfo.bind(this)
    this.onSyncClick = this.onSyncClick.bind(this)
    this.onGlobeClick = this.onGlobeClick.bind(this)
  }

  render(){

    let id,name,img,online,display_name,islover

    if(!this.props.basic){
      if(this.detail){
        const detail = this.detail
        id =  detail.id
        name = detail.account.username
        img = detail.photos.length ? detail.photos[0].photo.thumbnail_large_url :null
        online = detail.online
        display_name = detail.display_name
        islover = true
      }
    }else{
      const basic = this.props.basic
      id =  basic.id
      name = basic.account.username
      img = basic.thumbnail_large_url
      online = basic.online
      display_name = basic.display_name
      islover=false
    }

    const routeurl = this.props.match.url!=`/` ? `${this.props.match.url}/${id}` : `/p/${id}`
    const onPressDark = {filter: `${this.press ? 'brightness(40%)' : ''}`}
    const onPressShow = {display: `${this.press ? 'flex' :'none'}`}
    const onSyncHide = {display: `${this.sync ? 'none': ''}`}
    const onSyncLargeFont = {fontSize: `${this.sync? '30px' : ''}` }

    return(
      <div className='member'>
        <Tappable onPress={()=>{this.press=true}} pressDelay={600}
                  onTap={()=>{this.props.history.push(routeurl)}} >
          <img className='sticky' style={onPressDark}
              src={ img && this.loaded ? img : defaultIMG} 
              onLoad={()=> {this.loaded=true}}
              onContextMenu={(e)=>{e.preventDefault()}}/>
        </Tappable>
        <div className="tool-wrapper" style={onPressShow}
             //  prevent long press contextMenu
             onContextMenu={(e)=>{e.preventDefault()}}>
          <i className='tool fas fa-info' style={onSyncHide}
             onClick={()=>{this.props.history.push(routeurl); this.press=false}}/>
          
          { islover ? 
            <i className='tool fas fa-globe' style={onSyncHide} 
               onClick={()=>{this.onGlobeClick(id)}}/> : null}
          
          <i className={`tool fas ${this.sync? 'fa-spinner icon-rotate': 'fa-sync-alt' }`} 
             style={onSyncLargeFont}
             onClick={()=>{this.onSyncClick(name)}}/>
        
        </div>
        <div className={online ? 'online' : 'offline'}></div>
        <div className="display">{display_name}</div>
        <Route path={routeurl} render={()=>ReactDOM.createPortal(<Dialog id={id} islover={islover}/>,DialogDom)}/>
      </div>
    )
  }

  onSyncClick(name){
    if(!this.sync){
      this.sync = true
      console.log(name)

      const success = ()=>{
        this.press=false
        this.sync=false
      }
      const error =()=>{
        this.press=false
        this.sync=false
      }
      appState.accurateRequest(name,success.bind(this),error.bind(this));
    }
  }

  onGlobeClick(id){
    const success = () =>{
      this.press=false
    }
    const error = () =>{
      this.press=false
    }
    appState.footprintRequest(id,success.bind(this),error.bind(this))
  }

  componentDidMount(){
     // if no basic info provided call getMerberInfo 
     if(!this.props.basic) this.getMemberInfo()
  }

  getMemberInfo(){
    axios({
      method:'get',
      url:'https://volta.gethornet.com/api/v3/members/'+this.props.id+'.json',
      headers: {'Authorization':`Hornet ${TOKEN}`},
      onDownloadProgress: progressEvent=>{}
    }) 
    .then(response =>{
      this.detail=response.data.member
    })
    .catch(error =>{
        console.log(error)
        if(error.response.status==404){
          axios({
            method:'post',
            url:'/clear/',
            headers: {'X-CSRFToken': CSRF_TOKEN},
            data:{id:this.props.id}
          })
          .then(response=>{
            const index = appState.trackId.indexOf(this.props.id)
            appState.trackId.splice(index,1)
          })
        }
    })
  }
}

@withRouter
@observer
class Panel extends React.Component{
  
    @observable navigator=0
    
    constructor(props){
      super(props)

      this.onPlaneClick = this.onPlaneClick.bind(this)
      this.onLoveClick = this.onLoveClick.bind(this)
      
      this.handleScroll = this.handleScroll.bind(this)

      this.y_last = 0
      this.onStartHandler = this.onStartHandler.bind(this)
      this.onDragHandler = this.onDragHandler.bind(this)
      this.onStopHandler = this.onStopHandler.bind(this)
    }

    render(){
      const configs={
        onStart:this.onStartHandler,
        onStop: this.onStopHandler,
        onDrag: this.onDragHandler,
      } 

      return(
        <div className='panel'>
          <div id='navigator'>
            <div className='nav-icon-wrapper'>
              <i className={`nav-icon fa-paper-plane ${this.navigator==0 ? 'fas':'far'}`} 
                 onClick={this.onPlaneClick}/>
            </div>
            <div className='nav-icon-wrapper'>
              <i className={`nav-icon fa-heart ${this.navigator==1 ? 'fas':'far'}`}
                 onClick={this.onLoveClick}/>
            </div>
          </div>
          <div className='group-wrapper' ref={(dom)=> {this.drag = dom}} 
            onScroll={()=>{this.navigator==0 ? this.handleScroll() : null}}>
            
            <div className='group' ref={(dom)=>{this.nearby = dom}}>
              {appState.basicArray.map( basic=>
              <Member key={basic.id} basic={basic} />)}
            </div>
            
            <div className='group' ref={(dom)=>{this.love = dom}}>
              {appState.trackId.map( id=>
              <Member key={id} id={id} />)}
            </div>
          </div>
        </div>
      )
    }
    
    componentDidMount(){
      appState.getTrackId();
      this.onPlaneClick()
    }
       
    handleScroll(){
      const e = this.drag;
      const reachBottom= (e.scrollHeight-e.clientHeight)-e.scrollTop <= 50
      // waterfall style
      if(!appState.scroll && reachBottom){
        appState.scroll = true
        appState.updatePage();
      }
    }
  
    onPlaneClick(){
      this.navigator=0
      this.nearby.style.display='grid'
      this.love.style.display='none'
    }

    onLoveClick(){
      this.navigator=1
      this.love.style.display='grid'
      this.nearby.style.display='none'
    }

    onStartHandler(e,data){
    }

    onDragHandler(e,data){
      // const maxdrag = 50
      // const y_last = this.y_last
      // const dy = data.deltaY
      // let y = y_last + dy
      
      // if(y > maxdrag)
      //   y=maxdrag
      // else if(y<0)
      //   y=0

      // this.drag.style.transform = `translate(0px,${y}px)`
      // this.y_last = y
    }

    onStopHandler(e,data){
    }

}

@withRouter
@observer
class Dragger extends React.Component{

  @observable search=false

  constructor(props){
    super(props)

    this.time = Date.now()
    this.velocity = 0
    this.y_last = 0
    this.maxdrag = -(window.innerHeight - navigationHieght) 

    this.draw = false
    this.onStopHandler = this.onStopHandler.bind(this)
    this.onDragHandler = this.onDragHandler.bind(this)
    this.onStartHandler = this.onStartHandler.bind(this)
    this.inertiaDrag = this.inertiaDrag.bind(this)
    this.onResize = this.onResize.bind(this)

    this.onPencilClick = this.onPencilClick.bind(this)
    this.onMyPlaceClick = this.onMyPlaceClick.bind(this)
    
    this.onSubmitId = this.onSubmitId.bind(this)
  }

  render(){
    const configs={
      handle:'#navigator',
      onStart:this.onStartHandler,
      onStop: this.onStopHandler,
      onDrag: this.onDragHandler,
    }
    const onErrorToast = {
      opacity: `${appState.showError ? 1 : 0 }`,
      display: `${appState.showError ? 'block': 'none'}`
    }

    return(
      <div>
        <div id="search">
          <div className='search-overlay' style={{display: this.search ? 'block' : 'none'}}/>
          <label className={`search-icon ${this.search ? 'fa fa-spinner icon-rotate': 'fa fa-search'}`} 
                 htmlFor='search-id'/>
          <form id='sform' onSubmit={(e)=>{this.onSubmitId(e)}}>
            <input id="search-id" type="text" placeholder="Hornet Id" autoComplete="off"
                   ref={(dom)=>{this.input = dom}}/>      
          </form>
        </div>
        <div className='search-status showfade' style={onErrorToast}>{appState.errorMsg}</div>
        <DraggableCore {...configs}>
          <div className='dragger' ref={(dom)=> {this.drag = dom}} >
            <Panel/>
          </div>
        </DraggableCore>
        { ReactDOM.createPortal(<div id='mapid' ref={(dom)=>{this.map = dom}}/>,MapDom)}
        <div className='widget-wrapper' ref={(dom)=>{this.icon = dom}}>
          <i className="fas fa-pencil-alt widget" onClick={this.onPencilClick} 
             ref={(dom)=>{this.pencil = dom}}></i>
          <i className="material-icons widget" onClick={this.onMyPlaceClick}
             ref={(dom)=>{this.mylocation = dom }}>my_location</i>
        </div>
      
      </div>
    )
  }

  onSubmitId(e){
    e.preventDefault()
    const id = this.input.value.replace('@','')
    this.input.blur()
    this.search = true

    const success= ()=>{
      this.search=false
      this.input.value=null
    }

    const error= ()=>{
      this.search=false 
    }

    appState.accurateRequest(id,success.bind(this),error.bind(this))
  }
 
  componentDidMount(){
    map = L.map('mapid',{zoomControl:false,minZoom:3}); 
    flagGroup = L.layerGroup().addTo(map)
    positionGroup = L.layerGroup().addTo(map)
    trackGroup =L.layerGroup().addTo(map)

    L.gridLayer.googleMutant({
			type:'roadmap'  // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
    }).addTo(map)

    this.onMyPlaceClick()
    window.addEventListener('resize',this.onResize)
  }

  onResize(){
    const maxdrag = -(window.innerHeight-navigationHieght)
    const ratio = Math.abs(this.y_last/this.maxdrag)
    const y = ratio*maxdrag

    this.drag.style.top = `${-(maxdrag-y)}px`
    this.map.style.height = `${-(maxdrag-y)}px`
    if( -(maxdrag/2-y) >= 0){
      this.icon.style.bottom = `${navigationHieght -y}px`
      map.invalidateSize()
    }

    this.y_last = y
    this.maxdrag = maxdrag
  }

  onMyPlaceClick(){
    appState.updatePosition(success,error)

    function success(position){
      appState.setPositionMarker(position,18)
      appState.mockTo(position)
    }  
    function error(){
      appState.setPositionMarker(TPErail,7)
      appState.mockTo(TPErail)
    }
  }

  onPencilClick(){
    this.draw = !this.draw

    if(this.draw){
      map.addEventListener('click',appState.onMapClick)
      this.pencil.style.color = 'dodgerblue'
    }else{
      map.removeEventListener('click',appState.onMapClick)
      this.pencil.style.color = 'dimgray'
    }
  }


  onStartHandler(e,data){
    this.time = Date.now()
  }

  onDragHandler(e,data){
    const maxdrag = this.maxdrag
    const y_last = this.y_last
    const lastTime = this.time
    const nowTime = Date.now()
    const dt = (nowTime-lastTime)
    const dy = data.deltaY
    const velocity = dy/dt

    let y = y_last+dy
    if(y < maxdrag)
      y= maxdrag
    else if(y>0)
      y=0

    this.drag.style.top = `${-(maxdrag-y)}px`
    this.drag.style.height = `${navigationHieght-y}px`
    this.map.style.height = `${-(maxdrag-y)}px`
    if(-(maxdrag/2-y) >= 0){
      this.icon.style.bottom = `${navigationHieght -y}px`
      map.invalidateSize()
    }

    this.time = nowTime
    this.velocity = velocity
    this.y_last = y
  }

  onStopHandler(e,data){
    this.inertiaDrag() 
  }

  inertiaDrag(){
    const self = this
    const maxdrag = this.maxdrag
    const direction = Math.sign(this.velocity)
    let velocity = Math.abs(this.velocity)>0.5 ? 0.5*direction : this.velocity

    let y = this.y_last
    const fps =17.6
    const gamma = 0.9
    const tao = -1/Math.log(gamma)*fps  //ms
    updateDrag()


    function updateDrag() {
      velocity = velocity*gamma
      const dy = tao*velocity

      if ( !(y==0 || y==maxdrag) && Math.abs(dy) > 5){
        y = y + dy 
        
        if( y <= maxdrag ){
          y=maxdrag
        } 
        else if( y>=0 ){
          y=0
        }
        requestAnimationFrame(updateDrag)
        self.drag.style.top = `${-(maxdrag-y)}px`
        self.drag.style.height = `${navigationHieght-y}px`
        self.map.style.height = `${-(maxdrag-y)}px`
        if(-(maxdrag/2-y) >= 0){
          self.icon.style.bottom = `${navigationHieght-y}px`
          map.invalidateSize()
        }  
      }
      else{
        self.y_last = y
        self.velocity = 0
      }
    }
  }

}

if (module.hot) {
  module.hot.accept();
}

ReactDOM.render(
  <BrowserRouter>
      <Dragger/>
  </BrowserRouter>
  ,
  document.getElementById('panel-root')
);
