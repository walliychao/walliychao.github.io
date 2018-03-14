import React, {Component} from 'react'
import { observer } from 'mobx-react'
import { observable } from 'mobx'
import Maps from './examples'
import {Affine, Mutation} from 'math'

const style = {
    bakCvs: {
        zIndex: -1,
        backgroundColor: 'black',
        transform: 'translateZ(0)',
        position: 'absolute',
        left: 10,
        top: 90
    },
    canvas: {
        backgroundColor: 'transparent',
        position: 'absolute',
        left: 10,
        top: 90,
        cursor: 'pointer',
        transform: 'translateZ(0)'
    },
    controls: {
        position: 'absolute',
        left: 820,
        marginTop: 10,
        lineHeight: 1.3,
        color: 'grey'
    },
    globalCtr: {
        color: 'grey'
    }
}

@observer
class Custom extends Component {

    @observable points = []
    @observable triangles = []
    @observable mutations = []
    @observable probability = []
    @observable generated = false

    isdrag = null

    constructor(prop) {
        super(prop)

        this.ctx = null
        this.mouseDown = this.mouseDown.bind(this)
        this.mouseUp = this.mouseUp.bind(this)
        this.mouseMove = this.mouseMove.bind(this)
        this.clear = this.clear.bind(this)
        // this.generate = this.generate.bind(this)
        // this.animate = this.animate.bind(this)
    }

    mouseDown(e) {
        this.isdrag = new Date().getTime()
        this.points.push([e.clientX, e.clientY])
        // if (!this.points.length) {
        //     this.points.push([e.clientX, e.clientY])
        // }
        // else if (this.points.length === 1) {
        //     this.ctx.clearRect(0, 0, this.refs.canvas.width, this.refs.canvas.height)
        //     this.ctx.beginPath()
        //     this.ctx.moveTo(this.points[0][0], this.points[0][1])
        //     this.ctx.lineTo(e.clientX, e.clientY)
        //     this.ctx.stroke()
        //     this.ctx.closePath()
        // }
        // else if (this.points.length === 2) {
        //     this.ctx.clearRect(0, 0, this.refs.canvas.width, this.refs.canvas.height)
        //     this.ctx.beginPath()
        //     this.ctx.moveTo(this.points[0][0], this.points[0][1])
        //     this.ctx.lineTo(this.points[1][0], this.points[1][1])
        //     this.ctx.lineTo(e.clientX, e.clientY)
        //     this.ctx.lineTo(this.points[0][0], this.points[0][1])
        //     this.ctx.stroke()
        //     this.ctx.closePath()
        // }
    }
    mouseUp(e) {
        const time = new Date().getTime()
        if (time - this.isdrag < 300) {
            this.ctx.fillRect(e.clientX, e.clientY, 3, 3)
            this.points[0][0] = e.clientX
            this.points[0][1] = e.clientY
        }
        else { 
            this.points.push([e.clientX, e.clientY])
        }

        this.isdrag = null

        if (this.points.length >= 3) {
            this.triangles.push(this.points.splice(0, 3))
            this.points = []
            if (this.triangles.length === 2) {
                this.mutations.push(this.triangles[0].concat(this.triangles[1]))
                this.triangles = []
                this.updProbability()
            }
        }
    }

    mouseMove(e) {
        const draw = () => {
            this.ctx.clearRect(0, 0, this.refs.canvas.width, this.refs.canvas.height)
            this.ctx.beginPath()
            if (this.points.length === 1) {
                this.ctx.moveTo(this.points[0][0], this.points[0][1])
                this.ctx.lineTo(e.clientX, e.clientY)
            }
            else {
                this.ctx.moveTo(this.points[0][0], this.points[0][1])
                this.ctx.lineTo(this.points[1][0], this.points[1][1])
                this.ctx.lineTo(e.clientX, e.clientY)
                this.ctx.lineTo(this.points[0][0], this.points[0][1])
            }
            this.ctx.stroke()
            this.ctx.closePath()
        }
        // requestAnimationFrame(draw)
        this.isdrag ? draw() : null
    }

