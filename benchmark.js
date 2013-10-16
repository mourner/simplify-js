var Benchmark = require('benchmark').Benchmark;
var points = require('./website/test-data');

var suite = new Benchmark.Suite;

// add tests
suite
.add('original', function () {
    original(points, 0.8);
})
// add listeners
.on('cycle', function(event) {
    console.log(String(event.target));
})
.on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
})
// run
.run();


function original(points, sqTolerance) {

    var len = points.length,
        MarkerArray = (typeof Uint8Array !== undefined + '') ? Uint8Array : Array,
        markers = new MarkerArray(len),

        first = 0,
        last  = len - 1,

        firstStack = [],
        lastStack  = [],
        newPoints  = [],

        i, maxSqDist, sqDist, index;

    markers[first] = markers[last] = 1;

    while (last) {

        maxSqDist = 0;

        for (i = first + 1; i < last; i++) {
            sqDist = getSquareSegmentDistance(points[i], points[first], points[last]);

            if (sqDist > maxSqDist) {
                index = i;
                maxSqDist = sqDist;
            }
        }

        if (maxSqDist > sqTolerance) {
            markers[index] = 1;

            firstStack.push(first);
            lastStack.push(index);

            firstStack.push(index);
            lastStack.push(last);
        }

        first = firstStack.pop();
        last = lastStack.pop();
    }

    for (i = 0; i < len; i++) {
        if (markers[i]) {
            newPoints.push(points[i]);
        }
    }

    return newPoints;
}


function getSquareDistance(p1, p2) { // square distance between 2 points

    var dx = p1.x - p2.x,
        dy = p1.y - p2.y;

    return dx * dx +
           dy * dy;
}

function getSquareSegmentDistance(p, p1, p2) { // square distance from a point to a segment

    var x = p1.x,
        y = p1.y,

        dx = p2.x - x,
        dy = p2.y - y,

        t;

    if (dx !== 0 || dy !== 0) {

        t = ((p.x - x) * dx +
             (p.y - y) * dy) /
                (dx * dx +
                 dy * dy);

        if (t > 1) {
            x = p2.x;
            y = p2.y;

        } else if (t > 0) {
            x += dx * t;
            y += dy * t;
        }
    }

    dx = p.x - x;
    dy = p.y - y;

    return dx * dx +
           dy * dy;
}
