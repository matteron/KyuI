const { get, post } = require('./src/http.js');
const { toNodes } = require('./src/helpers.js');
const { html } = require('./src/templates');

const workPort = 44306;
const macPort = 5001;
const baseUrl = `https://localhost:${macPort}/`;
const apiUrl = (endpoint) => baseUrl + endpoint;
const kyurl = (endpoint) => baseUrl + 'api/kyu/' + (endpoint ? endpoint : '');

const main = () => {
    setupEvents();
    fetchTypes();
    fetchEntries();
}

const setupEvents = () => {
    document.getElementById('submitEntry').addEventListener('click', submitEntry);
}

const fetchTypes = () => {
    get(apiUrl('entryType'),
        (data) => populateTypes(data),
        (error) => console.error('Unable to fetch types')
    );
}

const populateTypes = (types) => {
    const selector = document.getElementById('type');

    const raw = html.typeOptions(types);
    const nodes = toNodes(raw);
    nodes.forEach(node => selector.appendChild(node));
}

const fetchEntries = () => {
    get(kyurl(),
        (data) => populateEntries(data),
        (error) => console.error('Unable to fetch entries')
    );
}

const populateEntries = (entries) => {
    const selector = document.getElementById('pending');
    const raw = html.entries(entries);
    const nodes = toNodes(raw);

    nodes.forEach(node => selector.appendChild(node));
}

const submitEntry = () => {
    const body = {
        title: document.getElementById('title').value,
        body: document.getElementById('body').value,
        type: +document.getElementById('type').value,
        tags: []
    }

    post(kyurl(), body,
        data => console.log(data),
        error => console.error('Unable to submit entry.')
    );
}

document.addEventListener('readystatechange', function() {
    if (document.readyState === "complete") {
        main();
    }
});