/*
 Copyright (c) 2012, Vladimir Agafonkin
 Simplify.js is a high-performance polyline simplification library.
 http://mourner.github.com/simplify-js/
*/

(function (global, undefined) {

	"use strict";


	// run search/replace for '.x' and '.y' to suit your point format
	// (its configurability would draw significant performance overhead)

	function getSquareDistance(p1, p2) { // square distance between 2 points

		var dx = p1.x - p2.x,
		    dy = p1.y - p2.y;

		return dx * dx + dy * dy;
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
			    (dx * dx + dy * dy);

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

		return dx * dx + dy * dy;
	}


	// replace previous functions with the following for 3D space

	/*
	function getSquareDistance(p1, p2) {

		var dx = p1.x - p2.x,
		    dy = p1.y - p2.y,
		    dz = p1.z - p2.z;

		return dx * dx + dy * dy + dz * dz;
	}

	function getSquareSegmentDistance(p, p1, p2) {

		var x = p1.x,
		    y = p1.y,
		    z = p1.z,

		    dx = p2.x - x,
		    dy = p2.y - y,
		    dz = p2.z - z,

		    t;

		if (dx !== 0 || dy !== 0) {

			t = ((p.x - x) * dx +
			     (p.y - y) * dy +
			     (p.z - z) * dz) /
			    (dx * dx + dy * dy + dz * dz);

			if (t > 1) {
				x = p2.x;
				y = p2.y;
				z = p2.z;

			} else if (t > 0) {
				x += dx * t;
				y += dy * t;
				z += dz * t;
			}
		}

		dx = p.x - x;
		dy = p.y - y;
		dz = p.z - z;

		return dx * dx + dy * dy + dz * dz;
	}
	*/

	// the rest of the code doesn't care for the point format


	// radial distance simplification

	function simplifyRadialDistance(points, sqTolerance) {

		var i,
		    len = points.length,
		    point,
		    getDistance = getSquareDistance,
		    prevPoint = points[0],
		    newPoints = [prevPoint];

		for (i = 1; i < len; i++) {
			point = points[i];

			if (getDistance(point, prevPoint) > sqTolerance) {
				newPoints.push(point);
				prevPoint = point;
			}
		}

		if (prevPoint !== point) {
			newPoints.push(point);
		}

		return newPoints;
	}


	// simplification using optimized Douglas-Peucker algorithm with recursion elimination

	function markPointsDouglasPeucker(points, markers, sqTolerance, first, last) {

		var maxSqDist,
		    i,
		    squareDistance,
		    getDistance = getSquareSegmentDistance,
		    index,
		    firstStack = [],
		    lastStack = [];

		while (last) {

			maxSqDist = 0;

			for (i = first + 1; i < last; i++) {
				squareDistance = getDistance(points[i], points[first], points[last]);

				if (squareDistance > maxSqDist) {
					index = i;
					maxSqDist = squareDistance;
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
	}

	function simplifyDouglasPeucker(points, sqTolerance) {

		var len = points.length,
		    ArrayConstructor = (typeof Uint8Array !== undefined + '' ? Uint8Array : Array),
		    markers = new ArrayConstructor(len),
		    i,
		    newPoints = [];

		markers[0] = markers[len - 1] = 1;

		markPointsDouglasPeucker(points, markers, sqTolerance, 0, len - 1);

		for (i = 0; i < len; i++) {
			if (markers[i]) {
				newPoints.push(points[i]);
			}
		}

		return newPoints;
	}


	var root = (typeof exports !== undefined + '' ? exports : global);

	root.simplify = function (points, tolerance, highQuality) {

		tolerance   = (tolerance   !== undefined ? tolerance   : 1);
		highQuality = (highQuality !== undefined ? highQuality : false);

		var sqTolerance = tolerance * tolerance;

		if (!highQuality) {
			points = simplifyRadialDistance(points, sqTolerance);
		}
		points = simplifyDouglasPeucker(points, sqTolerance);

		return points;
	};

}(this));