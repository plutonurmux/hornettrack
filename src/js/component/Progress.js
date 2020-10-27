import React, { Component } from 'react';
import styled from 'styled-components'



const Wrapper = styled.div`
    position: fixed;
    top: 0px;
    height: 3px;
    width: 100%;
    z-index: 2;
    background-color: transparent;
    `

class Progress extends Component {
    render() {
        return (
            <Wrapper/>
        );
    }
}

export default Progress;