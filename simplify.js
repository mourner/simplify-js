(function(global, undefined) {
  "use strict";

  var undefinedStr = undefined + '';

  // modify the following 2 functions to suit your point format and/or switch to 3D points

  function squareDistance(p1, p2) { // square distance between 2 points

    var dx = p1.x - p2.x,
        dy = p1.y - p2.y;

    return dx * dx + dy * dy;
  }

  function squareDistance3D(p1, p2) { // square distance between 2 points

    var dx = p1.x - p2.x,
        dy = p1.y - p2.y,
        dz = p1.z - p2.z;

    return dx * dx + dy * dy + dz * dz;
  }

  function squareSegmentDistance(p, p1, p2) { // square distance from a point to a segment

    var x = p1.x,
        y = p1.y,

        dx = p2.x - x,
        dy = p2.y - y,

        t;

    if (dx !== 0 || dy !== 0) {
      t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);

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

  function squareSegmentDistance3D(p, p1, p2) { // square distance from a point to a segment

    var x = p1.x,
        y = p1.y,
        z = p1.z,

        dx = p2.x - x,
        dy = p2.y - y,
        dz = p2.z - z,

        t;

    if (dx !== 0 || dy !== 0 || dz !== 0) {
      t = ((p.x - x) * dx + (p.y - y) * dy + (p.z - z) * dz) /
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

  // the rest of the code doesn't care about the point format


  // radial distance simplification

  function simplifyRadialDist(points, sqTolerance) {

    var prevPoint = points[0],
        newPoints = [prevPoint],
        len = points.length,
        i = 0,
        point,
        squareDistanceFn = prevPoint.z === undefined ? squareDistance : squareDistance3D;

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

  function markPointsDP(points, markers, sqTolerance) {

    var squareSegmentDistanceFn = points[0].z === undefined ? squareSegmentDistance : squareSegmentDistance3D,
        first,
        last,
        stack = [0, points.length - 1],
        maxSqDist,
        i,
        sqDist,
        index;
    while (last = stack.pop()) {
      first = stack.pop();
      maxSqDist = 0;
      i = first;
      index = 0;

      while (++i < last) {
        sqDist = squareSegmentDistanceFn(points[i], points[first], points[last]);

        if (sqDist > maxSqDist) {
          index = i;
          maxSqDist = sqDist;
        }
      }
      if (maxSqDist > sqTolerance) {
        markers[index] = 1;
        stack.push(index);
        stack.push(last);
        stack.push(first);
        stack.push(index);
      }
    }

  }

  function simplifyDouglasPeucker(points, sqTolerance) {

    var len = points.length,
        ArrayConstructor = typeof Uint8Array !== undefinedStr ? Uint8Array : Array,
        markers = new ArrayConstructor(len),
        i = -1,
        newPoints = [];

    markers[0] = markers[len - 1] = 1;

    markPointsDP(points, markers, sqTolerance);

    while (++i < len) {
      if (markers[i]) {
        newPoints.push(points[i]);
      }
    }

    return newPoints;
  }


  (typeof exports !== undefinedStr ? exports : global)
      .simplify = function(points, tolerance) {

    var sqTolerance = tolerance ? tolerance * tolerance : 1;

    return simplifyDouglasPeucker(
        simplifyRadialDist(points, sqTolerance)
        , sqTolerance);
  };

}(this));