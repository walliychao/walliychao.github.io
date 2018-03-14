import React, {Component} from 'react'
import { observer } from 'mobx-react'
import { observable } from 'mobx'

const style = {
    canvas: {
        width: 800,
        height: 100,
        float: 'left',
        backgroundColor: 'black'
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

const makeDistortionCurve = (amount) => {
  var k = typeof amount === 'number' ? amount : 50,
    n_samples = 44100,
    curve = new Float32Array(n_samples),
    deg = Math.PI / 180,
    i = 0,
    x;
  for ( ; i < n_samples; ++i ) {
    x = i * 2 / n_samples - 1;
    curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
  }
  return curve;
}

@observer class Controls extends Component {

    @observable controls = {
        off: {},
        distortion: {
            curveValue: 400,
            oversample: {
                value: '4x',
                list: ['none', '2x', '4x']
            }
        },
        convolver: {},
        biquad: {
            type: {
                value: 'lowshelf',
                list: ['lowpass', 'highpass', 'bandpass', 'allpass', 'lowshelf', 'highshelf', 'peaking', 'notch']
            },
            frequencyValue: 1000,
            QValue: 100,
            gainValue: 25
        },
        gain: {
            gainValue: 1
        },
        oscillator: {
            frequencyValue: 440,
            detuneValue: 100,
            type: {
                value: 'square',
                list: ['sine', 'square', 'sawtooth', 'triangle', 'custom']
            }
        }
    }

    @observable currentType = 'off'

    @observable generating = false

    componentDidMount() {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)()

        const ajaxRequest = new XMLHttpRequest()

        ajaxRequest.open('GET', 'https://mdn.github.io/voice-change-o-matic/audio/concert-crowd.ogg', true)

        ajaxRequest.responseType = 'arraybuffer'

        const self = this

        ajaxRequest.onload = function() {

            self.audioCtx.decodeAudioData(ajaxRequest.response, function(buffer) {
                self.concertHallBuffer = buffer
            }, function(e){console.log("Error with decoding audio data" + e.err)});
        }

        ajaxRequest.send()

        this.generate()
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.src !== this.props.src) {
            this.generate(undefined, nextProps.src)
        }
    }

    generate = (e, src) => {
        if (this.generating) return
        this.generating = true

        this.sourceNode && this.sourceNode.stop()

        if (!src) src = this.props.src
        
        if (typeof src === 'string') {
            const request = new XMLHttpRequest()
            request.open('GET', src)
            request.responseType = 'arraybuffer'

            const self = this

            request.onload = () => {
                const audioData = request.response
                self.audioCtx.decodeAudioData(audioData, self.receiveBuffer)
            }
            request.send()

        } else {
            this.audioCtx.decodeAudioData(src, this.receiveBuffer)
        }
        this.generating = false
    }

    receiveBuffer = (buffer) => {
        const analyser = this.audioCtx.createAnalyser()
        analyser.minDecibels = -90
        analyser.maxDecibels = -10
        analyser.smoothingTimeConstant = 0.85

        if (this.currentType !== 'oscillator') {
            const sourceNode = this.audioCtx.createBufferSource()
            sourceNode.buffer = buffer
            sourceNode.loop = true

            sourceNode.connect(analyser)

            switch (this.currentType) {
                case 'off':
                    analyser.connect(this.audioCtx.destination)
                    break

                case 'distortion':
                    const distortion = this.audioCtx.createWaveShaper()
                    distortion.oversample = this.controls.distortion.oversample.value
                    distortion.curve = makeDistortionCurve(+this.controls.distortion.curveValue)
                    analyser.connect(distortion)
                    distortion.connect(this.audioCtx.destination)
                    break

                case 'convolver':
                    const convolver = this.audioCtx.createConvolver()
                    convolver.buffer = this.concertHallBuffer
                    analyser.connect(convolver)
                    convolver.connect(this.audioCtx.destination)
                    break

                case 'biquad':
                    const biquadFilter = this.audioCtx.createBiquadFilter()
                    biquadFilter.type = this.controls.biquad.type.value
                    biquadFilter.frequency.value = +this.controls.biquad.frequencyValue
                    biquadFilter.gain.value = +this.controls.biquad.gainValue
                    biquadFilter.Q.value = +this.controls.biquad.QValue                
                    analyser.connect(biquadFilter)
                    biquadFilter.connect(this.audioCtx.destination)
                    break

                case 'gain':
                    const gainNode = this.audioCtx.createGain()
                    gainNode.gain.value = +this.controls.gain.gainValue
                    analyser.connect(gainNode)
                    gainNode.connect(this.audioCtx.destination)
                    break
            }
            sourceNode.start()
            this.visualize(analyser)
            this.sourceNode = sourceNode
        }
        else {
            const oscillator = this.audioCtx.createOscillator()
            oscillator.frequency.value = +this.controls.oscillator.frequencyValue
            oscillator.detune.value = +this.controls.oscillator.detuneValue
            if (this.controls.oscillator.type.value !== 'custom') {
                oscillator.type = this.controls.oscillator.type.value
            } 
                else {
                // periodic wave
                let real = new Float32Array(2)
                let imag = new Float32Array(2)

                real[0] = 0
                imag[0] = 1
                real[1] = 1
                imag[1] = -1

                const wave = this.audioCtx.createPeriodicWave(real, imag, {disableNormalization: true})

                oscillator.setPeriodicWave(wave)
            }

            oscillator.connect(analyser)
            analyser.connect(this.audioCtx.destination)
            oscillator.start()
            this.visualize(analyser)
            oscillator.stop(this.audioCtx.currentTime + 2)
        }
        
    }

    stop = () => {this.sourceNode && this.sourceNode.stop()}

    visualize = (analyser) => {
        const canvasCtx = this.props.canvasCtx
        const WIDTH = canvasCtx.canvas.width
        const HEIGHT = canvasCtx.canvas.height

        analyser.fftSize = 256;
        var bufferLength = analyser.frequencyBinCount;
        console.log(bufferLength);
        var dataArray = new Uint8Array(bufferLength);

        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

        function draw() {
          requestAnimationFrame(draw);

          analyser.getByteFrequencyData(dataArray);

          canvasCtx.fillStyle = 'rgb(0, 0, 0)';
          canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

          var barWidth = (WIDTH / bufferLength) * 2.5;
          var barHeight;
          var x = 0;

          for(var i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i];

            canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
            canvasCtx.fillRect(x,HEIGHT-barHeight/2,barWidth,barHeight/2);

            x += barWidth + 1;
          }
        };

        draw();
    }

    renderControls = () => {
        const currControls = this.controls[this.currentType]
        return <div>
            {Object.keys(currControls).map((k, i) => {
                if (typeof currControls[k] === 'object') {
                    return <div key={i}>{k}
                        <select onBlur={this.generate} value={currControls[k].value}
                            onChange={e => currControls[k].value = e.target.value}>
                            {currControls[k].list.map((k, i) => <option
                                key={i} value={k}>{k}</option>
                            )}
                        </select>
                    </div>
                }
                else return <div key={i}>{k}
                    <input type={k.indexOf('Value') !== -1 ? 'number' : 'text'}
                    onChange={e => currControls[k] = e.target.value}
                    value={currControls[k]} onBlur={this.generate} />
                </div>
            })}
        </div>
    }

    render() {
        return <div style={style.controls}>
            <div>
                Type
                <select onBlur={this.generate}  onChange={e => this.currentType = e.target.value} value={this.currentType}>
                    {Object.keys(this.controls).map((k, i) => <option
                        key={i} value={k}>{k}</option>
                    )}
                </select>
                {this.renderControls()}
                <button onClick={this.stop}>Stop</button>
                <span style={style.hint}>Drop file to change source</span>
            </div>
        </div>
    }
}

class PageWrap extends Component {

    componentDidMount() {
        this.refs.canvas.width = style.canvas.width
        this.refs.canvas.height = style.canvas.height
        this.canvasCtx = this.refs.canvas.getContext('2d')
        this.setState({src: '/audio/3528.wav'})
    }

    fileDrop = (e) => {
        e.preventDefault()
        const reader = new FileReader()
        reader.readAsArrayBuffer(e.dataTransfer.files[0])
        const self = this
        reader.onload = (e) => {
            self.setState({src: e.target.result})
        }
    }

    render() {        
        return <div onDrop={this.fileDrop}
            onDragOver={e => e.preventDefault()}
            onDragLeave={e => e.preventDefault()}>
            <canvas ref="canvas" style={style.canvas}></canvas>
            {this.canvasCtx ? <Controls canvasCtx={this.canvasCtx} src={this.state.src} /> : null}
        </div>
    }
}

module.exports = PageWrap