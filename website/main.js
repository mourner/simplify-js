(function () {

	function get(id) {
		return document.getElementById(id);
	}

	var canvas = get('canvas'),
		pointNumBefore = get('point-num-before'),
		toleranceVal = get('tolerance-val'),
		pointNumAfter = get('point-num-after'),
		pointNumTimes = get('point-num-times'),
		durationEl = get('duration'),
		qualityEl = get('quality');

	var tolerance = 0.8,
		highQuality = false;

	var ctx = canvas.getContext('2d');
	ctx.translate(-200, -100);

	ctx.strokeStyle = '#f53';
	ctx.lineWidth = 2;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';

	var pointsLen = points.length;

	pointNumBefore.innerHTML = pointsLen;

	function update() {

		ctx.clearRect(200, 100, 800, 400);

		var newPoints,
			start = typeof performance !== 'undefined' ? performance.now() : +new Date();

		newPoints = simplify(points, tolerance, highQuality);

		var ms = (typeof performance !== 'undefined' ? performance.now() : +new Date()) - start;

		durationEl.innerHTML = Math.round(ms * 100) / 100;

		var i, len, p,
		    newLen = newPoints.length;

		pointNumAfter.innerHTML = newLen;
		pointNumTimes.innerHTML = Math.round(pointsLen / newLen);
		toleranceVal.innerHTML = tolerance;

		ctx.beginPath();

		for (i = 0, len = newPoints.length; i < len; i++) {
			p = newPoints[i];
			ctx.lineTo(p.x, p.y);
		}

		ctx.stroke();
	}

	function onSliderChange(e) {
		tolerance = parseFloat(e.value);
		update();
	}

	fdSlider.createSlider({
		inp: get('tolerance'),
		step: '0.01',
		min: 0.10,
		max: 5,
		hideInput: true,
		callbacks: {
			change: [onSliderChange],
			create: [onSliderChange]
		}
	});

	qualityEl.onchange = function () {
		highQuality = qualityEl.checked;
		update();
	};

}());
