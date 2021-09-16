const fs = require('fs');
const {
  ES2020_OUT_PATH,
  ES2020_DIST_PATH,
  ES2020_OUT_DIR,
  ES5_OUT_PATH,
  ES5_DIST_PATH,
  ES5_OUT_DIR
} = require('./paths.config');

(() => {
  if (fs.existsSync(ES2020_OUT_PATH))
    fs.renameSync(ES2020_OUT_PATH, ES2020_DIST_PATH);
  if (fs.existsSync(ES5_OUT_PATH)) fs.renameSync(ES5_OUT_PATH, ES5_DIST_PATH);

  if (fs.existsSync(ES2020_OUT_DIR)) fs.rmdirSync(ES2020_OUT_DIR);
  if (fs.existsSync(ES5_OUT_DIR)) fs.rmdirSync(ES5_OUT_DIR);
})();
