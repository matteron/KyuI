var config = require('./config');
var { StatusNames, StatusDirection } = require('./constants');

const toNodes = (html) => new DOMParser().parseFromString(html, 'text/html').body.childNodes;
exports.toNodes = toNodes;

const baseUrl = `${config.url}`;
const apiUrl = (endpoint) => baseUrl + endpoint;
const kyurl = (endpoint) => baseUrl + 'api/kyu/' + (endpoint ? endpoint : '');

exports.apiUrl = apiUrl;
exports.kyurl = kyurl;

const loopObject = (array, callback) => {
    return array.reduce((acc, cur) => {
        acc[cur] = callback(cur);
        return acc;
    }, {});
}
exports.loopObject = loopObject;

const filterEntries = (entries) => {
    const filtered = loopObject(StatusNames, s => []);
    entries.forEach(e => {
        filtered[e.status.name.toLowerCase()].push(e);
    });
    return filtered;
}
exports.filterEntries = filterEntries;

const directionOffset = (direction) => 
    direction === StatusDirection.elevate
        ? 1
        : direction === StatusDirection.demote
            ? -1
            : 0;
exports.directionOffset = directionOffset;