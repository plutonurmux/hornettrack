import React, { Component } from 'react';
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretLeft } from '@fortawesome/free-solid-svg-icons'


const Panel = styled.div``

const Content = styled.div`
    display: inline-block;
    `

const Toggle = styled.div`
    position: absolute;
    top: 15px;
    height: 65px;
    width: fit-content;
    font-size: 28px;
    display: inline-flex;
    border-radius: 0px 4px 4px 0px;
    align-items: center;
    padding-left: 6px;
    padding-right: 10px;
    color: dimgray;
    background-color: white;
    cursor: pointer;
    `

class ToggledPanel extends Component {
    
    constructor(props) {
        super(props);
    }
    
    render() {
        return (
            <Panel {...this.props}>
                <Content style={this.props.contentStyle}>
                    {this.props.children}
                </Content>
                <Toggle style={this.props.toggleStyle} onClick={this.props.ToggleClick}>
                    <FontAwesomeIcon icon={faCaretLeft}/>
                </Toggle>
            </Panel>
        );
    }
}

export default ToggledPanel;