import { Suite } from 'benchmark';
import simplify from '../index.js';

import points from '../test/fixtures/1k.json';

console.log('Benchmarking simplify on ' + points.length + ' points...');

new Suite()
.add('simplify (HQ)', function() {
    simplify(points, 1, true);
})
.add('simplify', function() {
    simplify(points, 1, false);
})
.on('cycle', function(event) {
    console.log(String(event.target));
})
.run();
