const path = require('path');

const DIST_PATH = path.resolve(__dirname, '..', 'dist');

const ES2020_OUT_DIR = path.resolve(DIST_PATH, 'es2020');
const ES2020_OUT_PATH = path.resolve(ES2020_OUT_DIR, 'onfmready.js');
const ES2020_DIST_PATH = path.resolve(DIST_PATH, 'onfmready.js');

const ES5_OUT_DIR = path.resolve(DIST_PATH, 'es5');
const ES5_OUT_PATH = path.resolve(ES5_OUT_DIR, 'onfmready.js');
const ES5_DIST_PATH = path.resolve(DIST_PATH, 'onfmready.es5.js');

const ES5_DELIM = {
  head: '/* #region Microsoft Internet Explorer 11 Support */',
  tail: '/* #endregion */'
};

module.exports = {
  ES2020_OUT_DIR,
  ES2020_OUT_PATH,
  ES2020_DIST_PATH,
  ES5_OUT_DIR,
  ES5_OUT_PATH,
  ES5_DIST_PATH,
  ES5_DELIM
};
