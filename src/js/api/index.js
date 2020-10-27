import axios from 'axios'



const Api ={

    getBrowserUserPosition: ()=>{
        return new Promise((resolve,reject)=>{
            navigator.geolocation.getCurrentPosition(resolve, reject)
        })
        .then( resp=> {
            return {lat: resp.coords.latitude, lng: resp.coords.longitude}
        } )
    },


    
    /* 
    Passing Parameters
        { token: [String]
         location: {
             lat: [float]
             lng: [float]
         }
         page: [int]
         perpage: [int]
        }
    

    Return a Member Array:
        [{Member},{Member}....]

    Member Object: 
        {  member:{
                account: {username: [String], public: [Bollean]}
                age: null
                broadcast_profile: false
                display_name: null
                distance: 0.08
                explorer: false
                fan: false
                favourite: false
                id: 57268186
                last_online: "2019-04-20T16:06:43Z"
                mitch_rank_index: null
                online: true
                profile_photo_large_url: null
                profile_photo_url: null
                status_icon: "online"
                system_profile: false
                thumbnail_large_url: null
                thumbnail_url: null
                unread_messages_from: 0
            }
        }

    */
   getNearbyMember: ({token,position,page,perpage=25})=>{
       return axios({
            method:'get',
            url:`https://gethornet.com/api/v3/members/near.json?page=${page}&per_page=${perpage}`,
            headers: {
              'Authorization':`Hornet ${token}`,
              'X-Device-Location':`${position.lat},${position.lng}`
            }
        }).then(resp=>{
            return resp.data.members.map(e=> e.member)
        })
    },


    // member: {id: 41126991, display_name: "Old Benson", headline: null, about_you: " #交朋友", age: 47, height: 174,…}
    // about_you: " #交朋友"
    // account: {username: "nc31h", public: true}
    // age: 47
    // broadcast_profile: false
    // city: null
    // community_badges: []
    // crowned: false
    // display_name: "Old Benson"
    // distance: 0.31
    // ethnicity: null
    // explorer: false
    // fan: false
    // favourite: false
    // followers: [{member: {id: 56158594, display_name: "MK",…}}, {member: {id: 31126342, display_name: "visal phn",…}},…]
    // followers_count: 32
    // gallery: {count: 0,…}
    // headline: null
    // height: 174
    // id: 41126991
    // identity: {id: 4, title: "不分偏一"}
    // interests: {hashtags: []}
    // know_your_status: {last_tested: "2017-01-31", hiv_status: {id: 2, title: "陰性"}}
    // last_online: "2019-06-04T04:22:59Z"
    // looking_fors: [{id: 3, title: "朋友"}, {id: 2, title: "約會"}, {id: 1, title: "聊天"}]
    // msgs: 0
    // my_private_photos_access: "none"
    // note: null
    // online: false
    // photos: [{photo: {id: 138404803, state: "approved", slot: 0, is_public: true, is_primary: true,…}},…]
    // preferred_language: "zh"
    // private: 1
    // private_photo_access: "none"
    // private_photos_accessible: false
    // public: 3
    // recent_hearts_sent: 0
    // relationship: {id: 4, title: "穩定交往中"}
    // show_distance: true
    // show_onboarding: false
    // status_icon: "offline"
    // system_profile: false
    // unit_of_measure: {id: 2, title: "公制"}
    // unread_messages_from: 0
    // visible: true
    // weight: 82000

    getMemberProfile: ({token,id,position})=>{
        return axios({
            method: 'get',
            url:`https://volta.gethornet.com/api/v3/members/${id}.json`,
            headers: {
                'Authorization':`Hornet ${token}`,
                'X-Device-Location':`${position.lat},${position.lng}`  
            }
        }).then(resp=>{
            return resp.data.member
        })
    },

    // Required
    // CSRF_TOKEN: number
    // Name : Object {name}

    // Response
    // Accurate : Object {identity,lat,lng}
    accurateRequest: ({username,CSRF_TOKEN}) =>{
        return axios({
            method: 'post',
            url: `/accurate/`,
            headers: {'X-CSRFToken': CSRF_TOKEN},
            timeout: 60000,
            data: {name:username}
        }).then( resp=>{
            const id = resp.data.identify
            const position = {lat:resp.data.lat, lng:resp.data.lng}
            return  {id, position}
        })
    },

    test_success_accurateRequest: ({username,CSRF_TOKEN}) =>{
        return new Promise((resolve,reject)=>{
            setTimeout(()=>{
                const id = 38895709
                const position = {lat: 25.047779, lng:  121.517133 }
                resolve({id,position})
            },1000)
        })
    },

    // Required
    // CSRF_TOKEN: number
    // id: number

    // Response
    // Footprint : Object {latitude,logitude,created_at}
    footprintRequest: ({id,CSRF_TOKEN})=>{
        return axios({
            method: 'post',
            url: '/footprint/',
            headers: {'X-CSRFToken': CSRF_TOKEN},
            data: {id}
        }).then(resp=>{
            return resp.data.foot.map( ({latitude,longitude,...rest})=>{
                return {lat:latitude,lng:longitude,...rest}
            })  
        })
    }
 

    
}

export default Api