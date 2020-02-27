const { get, post } = require('./http');
const { apiUrl, kyurl } = require('./helpers');

const fetchTypes = (callback) => get(apiUrl('entryType'), callback);

const fetchEntries = (callback) => get(kyurl(), callback);

module.exports = {
    types: fetchTypes,
    entries: fetchEntries,
};