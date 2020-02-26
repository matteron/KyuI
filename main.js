const {tags, attr} = require('haipa')();
const { div, option } = tags;
const { value } = attr;

const baseUrl = 'https://localhost:44306/';
const apiUrl = (endpoint) => baseUrl + endpoint;

const main = () => {
    fetchTypes();
    fetchEntries();
}

const httpReq = (type, url, callback) => {
    var request = new XMLHttpRequest();
    request.open(type, url, true);
    request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
            var data = JSON.parse(this.response);
            callback(data);
        } else {
            console.error(type + ' request failed.  Code:' + request.status);
        }
    }
    request.send();
}

const getReq = (url, callback) => {
    httpReq('GET', url, callback);
}

const toNodes = (html) => new DOMParser().parseFromString(html, 'text/html').body.childNodes;

const fetchTypes = () => {
    getReq(apiUrl('entryType'), (data) => {
        populateTypes(data);    
    });
}

const populateTypes = (types) => {
    const selector = document.getElementById('type');

    const html = types.reduce((acc, cur) => acc + '\n' + option([value(cur.id)], [cur.name]), option([value``], []));
    const nodes = toNodes(html);
    nodes.forEach(node => selector.appendChild(node));
}

const fetchEntries = () => {
    getReq(apiUrl('entry'), (data) => {
        console.log(data);
    })
}

main();