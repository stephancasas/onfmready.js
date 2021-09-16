const fs = require('fs');
const { ES2020_OUT_PATH, ES5_DELIM } = require('./paths.config');
const { str2regex } = require('./util');

(() => {
  const es2020Text = fs.readFileSync(ES2020_OUT_PATH, { encoding: 'utf-8' });

  const replaced = es2020Text.replace(
    new RegExp(
      `${str2regex(ES5_DELIM.head)}.*${str2regex(ES5_DELIM.tail)}`,
      'gis'
    ),
    ''
  );

  fs.writeFileSync(ES2020_OUT_PATH, replaced, { encoding: 'utf-8' });
})();
