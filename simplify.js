(function(global, undefined) {
  "use strict";

  var undefinedStr = 'undefined';

  function sqr(x) {
    return x * x;
  }

  function squareDistance(p1, p2) { // square distance between 2 points

    return  sqr(p1.x - p2.x) + sqr(p1.y - p2.y);
  }

  function squareDistance3d(p1, p2) { // square distance between 3 points

    return sqr(p1.x - p2.x) + sqr(p1.y - p2.y) + sqr(p1.z - p2.z);
  }

  function squareSegmentDistance(p, p1, p2) { // square distance from a point to a segment

    var x = p1.x,
        y = p1.y,

        dx = p2.x - x,
        dy = p2.y - y,

        temp;

    if (dx !== 0 || dy !== 0) {
      temp = ((p.x - x) * dx + (p.y - y) * dy ) /
          (sqr(dx) + sqr(dy));

      if (temp > 1) {
        x = p2.x;
        y = p2.y;

      } else if (temp > 0) {
        x += dx * temp;
        y += dy * temp;
      }
    }

    return sqr(p.x - x) + sqr(p.y - y);
  }

  function squareSegmentDistance3d(p, p1, p2) { // square distance from a point to a segment

    var x = p1.x,
        y = p1.y,
        z = p1.z,

        dx = p2.x - x,
        dy = p2.y - y,
        dz = p2.z - z,

        temp;

    if (dx !== 0 || dy !== 0 || dz !== 0) {
      temp = ((p.x - x) * dx + (p.y - y) * dy + (p.z - z) * dz) /
          (sqr(dx) + sqr(dy) + sqr(dz));

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

    return sqr(p.x - x) + sqr(p.y - y) + sqr(p.z - z);
  }

  // the rest of the code doesn't care about the point format


  // radial distance simplification

  function simplifyRadialDist(points, sqTolerance) {

    var prevPoint = points[0],
        newPoints = [prevPoint],
        len = points.length,
        i = 0,
        point,
        squareDistanceFn = prevPoint.z === undefined ? squareDistance : squareDistance3d;

    while (++i < len) {
      point = points[i];
      if (squareDistanceFn(point, prevPoint) > sqTolerance) {
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
        i = first,
        sqDist,
        index,
        squareSegmentDistanceFn = points[0].z === undefined ? squareSegmentDistance : squareSegmentDistance3d;

    while (++i < last) {
      sqDist = squareSegmentDistanceFn(points[i], points[first], points[last]);

      if (sqDist > maxSqDist) {
        index = i;
        maxSqDist = sqDist;
      }
    }

    if (maxSqDist > sqTolerance) {
      markers[index] = true;

      //TODO rewrite without recursion. Should be done by loops
      markPointsDP(points, markers, sqTolerance, first, index);
      markPointsDP(points, markers, sqTolerance, index, last);
    }
  }

  function simplifyDouglasPeucker(points, sqTolerance) {

    var len = points.length,
        i = -1,
        ArrayConstructor = typeof Uint8Array !== undefinedStr ? Uint8Array : Array,
        markers = new ArrayConstructor(len),
        newPoints = [];

    markers[0] = markers[len - 1] = true;

    markPointsDP(points, markers, sqTolerance, 0, len - 1);

    while (++i < len) {
      if (markers[i]) {
        newPoints.push(points[i]);
      }
    }

    return newPoints;
  }


  (typeof exports !== undefinedStr ? exports : global)
      .simplify = function(points, tolerance) {
    tolerance = sqr(tolerance || 1);

    return simplifyDouglasPeucker(
        simplifyRadialDist(points, tolerance),
        tolerance);
  };

}(this));