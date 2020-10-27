import React, { Component } from 'react';

class Like extends Component {

    constructor(props) {
        super(props);
    }
    

    render() {
        return (
            <div ref={this.props.myref} {...this.props}>
                
            </div>
        );
    }
}

export default React.forwardRef((props,ref)=> <Like myref={ref} {...props}/>) 