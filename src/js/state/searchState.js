import { observable ,action } from 'mobx';
import api from 'api'
import authConstant  from 'constant/auth'



class Search{
    @observable loading = false


    @action submitRequest =(username)=>{

        this.loading = true
        return api.accurateRequest({
            username: username,
            CSRF_TOKEN: authConstant.CSRF_TOKEN
        }).then( accurate=>{
           return accurate
        }).finally(()=>{
            this.loading = false
        })

    }
}


export default new Search()