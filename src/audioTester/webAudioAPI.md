## [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
> Audio Context
>> Inputs -> Effects -> Destination

```
    sourceNode
    .connect(analyser)
    .connect(distortion)
    .connect(convolver)
    ...
    .connect(destination)
```

#### Inputs

- from ajax request

```
    audioContext.decodeAudioData(ajaxRequest.response, function(buffer) {
        const sourceNode = audioContext.createBufferSource()
        sourceNode.buffer = buffer
        ... ...
        sourceNode.start()
    })
```

- from FileReader
`fileReader.readAsArrayBuffer()`

- [OscillatorNode](https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode)

- from User Media
[getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia), [MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)

#### Effects

- [AnalyserNode](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode)

- [ConvolverNode](https://developer.mozilla.org/en-US/docs/Web/API/ConvolverNode)

- [BiquadFilterNode](https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode)

- [GainNode](https://developer.mozilla.org/en-US/docs/Web/API/GainNode)

- [WaveShaperNode](https://developer.mozilla.org/en-US/docs/Web/API/WaveShaperNode)

- [DelayNode](https://developer.mozilla.org/en-US/docs/Web/API/DelayNode)
... ...

#### Times

- audioContext.currentTime

- sourceNode.stop(audioContext.currentTime + 2)

- [AudioParam](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam)
`AudioParam.setValueAtTime()`
`AudioParam.cancelScheduledValues()`

#### [Channels](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Basic_concepts_behind_Web_Audio_API)

- [ChannelSplitterNode](https://developer.mozilla.org/en-US/docs/Web/API/ChannelSplitterNode)

- [ChannelMergerNode](https://developer.mozilla.org/en-US/docs/Web/API/ChannelMergerNode)

#### [Spatialization](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Web_audio_spatialization_basics)

- [Listenner](https://developer.mozilla.org/en-US/docs/Web/API/AudioListener)

- [PannerNode](https://developer.mozilla.org/en-US/docs/Web/API/PannerNode)
 

## [Tone.js](https://github.com/Tonejs/Tone.js)
> Tone.js is a Web Audio framework for creating **interactive music** in the browser. The architecture of Tone.js aims to be familiar to both **musicians** and **audio programmers** looking to create web-based audio applications.