const urlPrefix = url => {
  const prefix = 'http://';
  if (url.substr(0, prefix.length) !== prefix) {
    return prefix + url;
  } else {
    return url;
  }
};

module.exports = urlPrefix;
