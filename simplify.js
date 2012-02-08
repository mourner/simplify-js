(function (global) {
	"use strict";


	// modify the following 2 functions to suit your point format and/or switch to 3D points

	function sqDist(p1, p2) { // square distance between 2 points

		var dx = p1.x - p2.x,
		    // dz = p1.z - p2.z,
		    dy = p1.y - p2.y;

		// return dx * dx + dy * dy + dz * dz;
		return dx * dx + dy * dy;
	}

	function sqSegDist(p, p1, p2) { // square distance from a point to a segment

		var x  = p1.x,
		    y  = p1.y,
		    // z = p1.z,

		    dx = p2.x - x,
		    dy = p2.y - y,
		    // dz = p2.z - z,

		    t;

		if (dx !== 0 || dy !== 0) {
			t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);
			// t = ((p.x - x) * dx + (p.y - y) * dy + (p.z - z) * dz) /
			// 		(dx * dx + dy * dy + dz * dz);

			if (t > 1) {
				x = p2.x;
				y = p2.y;
				// z = p2.z;

			} else if (t > 0) {
				x += dx * t;
				y += dy * t;
				// z += dz * t;
			}
		}

		dx = p.x - x;
		dy = p.y - y;
		// dz = p.z - z;

		// return dx * dx + dy * dy + dz * dz;
		return dx * dx + dy * dy;
	}

	// the rest of the code doesn't care for the point format


	// radial distance simplification

	function simplifyRadialDist(points, sqTolerance) {

		var prevPoint = points[0],
			newPoints = [prevPoint],
		    len = points.length,
		    i,
		    point;

		for (i = 1; i < len; i += 1) {
			point = points[i];
			if (sqDist(point, prevPoint) > sqTolerance) {
				newPoints.push(point);
				prevPoint = point;
			}
		}

		if (prevPoint !== point) {
			newPoints.push(point);
		}

		return newPoints;
	}


	// simplification using optimized Douglas-Peucker algorithm

	function markPointsDP(points, markers, sqTolerance, first, last) {

		var maxSqDist = 0,
		    i,
		    sqDist,
		    index;

		for (i = first + 1; i < last; i += 1) {
			sqDist = sqSegDist(points[i], points[first], points[last]);

			if (sqDist > maxSqDist) {
				index = i;
				maxSqDist = sqDist;
			}
		}

		if (maxSqDist > sqTolerance) {
			markers[index] = 1;

			markPointsDP(points, markers, sqTolerance, first, index);
			markPointsDP(points, markers, sqTolerance, index, last);
		}
	}

	function simplifyDouglasPeucker(points, sqTolerance) {

		var len = points.length,
		    ArrayConstructor = typeof Uint8Array !== 'undefined' ? Uint8Array : Array,
		    markers = new ArrayConstructor(len),
		    i,
		    newPoints = [];

		markers[0] = markers[len - 1] = 1;

		markPointsDP(points, markers, sqTolerance, 0, len - 1);

		for (i = 0; i < len; i += 1) {
			if (markers[i]) {
				newPoints.push(points[i]);
			}
		}

		return newPoints;
	}


	var root = (typeof exports !== 'undefined' ? exports : global);

	root.simplify = function (points, tolerance) {

		tolerance = typeof tolerance !== 'undefined' ? tolerance : 1;

		var sqTolerance = tolerance * tolerance;

		points = simplifyRadialDist(points, sqTolerance);
		points = simplifyDouglasPeucker(points, sqTolerance);

		return points;
	};

}(this));