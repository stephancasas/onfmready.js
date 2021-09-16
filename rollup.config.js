import { terser } from 'rollup-plugin-terser';
import * as fs from 'fs';

const ES2020_BUILD = {
  input: './dist/onfmready.js',
  output: {
    file: './dist/onfmready.min.js',
    format: 'umd'
  },
  plugins: [
    terser({
      output: { comments: false }
    })
  ]
};

const ES5_BUILD = {
  input: './dist/onfmready.es5.js',
  output: {
    file: './dist/onfmready.es5.min.js',
    format: 'umd'
  },
  plugins: [
    terser({
      output: { comments: false }
    })
  ]
};

const BUILD = [];

if (fs.existsSync(ES2020_BUILD.input)) BUILD.push(ES2020_BUILD);
if (fs.existsSync(ES5_BUILD.input)) BUILD.push(ES5_BUILD);

export default BUILD;
