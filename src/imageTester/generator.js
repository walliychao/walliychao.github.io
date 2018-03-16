import Filter from 'filter'
import Delaunay from 'delaunay'
import { getRGB } from 'utils'

const generator = {
    triangulate: (context, originCtx, opts) => {
        const width = context.canvas.width
        const height = context.canvas.height

        context.putImageData(originCtx.getImageData(0, 0, width, height), 0, 0)

        // get ImageData & color data

        let imageData = context.getImageData(0, 0, width, height)
        let colorData = imageData.data.slice()

        // 3 * 3 matrix, all '1'
        let blurMatrix = [] 
        for (let i = 0; i < 9; i++) {
            blurMatrix[i] = 1/9
        }

        // 7 * 7 matrix
        let edgeMatrix = []
        for (let i = 0; i < 49; i++) {
            edgeMatrix[i] = i === 24 ? -48 : 1
        }

        let generateTime = new Date().getTime()
        console.log('generate start...')
        
        // grayscale, blur, edgeDetect
        Filter.grayscaleFilterR(imageData)
        Filter.convolutionFilterR(imageData, blurMatrix)
        Filter.convolutionFilterR(imageData, edgeMatrix)
        // get edge point
        let temp = Filter.getEdgePoint(imageData, opts.edgeDetectFactor)
        let detectionNum = temp.length
        
        let points = []
        let i = 0, ilen = temp.length
        let tlen = ilen
        let j, limit = Math.round(ilen * 0.075)
        if (limit > opts.maxPointNumber) limit = opts.maxPointNumber
    
        // randomly poll points out of detected points
        while (i < limit && i < ilen) {
            j = tlen * Math.random() | 0;
            points.push(temp[j]);
            temp.splice(j, 1);
            tlen--;
            i++;
        }
        
        // generate triangles
        let delaunay = new Delaunay(width, height);
        let triangles = delaunay.insert(points).getTriangles()
    
        let t, p0, p1, p2, cx, cy
    
        // paint triangles

        for (ilen = triangles.length, i = 0; i < ilen; i++) {
            t = triangles[i]
            p0 = t.nodes[0]
            p1 = t.nodes[1]
            p2 = t.nodes[2]

            context.beginPath()
            context.moveTo(p0.x, p0.y)
            context.lineTo(p1.x, p1.y)
            context.lineTo(p2.x, p2.y)
            context.lineTo(p0.x, p0.y)

            // get the gravity center of triangle
            cx = (p0.x + p1.x + p2.x) * 0.33333
            cy = (p0.y + p1.y + p2.y) * 0.33333
            
            j = ((cx | 0) + (cy | 0) * width) << 2

            context.fillStyle = 'rgb(' + colorData[j] + ', ' + colorData[j + 1] + ', ' + colorData[j + 2] + ')'
            context.fill()
        }
    
        generateTime = new Date().getTime() - generateTime
        console.log(
            'Generate completed ' + generateTime + 'ms, ' + 
            points.length + ' points (out of ' + detectionNum + ' points, ' + (points.length / detectionNum * 100).toFixed(2) + ' %), ' +
            triangles.length + ' triangles'
        )
    },

    printing: (context, originCtx, opts) => {
        const width = context.canvas.width
        const height = context.canvas.height

        // get ImageData
        context.putImageData(originCtx.getImageData(0, 0, width, height), 0, 0)

        let imageData = context.getImageData(0, 0, width, height)

        // 3 * 3 matrix, all '1'
        let blurMatrix = [] 
        for (let i = 0; i < 9; i++) {
            blurMatrix[i] = 1/9
        }

        // 7 * 7 matrix
        let edgeMatrix = []
        for (let i = 0; i < 49; i++) {
            edgeMatrix[i] = i === 24 ? -48 : 1
        }

        let generateTime = new Date().getTime()
        console.log('generate start...')
        
        // grayscale, blur, edgeDetect
        Filter.grayscaleFilterR(imageData)
        Filter.convolutionFilterR(imageData, blurMatrix)
        Filter.convolutionFilterR(imageData, edgeMatrix)

        let rgb = getRGB(opts.printingColor)

        Filter.colorFilter(imageData, (data, i) => {
            if (data[i] > opts.edgeDetectFactor) {
                data[i] = rgb[0]
                data[i+1] = rgb[1]
                data[i+2] = rgb[2]
            }
            else data[i] = data[i+1] = data[i+2] = 0                
        })

        context.clearRect(0, 0, width, height)
        context.putImageData(imageData, 0, 0)

        generateTime = new Date().getTime() - generateTime
        console.log('Generate completed ' + generateTime + 'ms')
    },

    painting: (context, originCtx, opts) => {
        const width = context.canvas.width
        const height = context.canvas.height

        const brushSize = +opts.brushSize || 1
        const scaleNumber = +opts.scaleNumber || 5
        const SFactor = +opts.saturateFactor || 0

        context.putImageData(originCtx.getImageData(0, 0, width, height), 0, 0)

        // get ImageData & color data

        let imageData = context.getImageData(0, 0, width, height)
        let colorData = context.getImageData(0, 0, width, height)

        let generateTime = new Date().getTime()
        console.log('generate start...')

        SFactor === 0 || Filter.colorFilter(colorData, (data, i) => {
            let r = data[i], g = data[i+1], b = data[i+2], q = 1/3 * (r + g + b) 

            data[i] = SFactor * (r - q) + r
            data[i] > 255 ? data[i] = 255 : null

            data[i+1] = SFactor * (g - q) + g
            data[i+1] > 255 ? data[i+1] = 255 : null

            data[i+2] = SFactor * (b - q) + b
            data[i+2] > 255 ? data[i+2] = 255 : null
        })
        
        // grayscale, blur, paint
        Filter.grayscaleClusterFilterR(imageData, scaleNumber)
        Filter.paintFilter(imageData, colorData.data.slice(), scaleNumber, brushSize)

        context.clearRect(0, 0, width, height)
        context.putImageData(imageData, 0, 0)
    
        generateTime = new Date().getTime() - generateTime
        console.log('Generate completed ' + generateTime + 'ms')
    },

    general: (context, originCtx, filter, args) => {
        const width = context.canvas.width
        const height = context.canvas.height

        // get ImageData
        context.putImageData(originCtx.getImageData(0, 0, width, height), 0, 0)

        let imageData = context.getImageData(0, 0, width, height)

        let generateTime = new Date().getTime()
        console.log('generate start...')

        let argsArray = []
        for (let k in args) {
            argsArray.push(args[k])
        }
        
        filter(imageData, ...argsArray)

        context.clearRect(0, 0, width, height)
        context.putImageData(imageData, 0, 0)

        generateTime = new Date().getTime() - generateTime
        console.log('Generate completed ' + generateTime + 'ms')
    }
}

export default (context, originCtx, type, args) => {
    if (generator[type] && typeof generator[type] === 'function')
        return generator[type](context, originCtx, args)
    else if (Filter[type + 'Filter'] && typeof Filter[type + 'Filter'])
        return generator.general(context, originCtx, Filter[type + 'Filter'], args)
    else return generator.general(context, originCtx, Filter.colorFilter, args)
}
