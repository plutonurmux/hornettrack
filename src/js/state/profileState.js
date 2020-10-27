import {observable, action,toJS} from 'mobx'



class Profile{
    @observable ids = []
    @observable footprints = []
}

export default new Profile()