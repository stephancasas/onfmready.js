const str2regex = (string) => {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

module.exports = { str2regex };
