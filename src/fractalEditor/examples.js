import {Affine, Mutation, Complex} from 'math'

class Maps {
    constructor(prop) {
        this.baseScale = prop.baseScale || 400
        this.trans = prop.trans || 100
    }
    sierpinski() {
        const initPoints = [
            new Affine(this.trans, this.trans + this.baseScale),
            new Affine(this.trans + this.baseScale, this.trans + this.baseScale),
            new Affine(this.trans + 0.5 * this.baseScale, this.trans + (1 - 0.5 * Math.pow(3, 0.5)) * this.baseScale),
            new Affine(this.trans, this.trans + this.baseScale)            
        ]

        const MSet = [
            Mutation.scale(0.5, initPoints[0]),
            Mutation.scale(0.5, initPoints[1]),
            Mutation.scale(0.5, initPoints[2])
        ]

        return {
            PSet: [initPoints],
            MSet
        }
    }
    fiber() {
        const initPoints = [
            new Affine(this.trans, this.trans + this.baseScale),
            new Affine(this.trans + this.baseScale, this.trans + this.baseScale),
            new Affine(this.trans + this.baseScale, this.trans)];

        const MSet = [
            Mutation.scale(0.5, initPoints[0]),
            Mutation.scale(0.5, initPoints[1]),
            Mutation.image(
                initPoints[0],
                initPoints[1],
                initPoints[2],
                new Affine(this.trans + this.baseScale, this.trans + 0.5 * this.baseScale),
                initPoints[2],
                new Affine(this.trans + 0.5 * this.baseScale, this.trans)
            )
        ]

        return {
            PSet: [initPoints],
            MSet
        }
    }
    step() {
        const initPoints = [
            new Affine(this.trans + 0.25 * this.baseScale, this.trans + this.baseScale),
            new Affine(this.trans + 0.75 * this.baseScale, this.trans + this.baseScale),
            new Affine(this.trans + 0.75 * this.baseScale, this.trans + 0.5 * this.baseScale),
            new Affine(this.trans + 0.25 * this.baseScale, this.trans + 0.5 * this.baseScale),
            new Affine(this.trans + 0.25 * this.baseScale, this.trans + this.baseScale)
        ]
        const MSet = [
            Mutation.image(initPoints[0], initPoints[1], initPoints[3], initPoints[3],
                new Affine(this.trans + 0.5 * this.baseScale, this.trans + 0.5 * this.baseScale),
                new Affine(this.trans + 0.25 * this.baseScale, this.trans + 0.25 * this.baseScale)
            ),
            Mutation.image(initPoints[0], initPoints[1], initPoints[3], initPoints[1],
                new Affine(this.trans + this.baseScale, this.trans + this.baseScale),
                new Affine(this.trans + 0.75 * this.baseScale, this.trans + 0.75 * this.baseScale)
            )
        ]

        return {
            PSet: [initPoints],
            MSet,
            keep: true
        }
    }
    tree() {
        let initPoints = [
            new Affine(this.trans + 0.5 * this.baseScale, this.trans + this.baseScale),
            new Affine(this.trans + 0.5 * this.baseScale, this.trans + 0.75 * this.baseScale)
        ]

        const MSet = [
            Mutation.compose(
                Mutation.compose(
                    Mutation.scale(0.75, initPoints[0]),
                    Mutation.rot(Math.PI/6, initPoints[0])
                ),
                Mutation.trans(new Affine(0, -0.25 * this.baseScale, true))
            ),
            Mutation.compose(
                Mutation.compose(
                    Mutation.scale(0.75, initPoints[0]),
                    Mutation.rot(-Math.PI/6, initPoints[0])
                ),
                Mutation.trans(new Affine(0, -0.25 * this.baseScale, true))
            )
        ]

        initPoints.push(Affine.transform(initPoints[1], MSet[0]))
        initPoints.push(initPoints[1])
        initPoints.push(Affine.transform(initPoints[1], MSet[1]))

        return {
            PSet: [initPoints],
            MSet,
            keep: true
        }
    }
    c_shape() {
        const initPoints = [
            new Affine(this.trans + 0.5 * this.baseScale, this.trans + this.baseScale),
            new Affine(this.trans + 0.75 * this.baseScale, this.trans + 0.75 * this.baseScale),
            new Affine(this.trans + this.baseScale, this.trans + this.baseScale)
        ]

        const MSet = [
            Mutation.image(initPoints[0], initPoints[1], initPoints[2], initPoints[0],
                new Affine(this.trans + 0.5 * this.baseScale, this.trans + 0.75 * this.baseScale),
            initPoints[1]),
            Mutation.image(initPoints[0], initPoints[1], initPoints[2], initPoints[1],
                new Affine(this.trans + this.baseScale, this.trans + 0.75 * this.baseScale),
            initPoints[2])
        ]

        return {
            PSet: [initPoints],
            MSet
        }
    }
    koch() {
        const initPoints = [
            new Affine(this.trans + 0.5 * this.baseScale, this.trans + this.baseScale),
            new Affine(this.trans + 0.5 * this.baseScale, this.trans + 0.75 * this.baseScale),
            new Affine(this.trans + 0.5 * this.baseScale, this.trans + 0.5 * this.baseScale),
            new Affine(this.trans + 0.5 * this.baseScale, this.trans + 0.25 * this.baseScale)
        ]

        const MSet = [
            Mutation.scale(1/3, initPoints[0]),
            Mutation.compose(
                Mutation.compose(
                    Mutation.scale(1/3, initPoints[0]),
                    Mutation.trans(new Affine(0, -0.25 * this.baseScale, true))
                ),
                Mutation.rot(Math.PI/3, initPoints[1])
            ),
            Mutation.compose(
                Mutation.compose(
                    Mutation.scale(1/3, initPoints[3]),
                    Mutation.trans(new Affine(0, 0.25 * this.baseScale, true))
                ),
                Mutation.rot(-Math.PI/3, initPoints[2])
            ),
            Mutation.scale(1/3, initPoints[3])
        ]
        
        return {
            PSet: [initPoints],
            MSet
        }
    }
    shrub() {
        let initPoints = [
            new Affine(this.trans + 0.5 * this.baseScale, this.trans + this.baseScale),
            new Affine(this.trans + 0.5 * this.baseScale, this.trans + 0.5 * this.baseScale),
            new Affine(this.trans + 0.5 * this.baseScale, this.trans)           
        ]

        const MSet = [
            Mutation.scale(0.5, initPoints[0]),
            Mutation.compose(
                Mutation.compose(
                    Mutation.scale(0.5, initPoints[0]),
                    Mutation.trans(new Affine(0, -0.5 * this.baseScale, true))
                ),
                Mutation.rot(Math.PI/4, initPoints[1])
            ),
            Mutation.compose(
                Mutation.scale(0.5, initPoints[0]),
                Mutation.trans(new Affine(0, -0.5 * this.baseScale, true))
            ),
            Mutation.compose(
                Mutation.compose(
                    Mutation.scale(0.5, initPoints[0]),
                    Mutation.trans(new Affine(0, -0.5 * this.baseScale, true))
                ),
                Mutation.rot(-Math.PI/4, initPoints[1])
            )
        ]

        initPoints.splice(2, 0, Affine.transform(
            initPoints[0], 
            Mutation.rot(Math.PI/4, initPoints[1])
        ))

        initPoints.push(Affine.transform(
            initPoints[3],
            Mutation.rot(-Math.PI/4, initPoints[1])
        ))

        return {
            PSet: [initPoints],
            MSet
        }        
    }
    transform(opts) {
        const names = opts.name.value.split('_')
        const ob1 = this[names[0]]()
        const ob2 = this[names[1]]()
        return {
            PSet: ob1.PSet,
            MSet: ob1.MSet.concat(ob2.MSet),
            keep: ob1.keep || false
        }
    }
    fern() {
        return {
            P0: new Affine(200, 200),
            MSet: [
                new Mutation(
                    [0, 0, 0], [0, 0.16, 0], [0, 0, 1]
                ),
                new Mutation(
                    [0.2, -0.26, 0], [0.23, 0.22, 1.6], [0, 0, 1]
                ),
                new Mutation(
                    [-0.15, 0.28, 0], [0.26, 0.24, 0.44], [0, 0, 1]
                ),
                new Mutation(
                    [0.85, 0.04, 0], [-0.04, 0.85, 1.6], [0, 0, 1]
                )
            ],
            Ps: [0.01, 0.07, 0.07, 0.85]
        }
    }
    helix() {
        return {
            P0: new Affine(300, 400),
            MSet: [
                Mutation.image(new Affine(376, 412), new Affine(526, 296), new Affine(348, 188),
                    new Affine(340, 381), new Affine(516, 329), new Affine(390, 191)),
                Mutation.image(new Affine(376, 412), new Affine(526, 296), new Affine(348, 188),
                    new Affine(432, 212), new Affine(498, 150), new Affine(462, 88))
            ],
            Ps: [0.9, 0.1]
        }
    }
    heart() {
        return {
            P0: new Affine(300, 400),
            MSet: [
                Mutation.image(new Affine(280, 165), new Affine(669, 165), new Affine(476, 424),
                    new Affine(280, 165), new Affine(476, 424), new Affine(314, 328)),
                Mutation.image(new Affine(280, 165), new Affine(669, 165), new Affine(476, 424),
                    new Affine(669, 165), new Affine(476, 424), new Affine(629, 328)),
                Mutation.image(new Affine(280, 165), new Affine(669, 165), new Affine(476, 424),
                    new Affine(280, 165), new Affine(476, 251), new Affine(379, 111)),
                Mutation.image(new Affine(280, 165), new Affine(669, 165), new Affine(476, 424),
                    new Affine(669, 165), new Affine(476, 251), new Affine(558, 111))
            ],
            Ps: [0.25, 0.25, 0.25, 0.25]
        }
    }

