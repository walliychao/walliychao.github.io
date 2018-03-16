import {css} from 'styled-components'
export default css`

.controls {
    display: inline-block;
    float: left;
    margin-left: 10px;
    left: 30px;
    input {
        border-radius: 5px;
        border-width: 1px;
        padding: 2px 5px;
    }
}
.hint {
    position: absolute;
    color: lightgrey;
    top: 5px;
    right: 5px;
}
#isGen {
    color: grey;
}
ul {
    padding-left: 0;
    li {
        display: inline-block;
        font-family: monospace;
        background-color: lavender;
        color: grey;
        border-radius: 5px;
        padding: 2px 10px;
        line-height: 1.5;
        margin: 0 5px;
        input {
            display: none;
        }
        label {
            cursor: pointer;
        }
        label.checked {
            color: mediumpurple;
        }
        &:hover {
            color: darkgrey;
        }
    }
}
`