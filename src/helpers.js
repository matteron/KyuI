const toNodes = (html) => new DOMParser().parseFromString(html, 'text/html').body.childNodes;
exports.toNodes = toNodes;