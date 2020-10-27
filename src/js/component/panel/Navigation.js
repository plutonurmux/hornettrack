import React, { Component } from 'react';
import styled from 'styled-components'


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import {Icon} from 'styled'




const Wrapper = styled.div`
    display: flex;
    align-items: center;
    `

const FaIcon = styled(FontAwesomeIcon)`
    margin: auto;
    `

const Widget = styled.div`
    `

const IconWrapper = styled.div`
    color: white;
    background-color: ${props => props.color};
    display: flex;
    align-items: center;
    ${Icon}
    margin: 10px;
    font-size: 22px;
    `

const TextWrapper = styled.div`
    margin: auto;
    width: fit-content;
    user-select: none;
    `


class Navigation extends Component {
    constructor(props) {
        super(props);
        // Required
        // widgets : Widget Object Array
        // Widget : Object {Icon, description, color, id, iconClicked}
    }

    render() {
        return (
            <Wrapper ref={this.props.myref} {...this.props}>
               {this.props.widgets.map( (w,index)=>
                  <Widget key={index}>
                    <IconWrapper 
                        color={w.color} onClick={w.iconClicked}>
                        {w.Icon}
                    </IconWrapper>
                    <TextWrapper>{w.description}</TextWrapper>
                  </Widget>   
               )}
            </Wrapper>
        );
    }
}

export default React.forwardRef((props,ref)=> <Navigation myref={ref} {...props}/>) 