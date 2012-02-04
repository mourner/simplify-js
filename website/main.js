(function () {

	function get(id) {
		return document.getElementById(id);
	}

	var canvas = get('canvas'),
		pointNumBefore = get('point-num-before'),
		toleranceVal = get('tolerance-val'),
		pointNumAfter = get('point-num-after');

	var ctx = canvas.getContext('2d');
	ctx.translate(-200, -100);

	ctx.strokeStyle = '#f53';
	ctx.lineWidth = 2;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';

	var pointsLen = points.length;

	pointNumBefore.innerHTML = pointsLen;

	function update(tolerance) {

		ctx.clearRect(200, 100, 800, 400);

		var i, len, p,
		    newPoints = simplify(points, tolerance),
		    newLen = newPoints.length;

		pointNumAfter.innerHTML = '<em>' + newLen + '</em> points ' + ' (~<em>' + Math.round(pointsLen / newLen) + '</em> times less)';
		toleranceVal.innerHTML = tolerance;

		ctx.beginPath();

		for (i = 0, len = newPoints.length; i < len; i++) {
			p = newPoints[i];
			ctx.lineTo(p.x, p.y);
		}

		ctx.stroke();
	}

	function onSliderChange(e) {
		var tolerance = parseFloat(e.value);
		update(tolerance);
	}

	fdSlider.createSlider({
		inp: get('tolerance'),
		step: '0.01',
		min: 0.01,
		max: 5,
		value: 0.01,
		hideInput: true,
		callbacks: {
			change: [onSliderChange],
			create: [onSliderChange]
		}
	});

}());