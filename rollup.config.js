import { terser } from 'rollup-plugin-terser';

export default {
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
