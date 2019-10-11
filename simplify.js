/*
 (c) 2017, Vladimir Agafonkin
 Simplify.js, a high-performance JS polyline simplification library
 mourner.github.io/simplify-js
*/

(function () { 'use strict';

/**
 * Square distance between 2 points
 *
 * @param {Point} p1
 * @param {Point} p2
 * @return {{deltas: Point, dimensions: string[]}}
 */
function getDeltas(p1, p2) {
    var dimensions = Object.keys(p1);
    var deltas = dimensions.reduce(function(out, dim) {
        out[dim] = p1[dim] - p2[dim];
        return out;
    }, {});
    return {
        deltas: deltas,
        dimensions: dimensions
    };
}

/**
 * @param {Point} p1
 * @param {Point} p2
 * @return {{distance: number, deltas: Point, dimensions: string[]}}
 */
function getSqDist(p1, p2) {
    var deltaOut = getDeltas(p1, p2);
    var deltas = deltaOut.deltas;
    var dimensions = deltaOut.dimensions;

    var distance = dimensions.reduce(function(out, dimension) {
        return out + (deltas[dimension] * deltas[dimension]);
    }, 0);
    return {
        deltas: deltas,
        dimensions: dimensions,
        distance: distance
    };
}

/**
 * Square distance from a point to a segment
 *
 * @param {Point} p
 * @param {Point} p1
 * @param {Point} p2
 * @return {number}
 */
function getSqSegDist(p, p1, p2) {
    var sqDistOut = getSqDist(p2, p1);
    var segmentDeltas = sqDistOut.deltas;
    var segmentDistance = sqDistOut.distance;
    var dimensions = sqDistOut.dimensions;

    var hasNonZeroDelta = Object.values(segmentDeltas).some(function(d) {
        return d !== 0;
    });

    var refPoint;

    if (hasNonZeroDelta) {
        var deltas = getDeltas(p, p1).deltas;
        var cumulative = dimensions.reduce(function(sum, dimension) {
            return sum + (deltas[dimension] * segmentDeltas[dimension]);
        }, 0);
        var t = cumulative / segmentDistance;

        if (t > 1) {
            refPoint = p2;
        } else if (t > 0) {
            refPoint = dimensions.reduce(function(out, dim) {
                out[dim] = p1[dim] + (segmentDeltas[dim] * t);
                return out;
            }, {});
        }
    }

    return getSqDist(p, refPoint).distance;
}
// rest of the code doesn't care about point format

// basic distance-based simplification
function simplifyRadialDist(points, sqTolerance) {

    var prevPoint = points[0],
        newPoints = [prevPoint],
        point;

    for (var i = 1, len = points.length; i < len; i++) {
        point = points[i];

        if (getSqDist(point, prevPoint).distance > sqTolerance) {
            newPoints.push(point);
            prevPoint = point;
        }
    }

    if (prevPoint !== point) newPoints.push(point);

    return newPoints;
}

function simplifyDPStep(points, first, last, sqTolerance, simplified) {
    var maxSqDist = sqTolerance,
        index;

    for (var i = first + 1; i < last; i++) {
        var sqDist = getSqSegDist(points[i], points[first], points[last]);

        if (sqDist > maxSqDist) {
            index = i;
            maxSqDist = sqDist;
        }
    }

    if (maxSqDist > sqTolerance) {
        if (index - first > 1) simplifyDPStep(points, first, index, sqTolerance, simplified);
        simplified.push(points[index]);
        if (last - index > 1) simplifyDPStep(points, index, last, sqTolerance, simplified);
    }
}

// simplification using Ramer-Douglas-Peucker algorithm
function simplifyDouglasPeucker(points, sqTolerance) {
    var last = points.length - 1;

    var simplified = [points[0]];
    simplifyDPStep(points, 0, last, sqTolerance, simplified);
    simplified.push(points[last]);

    return simplified;
}

// both algorithms combined for awesome performance
function simplify(points, tolerance, highestQuality) {

    if (points.length <= 2) return points;

    var sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;

    points = highestQuality ? points : simplifyRadialDist(points, sqTolerance);
    points = simplifyDouglasPeucker(points, sqTolerance);

    return points;
}

// export as AMD module / Node module / browser or worker variable
if (typeof define === 'function' && define.amd) define(function() { return simplify; });
else if (typeof module !== 'undefined') {
    module.exports = simplify;
    module.exports.default = simplify;
} else if (typeof self !== 'undefined') self.simplify = simplify;
else window.simplify = simplify;

})();
