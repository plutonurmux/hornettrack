import {observable, action,toJS} from 'mobx'
import api from 'api'
import authConstant  from 'constant/auth'
import mapConstant from 'constant/map'
import { observer } from 'mobx-react';

class Nearby{

    @observable members = []
    @observable loading = false
    @observable page = 0

    position = mapConstant.DEFAULT_CENTER_POSITION
    

    @action nextPage = ()=>{
        console.log('load next page')
        this.page ++
        this.loading = true

        api.getNearbyMember({
            token: authConstant.testtoken,
            position: this.position,
            page: this.page,
            perpage: (this.page===1 ? 50 : 25)
        }).then( latestMember =>{

            // distinct and add the latest members
            // change Mobx to pure Js Object, in prevent of frequently rerender
            const cloneMembers = toJS(this.members)
            let appendedMembers = []
            
            let uid = cloneMembers.map(m => m.id)
            latestMember.map( m =>{
                if( !uid.includes(m.id)) appendedMembers.push(m) 
            })

            // Finally remove the first one - yourself
            if(this.page ===1 ) appendedMembers.shift()

            
            this.members = [...cloneMembers,...appendedMembers]
            this.loading = false
        })
    }


    @action renew = ( position )=>{
        this.position = position
        this.members = []
        this.page = 0
        this.nextPage()
    }
}

export default new Nearby()