// make this whole thing into a class
function range(n: number) {
    const arr: any[] = []
    for (let i = 0; i < n; i++) {
        arr.push(i)
    }
    return arr
}

function ordinaryPoints(n: number) {
    const rangeArray = range(n)
    const arr: number[][] = []
    rangeArray.map(x => rangeArray.map(y => arr.push([x, y])))
    return arr
}

function pointsAtInfinity(n: number) {
    const pts = range(n)
    pts.push('inf')
    return pts
}

function allPoints(n: number) {
    const ordPts = ordinaryPoints(n)
    const ptsAtInf = pointsAtInfinity(n)
    for (const element of ptsAtInf) {
        ordPts.push(element)
    }
    return ordPts
}

function ordinaryLine(m: number, b: number, n: number) {
    const rangeArray = range(n)
    const line: number[][] = []
    rangeArray.map(x => line.push([x, (m * x + b) % n]))
    return line
}

function verticalLine(x: number, n: number) {
    const rangeArray = range(n) 
    const line: (number[]|string)[] = []
    rangeArray.map(y => line.push([x, y]))
    line.push('inf')
    return line
}

function lineAtInfinity(n: number) {
    return pointsAtInfinity(n)
}

function allLines(n: number){
    const rangeArray = range(n)
    const lines = []
    rangeArray.map(m => rangeArray.map(b => lines.push(ordinaryLine(m, b, n))))

    rangeArray.map(x => lines.push(verticalLine(x, n)))

    lines.push(lineAtInfinity(n))

    return lines
}
export { ordinaryPoints, pointsAtInfinity, allPoints, allLines }