import React, {Component} from 'react'
import { observer } from 'mobx-react'
import { observable, action } from 'mobx'
import generator from './generator'
import styled from 'styled-components'
import styles from './page.styled.js'

@observer class Controls extends Component {

    constructor(props) {
        super(props)

        this.shouldReGenerate = false
    }

    @observable controls = {
        triangulate: {
            edgeDetectFactor: 100,
            maxPointNumber: 5000
        },
        printing: {
            edgeDetectFactor: 100,
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
            saturateFactor: 1.5
        }
    }

    dict = {
        triangulate: '三角剖分',
        printing: '版印',
        mosaic: '马赛克',
        poster: '海报',
        painting: '水彩'
    };

    @observable currentType = 'painting'
   

    componentDidMount() {
        this.generate()
    }

    generate = () => {
        document.getElementById('isGen').innerHTML = 'Generating...'
        setTimeout(() => {
            generator(
                this.props.context,
                this.props.originCtx,
                this.currentType,
                this.controls[this.currentType])
            document.getElementById('isGen').innerHTML = 'Generated'
        }, 50)
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
                    value={currControls[k]}/>
                </div>
            })}
        </div>
    }

    render() {
        return <div className={this.props.className}>
            <div className="controls">
                <ul>
                {Object.keys(this.controls).map((k, i) => 
                    <li key={i}>
                        <input type="radio" name="type" id={k} value={k} checked={this.currentType === k} onChange={this.changeType} />
                        <label className={this.currentType === k ? 'checked' : ''} htmlFor={k}>{this.dict[k]}</label>
                    </li>
                )}
                </ul>
                {this.renderControls()}
                <span id="isGen">
                    {'Generating...'}
                </span>
                <span className="hint">Drop image on the canvas to change source</span>
            </div>
        </div>
    }
}

const StyledControls = styled(Controls)`${styles}`


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
            <canvas ref="canvas" style={{
                backgroundColor: 'black', display: 'inline-block', float: 'left'
            }}></canvas>
            <canvas ref="originCanvas" style={{display: 'none'}}></canvas>
            {this.ctx ? <StyledControls context={this.ctx} originCtx={this.originCtx} /> : null}
        </div>
    }
}

module.exports = PageWrap