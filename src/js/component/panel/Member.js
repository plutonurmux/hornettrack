import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import { observer, onError } from 'mobx-react';
import { observable } from 'mobx';
import Profile from 'component/Profile';

const Wrapper = styled.div`
    position: relative;
    user-select: none;
    `


const OnlineDot = styled.div`
    ${ ({online}) => online && `
        background-color: springgreen;
        `
    }
    position: absolute;
    border-radius: 50%;
    height: 10px;
    width: 10px;
    `

const HeadWrapper = styled.div`
    `

const Head = styled.img`
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: whitesmoke;
    cursor: pointer;
    `

const Display = styled.div`
    position: relative;
    text-align: center;
    line-height: 23px;
    top: 3px;
    font-size: 15px;
    height: 23px;
    color: dimgray;

      /* overflow control */
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    `



const DefaultImageSrc = '/static/image/blank_profile.png'


class Member extends Component {
    
    constructor(props) {
        super(props);
        // Required props:
        //   Member: Object

        // Optional props: 
        //   function: headClick
    }
    
    render() {
        return (
          <Wrapper {...this.props}>
                <OnlineDot online={this.props.online}/>
                <HeadWrapper>
                    <Head src={this.props.thumbnail_large_url  ? 
                        this.props.thumbnail_large_url : DefaultImageSrc}
                        onClick={this.props.headClick}/>
                </HeadWrapper>
                <Display>{this.props.display_name}</Display>
          </Wrapper>
        );
    }
}

export default Member;




