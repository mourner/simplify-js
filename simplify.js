(function(global, undefined) {
  "use strict";

  var undefinedStr = undefined + '',
      root = typeof exports !== undefinedStr ? exports : global;

  // to suit your point format, run search/replace for '.x' and '.y'
  // to switch to 3D, uncomment the lines in the next 2 functions
  // (configurability would draw significant performance overhead)


  function getSquareDistance(p1, p2) { // square distance between 2 points

    var dx = p1.x - p2.x,
      //dz = p1.z - p2.z,
        dy = p1.y - p2.y;

    return dx * dx +
      //dz * dz +
        dy * dy;
  }

  function getSquareSegmentDistance(p, p1, p2) { // square distance from a point to a segment

    var x = p1.x,
        y = p1.y,
      //z = p1.z,

        dx = p2.x - x,
        dy = p2.y - y,
      //dz = p2.z - z,

        t;

    if (dx !== 0 || dy !== 0) {

      t = ((p.x - x) * dx +
        //(p.z - z) * dz +
          (p.y - y) * dy) /
          (dx * dx +
            //dz * dz +
              dy * dy);

      if (t > 1) {
        x = p2.x;
        y = p2.y;
        //z = p2.z;

      } else if (t > 0) {
        x += dx * t;
        y += dy * t;
        //z += dz * t;
      }
    }

    dx = p.x - x;
    dy = p.y - y;
    //dz = p.z - z;

    return dx * dx +
      //dz * dz +
        dy * dy;
  }

  // the rest of the code doesn't care about the point format


  // radial distance simplification

  function simplifyRadialDist(points, sqTolerance) {

    var prevPoint = points[0],
        newPoints = [prevPoint],
        len = points.length,
        i = 0,
        point;

    for (; i < len; i++) {
      point = points[i];
      if (getSquareDistance(point, prevPoint) > sqTolerance) {
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

  function markPointsDP(points, sqTolerance) {

    var len = points.length,
        ArrayConstructor = typeof Uint8Array !== undefinedStr ? Uint8Array : Array,
        markers = new ArrayConstructor(len),
        first,
        last,
        stack = [0, len - 1],
        maxSqDist,
        i,
        sqDist,
        index;

    while (last = stack.pop()) {
      first = stack.pop();
      maxSqDist = 0;
      i = first + 1;
      index = 0;

      for (; i < last; i++) {
        sqDist = getSquareSegmentDistance(points[i], points[first], points[last]);

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

    return markers;
  }

  function simplifyDouglasPeucker(points, sqTolerance) {

    var len = points.length,
        markers = markPointsDP(points, sqTolerance),
        i = 0,
        newPoints = [];

    markers[0] = markers[len - 1] = 1;


    for (; i < len; i++) {
      if (markers[i]) {
        newPoints.push(points[i]);
      }
    }

    return newPoints;
  }


  root.simplify = function(points, tolerance, highQuality) {

    var sqTolerance = tolerance ? tolerance * tolerance : 1;

    return simplifyDouglasPeucker(//              Converts highQuality to 1 or 2
        simplifyRadialDist(points, sqTolerance / (!highQuality + 1))
        , sqTolerance);
  };

}(this));