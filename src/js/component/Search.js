import React, { Component } from 'react';
import styled,{keyframes} from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch,faSpinner } from '@fortawesome/free-solid-svg-icons'



const Wrapper = styled.div`
    width: 300px;
    height: 50px;
    `

const Overlay = styled.div` 
    position: absolute;
    height: 100%;
    width: 100%;
    background-color: rgba(0,0,0,0.08);
    z-index: 2;
    border-radius: 4px;
    `


    
const TextInput = styled.input`
    height: 100%;
    width: 100%;
    position: absolute;
    left: 0px;
    font-size: 16px;
    padding-left: 55px;
    border: 0px;
    border-radius: 4px;
    outline: none;
    `

const IconWrapper = styled.div`
    position: absolute;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 20px;
    color: gray;
    height: 100%;
    margin: auto;
    width: 50px;
    display: flex;
    align-items: center;
    `

const SearchIcon =  styled(IconWrapper)`
    `


const spin = keyframes`
    from{
        transform: rotate(-45deg) ;
    }

    to{
        transform: rotate(315deg);
    }
    `

const SpinIcon = styled(IconWrapper)`
    animation: ${spin} 4s ease-in-out infinite;
    `


class Search extends Component {
    constructor(props) {
        super(props);
        // Require

        // Optional
        // loading : bollean
    }
    
    render() {
        return (
            <Wrapper {...this.props}>
                {this.props.loading? <Overlay/> : null}
                
                {this.props.loading
                    ?<SpinIcon>
                        <FontAwesomeIcon icon={faSpinner}/>
                    </SpinIcon>
                    :<SearchIcon onClick={()=>this.inputDom.focus()}>
                        <FontAwesomeIcon icon={faSearch}/>
                    </SearchIcon>
                }
            
               
                <TextInput
                    id='hornet-id' type='text' placeholder="Hornet Id" autoComplete="off"
                    ref={this.setInputRef}
                    onKeyDown={this.props.inputKeyDown}/>
            </Wrapper>
        )
    }

    setInputRef = (dom)=>{
        this.inputDom = dom
        this.props.setInputRef ?this.props.setInputRef(dom):null
    }
}

export default Search;