    julia({pixels, size, centerX, centerY, iter}) {
        let Z0, Z1, d = (+pixels / 2) | 0
        let C = new Complex(+centerX, +centerY)
        let ZSet = []
        for (let i = -d; i <= d; i++) {
            for (let j = -d; j <= d; j++) {
                Z0 = new Complex(i / d * +size, j / d * +size)
                let k = 0
                for (; k < +iter; k++) {
                    Z1 = Complex.add(Complex.multiply(Z0, Z0), C)
                    if (Z1.module() < 2){
                        Z0 = Z1
                    }
                    else break
                }
                ZSet.push(k)
            }
        }
        return ZSet
    }

    mandelbrot({pixels, size, distanceX, distanceY, iter}) {
        let Z0, Z1, C, d = (+pixels / 2) | 0
        let ZSet = []
        for (let i = -d; i <= d; i++) {
            for (let j = -d; j <= d; j++) {
                Z0 = new Complex(0, 0)
                C = new Complex(i / d * +size + +distanceX, j / d * +size + +distanceY)
                let k = 0
                for (; k < +iter; k++) {
                    Z1 = Complex.add(Complex.multiply(Z0, Z0), C)
                    if (Z1.module() < 2){
                        Z0 = Z1
                    }
                    else break
                }
                ZSet.push(k)
            }
        }
        return ZSet
    }
}

export default Maps