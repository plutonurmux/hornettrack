import React, { Component } from 'react';
import styled from 'styled-components'
import ToggledPanel from 'component/ToggledPanel'

import panelConstant from 'constant/panel'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { inject, observer} from 'mobx-react';



const Wrapper = styled.div`
    `

const Container = styled.div`
    padding: 20 25;
    text-align: justify;
`


const IconGroup = styled.div`
    margin-left: auto;
    width: fit-content;
    ` 

const Github = styled.a`
    font-size: 30px;
    text-decoration: none;
    color: black;
    `



@inject('panelState')
@observer 
class About extends Component {
    constructor(props) {
        super(props);
        this.panel = this.props.panelState
    }
    
    render() {
        return (
            <Wrapper ref={this.props.myref} {...this.props}>
                <ToggledPanel ToggleClick={this.toggleOff}>
                    <Container >
                        <div style={{marginBottom:'20px'}}>
                        HornetTrack is an experimental project for auto stalk user on gay dating app Hornet.
                        </div>
                        <div>
                        If you are interested in or having any problem of this project, check out more detail on Github.
                        </div>
                        

                        <IconGroup>
                            <Github href='https://github.com/timtorChen/hornettrack' target="_blank">
                                <FontAwesomeIcon icon={faGithub}/>
                            </Github>
                        </IconGroup>
                        
                    </Container>
                </ToggledPanel>
            </Wrapper>
        );
    }

    componentDidMount=()=>{
        this.panel.set(panelConstant.ABOUT)
    }

    toggleOff = ()=>{
        this.panel.init()
    }
}

export default React.forwardRef((props,ref)=> <About myref={ref} {...props}/>) 