    updProbability() {
        this.probability = []
        for (let i = 0; i < this.mutations.length; i++) {
            this.probability.push(1/this.mutations.length)
        }
    }

    clear() {
        this.points = []
        this.ctx.clearRect(0, 0, this.refs.canvas.width, this.refs.canvas.height)
        this.triangles = []
        this.mutations = []
        this.probability = []
    }

    renderCurrent() {
        return <div style={style.controls}>
            <div>{'points: ' + this.points.map(p => p.join(',')).join(' ')}</div>
            <div>triangles: </div>
            {this.triangles.map((t, i) => {
                return <div key={i}>{t.map(p => p.join(',')).join(' ')}</div>
            })}
            <div>mutations: </div>
            {this.mutations.map((m, i) => {
                return <div key={i}>{m.map(p => p.join(',')).join(' ')}</div>
            })}
            <div>probabilities:
                {this.probability.map((p, i) => {
                    return <input key={i} type="number" max={1} step={0.1} value={p}
                    onChange={e => this.probability[i] = e.target.value}  />
                })}
            </div>
            <div>
                <button onClick={this.generate}>generate</button>
                <button onClick={this.animate}>animate</button>
                <button onClick={this.clear}>clear</button>
            </div>         
        </div>
    }

    renderInstructs() {
        let instruct = ''
        if (!this.generated && !this.mutations.length && !this.triangles.length) {
            instruct = 'Now try dragging on the canvas to make a triangle'
        }
        else if (!this.generated && !this.mutations.length && this.triangles.length === 1) {
            instruct = 'Now you\'ve got a triangle, try to make another one'
        }
        else if (!this.generated && this.mutations.length === 1) {
            instruct = 'Now you\'ve got a mutation(two triangles), try to make another one'
        }
        else if (!this.generated && this.mutations.length > 1) {
            instruct = 'you can make several mutations and click `generate` to see the outcome'
        }
        else if (this.generated) {
            instruct = 'Now try to change the probabilities and/or click `animate` to see the diffrence'
        }
        return <div style={style.globalCtr}>
            {instruct}
        </div>
    }

    initBack() {
        this.bakCtx.strokeStyle = '#555'
        this.bakCtx.beginPath()
        for (let x = 20; x < 800; x+=20) {
            this.bakCtx.moveTo(x, 0)
            this.bakCtx.lineTo(x, 500)
        }
        for (let y = 20; y < 500; y+=20) {
            this.bakCtx.moveTo(0, y)
            this.bakCtx.lineTo(800, y)
        }
        this.bakCtx.stroke()
        this.bakCtx.closePath()
    }

    componentDidMount() {
        this.ctx = this.refs.canvas.getContext('2d')
        this.bakCtx = this.refs.bakCvs.getContext('2d')
        this.refs.canvas.width = 800
        this.refs.canvas.height = 500
        this.refs.bakCvs.width = 800
        this.refs.bakCvs.height = 500
        this.maps = new Maps({
            trans: Math.min(this.refs.canvas.width, this.refs.canvas.height) * 0.1,
            baseScale: Math.min(this.refs.canvas.width, this.refs.canvas.height) * 0.6
        })
        this.ctx.fillStyle = '#eee'
        this.ctx.strokeStyle = '#eee'
        this.initBack()
        // this.ctx.globalCompositeOperation = 'lighter'
        this.setState({})
    }

    render() {     
        return <div>
            <canvas ref="bakCvs" style={style.bakCvs}></canvas>
            <canvas onMouseDown={this.mouseDown} onMouseUp={this.mouseUp}
                onMouseMove={this.mouseMove} ref="canvas" style={style.canvas}></canvas>
            {this.renderInstructs()}
            {this.ctx ? this.renderCurrent() : null}
        </div>
    }
}

module.exports = Custom