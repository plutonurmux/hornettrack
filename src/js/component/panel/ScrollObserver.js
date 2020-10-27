import React, { Component } from 'react';



class ScrollObserver extends Component{
    constructor(props) {
        super(props);
    }
    render(){
        return <div id='observer'>{this.props.children}</div>
    }

    componentDidMount(){
        const options = {
            threshold: 1.0
        }
        const callback = (entries)=>{
            entries.map(e=>{
                if(e.isIntersecting){
                   this.props.isIntersecting()
                }
            })
        }
        const io = new IntersectionObserver(callback,options)
        io.observe(document.getElementById('observer'))
    }
}

export default ScrollObserver