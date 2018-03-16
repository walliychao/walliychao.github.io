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

    dict = {
        iterLine: '分形线段',
        iterPoint: '分形点集',
        formula: '分形艺术',
        sierpinski: '谢尔宾斯基三角形',
        fiber: '分形藤蔓',
        step: '分形台阶',
        tree: '分形树',
        c_shape: 'C曲线',
        koch: '科赫曲线',
        shrub: '分形灌木',
        transform: '分形动画',
        sierpinski_fiber: '谢尔宾斯基->藤蔓',
        step_tree: '台阶->树',
        koch_shrub: '科赫->灌木',
        fern: '巴恩斯利蕨',
        helix: '螺旋',
        heart: '心形',
        julia: '朱利亚集(julia)',
        mandelbrot: '曼德布洛特集(mandelbrot)'
    }

    @observable types = {
        // transform between two fractal which has the same length of MSet
        iterLine: {
            sierpinski: {iteration: 7},
            fiber: {iteration: 7},
            step: {iteration: 7},
            tree: {iteration: 7},
            c_shape: {iteration: 7},
            koch: {iteration: 7},
            shrub: {iteration: 7},
            transform: {
                iteration: 7,
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
                iteration: 30000,
                animate: false
            },
            helix: {
                iteration: 30000,
                animate: false
            },
            heart: {
                iteration: 30000,
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
                iteration: 35
            },
            mandelbrot: {
                pixels: 500,
                size: 1.3,
                distanceX: -0.5,
                distanceY: 0,
                iteration: 35
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
                mod = ZSet[i*n+j] * (200 / opts.iteration)
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
            for (let i = 0; i < opts.iteration; i++) {
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
        for (let i = 0; i < opts.iteration; i++) {
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
            for (let i = 0; i < opts.iteration; i++) {
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
                return <div key={i}>
                    {currControls[k].value && currControls[k].list ?
                        <ul>
                        {currControls[k].list.map((opt, idx) => 
                            <li key={i + '.' + idx}>
                                <input type="radio" name="innertype"
                                    id={opt} value={currControls[k].list[idx]}
                                    checked={currControls[k].value === opt} onChange={e => this.updInnerType(e, k)} />
                                <label className={currControls[k].value === opt ? 'checked' : ''} htmlFor={opt}>{this.dict[opt]}</label>
                            </li>
                        )}
                        </ul>
                        : <div> {k}
                            <input type={k.indexOf('Color') !== -1 ? 'color' : (k === 'animate' ? 'checkbox' : 'number')}
                                onChange={e => this.updInnerParam(e, k)}
                                onBlur={e => this.blurInnerParam(e, k)}
                                value={+currControls[k] || 0} checked = {!!currControls[k]} />
                        </div>
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
                <ul>
                {Object.keys(this.types).map((k, i) => 
                    <li key={i}>
                        <input type="radio" name="type" id={k} value={k} checked={this.currentType === k} onChange={this.updType} />
                        <label className={this.currentType === k ? 'checked' : ''} htmlFor={k}>{this.dict[k]}</label>
                    </li>
                )}
                </ul>
                <ul>
                {Object.keys(this.types[this.currentType]).map((k, i) => 
                    <li key={i}>
                        <input type="radio" name="name" id={k} value={k} checked={this.currentName === k} onChange={this.updName} />
                        <label className={this.currentName === k ? 'checked' : ''} htmlFor={k}>{this.dict[k]}</label>
                    </li>
                )}
                </ul>
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
        this.refs.canvas.width = 500
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
            {this.ctx ? <StyledControls context={this.ctx} maps={this.maps} /> : null}
        </div>
        
    }
}

module.exports = PageWrap