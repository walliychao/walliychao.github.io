import {css} from 'styled-components'
export default css`

.controls {
    display: inline-block;
    float: left;
    margin-left: 10px;
    color: ${props => props.color};
    left: 30px;
}
.globalCtr {
    position: absolute;
    right: 300px;
    top: 10px;
}

`