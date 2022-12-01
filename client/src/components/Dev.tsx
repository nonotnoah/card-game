import * as React from 'react';
import { ordinaryPoints, pointsAtInfinity, allPoints, allLines} from '../utils/deck'

function Dev() {
    console.log(ordinaryPoints(7))
    console.log(pointsAtInfinity(7))
    console.log(allPoints(7))
    console.log(allLines(7))

    return (
        <h1>Test</h1>
    )
}

export default Dev