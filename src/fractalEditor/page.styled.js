import {css} from 'styled-components'
export default css`

.controls {
    display: inline-block;
    float: left;
    margin-left: 10px;
    color: ${props => props.color};
    left: ${props => props.left};
}
.globalCtr {
    position: absolute;
    right: 300px;
    top: 10px;
}

`