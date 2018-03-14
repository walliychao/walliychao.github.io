import React, {Component} from 'react'
import { observer } from 'mobx-react'
import { observable } from 'mobx'
import Maps from './examples'
import {Affine, Mutation} from 'math'
import styled from 'styled-components'
import styles from './page.styled.js'

@observer
class Controls extends Component {
    constructor(prop) {
        super(prop)

    }

    @observable types = {
        // transform between two fractal which has the same length of MSet
        iterLine: {
            sierpinski: {iter: 7},
            fiber: {iter: 7},
            step: {iter: 7},
            tree: {iter: 7},
            c_shape: {iter: 7},
            koch: {iter: 7},
            shrub: {iter: 7},
            transform: {
                iter: 7,
                name: {
                    value: 'sierpinski_fiber',
                    list: [
                        'sierpinski_fiber',
                        'step_tree',
                        'koch_shrub'
                    ]
                }
            }
        },
        // custom fractal (6 points .i.e 2 triangles determines A Mutation(image))
        iterPoint: {
            fern: {
                iter: 30000,
                animate: false
            },
            helix: {
                iter: 30000,
                animate: false
            },
            heart: {
                iter: 30000,
                animate: true
            }
        },
        // custom formula(try)
        formula: {
            julia: {
                pixels: 500,
                size: 1.3,
                centerX: 0.28,
                centerY: 0.51,
                iter: 35
            },
            mandelbrot: {
                pixels: 500,
                size: 1.3,
                distanceX: -0.5,
                distanceY: 0,
                iter: 35
            }
        }
    }

    @observable currentType = 'iterLine'
    @observable currentName = 'sierpinski'

    generate = () => {
        document.getElementById('isGen').innerHTML = 'Generating...'
        setTimeout(() => {
            console.log('generate start...')
            this[this.currentType](
                this.props.context,
                this.currentName,
                this.props.maps[this.currentName](this.types[this.currentType][this.currentName]),
                this.types[this.currentType][this.currentName])
            document.getElementById('isGen').innerHTML = 'Generated'
            console.log('generate completed')
        }, 100)

    }

