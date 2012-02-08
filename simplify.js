(function(global, undefined) {
  "use strict";


  function sqr(x) {
    return Math.pow(x, 2);
  }


  // modify the following 2 functions to suit your point format and/or switch to 3D points

  function squareDistance(p1, p2) { // square distance between 2 points
    var distance = sqr(p1.x - p2.x) + sqr(p1.y - p2.y);

    return p1.z !== undefined ? distance + sqr(p1.z - p2.z) : distance;
  }

  function squareSegmentDistance(p, p1, p2) { // square distance from a point to a segment

    var isZ = p.z !== undefined,
        x = p1.x,
        y = p1.y,
        z = p1.z,

        dx = p2.x - x,
        dy = p2.y - y,
        dz = isZ && p2.z - z,

        temp, temp2;


    if (dx !== 0 || dy !== 0 || +dz !== 0) {
      temp = ((p.x - x) * dx + (p.y - y) * dy + isZ && (p.z - z) * dz) /
          (sqr(dx) + sqr(dy) + isZ && sqr(dz));

      if (temp > 1) {
        x = p2.x;
        y = p2.y;
        z = p2.z;

      } else if (temp > 0) {
        x += dx * temp;
        y += dy * temp;
        z += dz * temp;
      }
    }

    temp = sqr(p.x - x) + sqr(p.y - y);

    return isZ ? temp + sqr(p.z - z) : temp;
  }

  // the rest of the code doesn't care about the point format


  // radial distance simplification

  function simplifyRadialDist(points, sqTolerance) {

    var prevPoint = points[0],
        newPoints = [prevPoint],
        len = points.length,
        i,
        point;

    for (i = 1; i < len; i += 1) {
      point = points[i];
      if (squareDistance(point, prevPoint) > sqTolerance) {
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
      sqDist = squareSegmentDistance(points[i], points[first], points[last]);

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

  root.simplify = function(points, tolerance) {

    tolerance = typeof tolerance !== 'undefined' ? tolerance : 1;

    var sqTolerance = tolerance * tolerance;

    points = simplifyRadialDist(points, sqTolerance);
    points = simplifyDouglasPeucker(points, sqTolerance);

    return points;
  };

}(this));