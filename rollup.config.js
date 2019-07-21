import resolve from 'rollup-plugin-node-resolve';
import buble from 'rollup-plugin-buble';
import {terser} from 'rollup-plugin-terser'

const output = (file, plugins) => ({
    input: 'index.js',
    output: {
        name: 'simplify',
        format: 'umd',
        file
    },
    plugins
});

export default [
    output('simplify.js', [resolve(), buble()]),
    output('simplify.min.js', [resolve(), terser(), buble()])
];
