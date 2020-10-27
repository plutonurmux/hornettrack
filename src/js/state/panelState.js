import { observable, action } from "mobx";
import panelConstant from "constant/panel"


class Panel {
    @observable id = panelConstant.NAVIGATION

    @action set = (id)=>{
        this.id = id
    }

    @action init = ()=>{
        this.id = panelConstant.NAVIGATION
    }

}


export default new Panel()