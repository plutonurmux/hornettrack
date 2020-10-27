import React, { Component } from 'react';
import styled from 'styled-components'


const Display = styled.div`
    height: 23px;
    `


const Head = styled.div`
    height: 80px;
    width: 80px;
    background-color: whitesmoke;
    border-radius: 50%;
    `


const DefaultMember = ()=>{
    return(
        <div>
            <Head/>
            <Display/>
        </div>
    ) 
        
}

export default DefaultMember;