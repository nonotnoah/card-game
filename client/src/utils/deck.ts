// why doesn't this work
// type SpecialArray = (number | number[] | string)[]
type SpecialArray = any[]

class Deck {
    rangeArray: SpecialArray = []
    nValue: number
    constructor(n: number) {
        this.rangeArray = this.range(n)
        this.nValue = n
    }

    range(n: number = this.nValue) {
        const arr: SpecialArray = []
        for (let i = 0; i < n; i++) {
            arr.push(i)
        }
        return arr
    }

    ordinaryPoints(n: number = this.nValue) {
        const arr: SpecialArray = []
        this.rangeArray.map(x => this.rangeArray.map(y => arr.push([x, y])))
        return arr
    }

    pointsAtInfinity(n: number = this.nValue) {
        const pts = [...this.rangeArray]
        pts.push('inf')
        return pts
    }

    allPoints(n: number = this.nValue) {
        const ordPts = this.ordinaryPoints(n)
        const ptsAtInf = this.pointsAtInfinity(n)
        for (const element of ptsAtInf) {
            ordPts.push(element)
        }
        return ordPts
    }

    ordinaryLine(m: number, b: number, n: number = this.nValue) {
        const line: number[][] = []
        this.rangeArray.map(x => line.push([x, (m * x + b) % n]))
        return line
    }

    verticalLine(x: number, n: number = this.nValue) {
        const line: (number[] | string)[] = []
        this.rangeArray.map(y => line.push([x, y]))
        line.push('inf')
        return line
    }

    lineAtInfinity(n: number = this.nValue) {
        return this.pointsAtInfinity(n)
    }

    allLines(n: number = this.nValue) {
        const lines = []
        this.rangeArray.map(m => this.rangeArray.map(b => lines.push(this.ordinaryLine(m, b, n))))
        this.rangeArray.map(x => lines.push(this.verticalLine(x, n)))
        lines.push(this.lineAtInfinity(n))
        return lines
    }

    makeDeck(n: number = this.nValue, imgs: string[]) {
        const points = this.allPoints(n)

        const mapping = new Map()

        // iterate through points[] and imgs[]
        points.forEach((point, index) => {
            const img = imgs[index]
            mapping.set(point, img)
        })

        // loops through lines which contain points. 
        // loops those points onto the map's identical points
        // appends value of the point key (the picture) onto card array
        const mappingKeys = Array.from(mapping.keys())
        // console.log(mappingKeys[0])
        const firstAnimal = mapping.get(mappingKeys[0])
        // console.log(firstAnimal)
        const lines: any[] = []
        const allLines = this.allLines(n)
        const firstLine = allLines[0]
        // console.log(mapping.get(firstLine[0]))
        // console.log(mapping.get([ 0, 0 ]))
        // console.log(allLines)
        for (const line of allLines) {
            const card: any[] = []
            // console.log(line)
            line.map(point => {
                // console.log(point)
                // console.log(mapping.get(point))
                card.push(mapping.get(point))
            })
            lines.push(card)
        }
        // console.log(lines)
    }
}

export { Deck }