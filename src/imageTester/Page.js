import React, {Component} from 'react'
import { observer } from 'mobx-react'
import { observable, action } from 'mobx'
import generator from './generator'

const style = {
    canvas: {
        backgroundColor: 'black',
        display: 'inline-block',
        float: 'left',
        transform: 'translateZ(0)'
    },
    controls: {
        display: 'inline-block',
        float: 'left',
        marginLeft: 10
    },
    hint: {
        position: 'absolute',
        color: 'lightgrey',
        right: 5,
        top: 5
    }
}

@observer class Controls extends Component {

    constructor(props) {
        super(props)

        this.generating = false
        this.shouldReGenerate = false
    }

    @observable controls = {
        triangulate: {
            edgeDetectValue: 100,
            maxPointNumber: 5000
        },
        printing: {
            edgeDetectValue: 100,
            printingColor: '#ffffff'
        },
        mosaic: {
            blockSize: 10
        },
        poster: {
            maskColor: '#eee000'
        },
        painting: {
            scaleNumber: 5,
            brushSize: 2,
            SFactor: 1.5
        }
    }

    @observable currentType = 'painting'
   

    componentDidMount() {
        this.generate()
    }

    generate = () => {
        document.getElementById('isGen').innerHTML = 'Generating...'
        this.generating = true
        setTimeout(() => {
            generator(
                this.props.context,
                this.props.originCtx,
                this.currentType,
                this.controls[this.currentType])
            document.getElementById('isGen').innerHTML = 'Generated'
            this.generating = false
        }, 100)
    }

    @action changeType = e => {
        this.currentType = e.target.value
        this.generate()
    }

    @action changeParam = (e, k) => {
        this.controls[this.currentType][k] = e.target.value
    }

    renderControls = () => {
        const currControls = this.controls[this.currentType]
        return <div>
            {Object.keys(currControls).map((k, i) => {
                return <div key={i}>{k}
                    <input type={k.indexOf('Color') !== -1 ? 'color' : 'number'}
                    onChange={e => this.changeParam(e, k)}
                    onBlur = {this.generate}
                    value={currControls[k]} disabled = {this.generating}/>
                </div>
            })}
        </div>
    }

    render() {
        return <div style={style.controls}>
            <div>
                Type
                <select onChange={this.changeType} value={this.currentType}
                    disabled = {this.generating}>
                    {Object.keys(this.controls).map((k, i) => <option
                        key={i} value={k}>{k}</option>
                    )}
                </select>
                {this.renderControls()}
                <span id="isGen">
                    {'Generating...'}
                </span>
                <span style={style.hint}>Drop image to change source</span>
            </div>
        </div>
    }
}

class PageWrap extends Component {

    constructor(props) {
        super(props)

        this.ctx = null
        this.imageSource = new Image()
    }

    componentDidMount() {
        this.ctx = this.refs.canvas.getContext('2d')
        this.originCtx = this.refs.originCanvas.getContext('2d')
        const self = this
        this.imageSource.src = './image/imageTest.jpg'

        this.imageSource.onload = (e) => {
            if (self.imageSource.width > 1000 || self.imageSource.width < 500) {
                let scale = self.imageSource.height / self.imageSource.width
                self.imageSource.width = 700
                self.imageSource.height = (scale * 700) | 0
            }
            self.refs.canvas.width = self.imageSource.width
            self.refs.canvas.height = self.imageSource.height
            self.ctx.drawImage(this.imageSource, 0, 0, this.imageSource.width, this.imageSource.height)
            
            self.refs.originCanvas.width = self.imageSource.width
            self.refs.originCanvas.height = self.imageSource.height
            self.originCtx.drawImage(this.imageSource, 0, 0, this.imageSource.width, this.imageSource.height)
            
            self.setState({})
        }
    }

    imageDrop = (e) => {
        e.preventDefault()
        const reader = new FileReader()
        reader.readAsDataURL(e.dataTransfer.files[0])
        const self = this
        reader.onload = (e) => {
            self.imageSource.src = e.target.result
        }
    }


    render() {        
        return <div onDrop={this.imageDrop}
            onDragOver={e => e.preventDefault()}
            onDragLeave={e => e.preventDefault()}>
            <canvas ref="canvas" style={style.canvas}></canvas>
            <canvas ref="originCanvas" style={{display: 'none'}}></canvas>
            {this.ctx ? <Controls context={this.ctx} originCtx={this.originCtx} /> : null}
        </div>
    }
}

module.exports = PageWrap