    formula(ctx, currentName, ZSet, opts) {
        let color
        let mod, x
        let l = ZSet.length
        let n = Math.sqrt(l)
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        let imageData = ctx.getImageData(0, 0, n, n)
        let data = imageData.data
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                color = [55, 0, 55]
                mod = ZSet[i*n+j] * (200 / opts.iter)
                color[0] += mod
                color[1] += mod
                color[2] += mod
                data[(i*n+j)*4] = color[0] > 255 ? 255 : color[0]
                data[(i*n+j)*4+1] = color[1] > 255 ? 255 : color[1]
                data[(i*n+j)*4+2] = color[2] > 255 ? 255 : color[2]
                data[(i*n+j)*4+3] = 255
            }
        }

        ctx.putImageData(imageData, 0, 0)
    }

    iterPoint(ctx, currentName, {P0, MSet, Ps}, opts) {
        const draw = (Ps, scale = 1, transx = 0, transy = 0) => {
            if (!Ps) Ps = []
            if (Ps.length < MSet.length) {
                let sum = 0
                for (let i = 0; i < MSet.length; i++) {
                    if (i < Ps.length) {
                        sum += Ps[i]
                    }
                    else {
                        Ps.push((1-sum)/(MSet.length - Ps.length))
                    }
                }
            }
            let r, Pn, M, p
            let result = [[P0.x, P0.y]]
            for (let i = 0; i < opts.iter; i++) {
                r = Math.random()
                p = 0
                M = null
                let j = 0
                for (; j < MSet.length - 1; j++) {
                    p += Ps[j]
                    if (r < p) {
                        M = MSet[j]
                        break
                    }
                }

                if (!M) M = MSet[j]

                Pn = Affine.transform(P0, M)
                result.push([Pn.x, Pn.y])
                P0 = Pn
            }
        
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
            ctx.beginPath()
            for (let i = 0; i < result.length; i++) {
                ctx.rect(result[i][0] * scale + transx, result[i][1] * scale, 1, 1)
            }
            ctx.fill()
            ctx.closePath
        }

        if (opts.animate) {
            let p = 0
            const drawAnimate = () => {
                let Ps = []
                for (let i = 0; i < MSet.length - 1; i++) {
                    Ps.push(p)
                }
                Ps.push(1)
                draw(Ps)
                if (p <= 1/(MSet.length-1)) {
                    requestAnimationFrame(drawAnimate)
                }
                p += 0.01
            }
            drawAnimate()
        }
        else {
            currentName === 'fern' ? draw(Ps, 40, 300, 500)
            : draw(Ps)
        }
    }

    iterLine(ctx, currentName, {PSet, MSet, keep}, opts) {
        if (currentName === 'transform') {
            this.transform(ctx, {PSet, MSet, keep}, opts)
            return
        }

        let pSet = PSet.slice()
        let index = 0
        for (let i = 0; i < opts.iter; i++) {
            let l = Math.pow(MSet.length, i)
            for (let j = 0; j < l; j++) {
                for (let k = 0; k < MSet.length; k++) {
                    pSet.push(Affine.transform(pSet[index + j], MSet[k])) 
                }
            }
            keep ? index += l : pSet.splice(0, l)
        }
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        let l = pSet.length
        let i = 0

        ctx.beginPath()
        for (let i = 0; i < pSet.length; i++) {
            ctx.moveTo(pSet[i][0].x, pSet[i][0].y)
            for (let k = 1; k < pSet[i].length; k++) {
                ctx.lineTo(pSet[i][k].x, pSet[i][k].y)  
            }
        }
        ctx.stroke()
        ctx.closePath()

    }

    transform(ctx, {PSet, MSet, keep}, opts) {
        let x = 0
        const len = MSet.length / 2
        const draw = () => {
            let Ms = []
            for (let i = 0; i < len; i++) {
                Ms.push(Mutation.add(
                    Mutation.multi(1 - x, MSet[i]),
                    Mutation.multi(x, MSet[i + len])
                ))
            }

            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
            let pSet = PSet.slice()
            let index = 0
            for (let i = 0; i < opts.iter; i++) {
                let l = Math.pow(len, i)
                for (let j = 0; j < l; j++) {
                    for (let k = 0; k < len; k++) {
                        pSet.push(Affine.transform(pSet[index + j], Ms[k])) 
                    }
                }
                keep ? index += l : pSet.splice(0, l)
            }
            
            ctx.beginPath()
            for (let i = 0; i < pSet.length; i++) {
                ctx.moveTo(pSet[i][0].x, pSet[i][0].y)
                for (let k = 1; k < pSet[i].length; k++) {
                    ctx.lineTo(pSet[i][k].x, pSet[i][k].y)  
                }
            }
            ctx.stroke()
            ctx.closePath()

            x += 0.01
            if (x > 0 && x <= 1) {
                requestAnimationFrame(draw)
            }

        }
        draw()
    }

    updInnerType = (e, k) => {
        this.types[this.currentType][this.currentName][k].value = e.target.value
        this.generate()
    }

    updInnerParam = (e, k) => {
        this.types[this.currentType][this.currentName][k] = k === 'animate' ? e.target.checked : e.target.value
    }

    blurInnerParam = (e, k) => {
        Number.isNaN(+this.types[this.currentType][this.currentName][k])
            ? null : this.generate()
    }

    renderControls = () => {
        const currControls = this.types[this.currentType][this.currentName]
        return <div>
            {Object.keys(currControls).map((k, i) => {
                return <div key={i}>{k}
                    {currControls[k].value && currControls[k].list ?
                        <select onChange={e => this.updInnerType(e, k)} value={currControls[k].value}
                            disabled={this.generating}>
                            {currControls[k].list.map((opt, idx) =>
                                <option key={idx} value={opt}>{opt}</option>
                            )}
                        </select>
                        : <input type={k.indexOf('Color') !== -1 ? 'color' : (k === 'animate' ? 'checkbox' : 'number')}
                            onChange={e => this.updInnerParam(e, k)}
                            onBlur={e => this.blurInnerParam(e, k)}
                            disabled={this.generating}
                            value={+currControls[k] || 0} checked = {!!currControls[k]} />
                    }
                </div>
            })}
        </div>
    }

    updType = e => {
        this.currentType = e.target.value
        this.currentName = Object.keys(this.types[this.currentType])[0]
        this.generate()
    }

    updName = e => {
        this.currentName = e.target.value
        this.generate()
    }

    componentDidMount() {
        this.generate()
    }

    render() {
        return <div className={this.props.className}>
            <div className="controls">
                Type
                <select onChange={this.updType} value={this.currentType}
                    disabled={this.generating}>
                    {Object.keys(this.types).map((k, i) => <option
                        key={i} value={k}>{k}</option>
                    )}
                </select>
                Name
                <select onChange={this.updName} value={this.currentName}
                    disabled={this.generating}>
                    {Object.keys(this.types[this.currentType]).map((k, i) => <option
                        key={i} value={k}>{k}</option>
                    )}
                </select>
                {this.renderControls()}
                <span id="isGen">
                    {'Generating...'}
                </span>
            </div>
        </div>
    }
}

const StyledControls = styled(Controls)`${styles}`

@observer
class PageWrap extends Component {

    constructor(prop) {
        super(prop)

        this.ctx = null

    }

    componentDidMount() {
        this.ctx = this.refs.canvas.getContext('2d')
        this.refs.canvas.width = 800
        this.refs.canvas.height = 500
        this.maps = new Maps({
            trans: Math.min(this.refs.canvas.width, this.refs.canvas.height) * 0.1,
            baseScale: Math.min(this.refs.canvas.width, this.refs.canvas.height) * 0.6
        })
        this.ctx.fillStyle = '#fff'
        this.ctx.strokeStyle = '#fff'
        this.ctx.globalCompositeOperation = 'lighter'
        this.setState({})
    }

    render() {     
        return <div>
            <canvas ref="canvas" style={{
                backgroundColor: 'black', display: 'inline-block', float: 'left'
            }}></canvas>
            {this.ctx ? <Controls color="salmon" context={this.ctx} maps={this.maps} /> : null}
        </div>
        
    }
}

module.exports = PageWrap