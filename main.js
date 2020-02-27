const { toNodes, filterEntries, loopObject, directionOffset } = require('./src/helpers');
const { html } = require('./src/templates');
const api = require('./src/api');
const { StatusNames } = require('./src/constants');
const ee = require('./src/eventBus');

module.exports = require('./src/domLibrary');

let typeData = {
    raw: [],
    html: '',
    nodes: []
}
let sorted = {};
let selectors = {
    types: {},
    sections: {}
};

const main = () => {
    selectors = buildSelectors();
    api.types(data =>{
        typeData = parseTypeData(data);
        renderTypes();
    });
    api.entries(data => {
        sorted = filterEntries(data);
        renderEntries();
    });

    ee.on('status', updateStatus);
}

const buildSelectors = () => {
    return {
        types: document.getElementById('type'),
        sections: loopObject(StatusNames, (s) => document.getElementById(s))
    }
}

const parseTypeData = (data) => {
    const template = html.typeOptions(data);
    return {
        raw: data,
        html: template,
        nodes: toNodes(template) 
    }
}

const renderTypes = () => typeData.nodes.forEach(n => selectors.types.appendChild(n));

const renderEntries = () => {
    const raws = loopObject(StatusNames, (s) => html.entries(sorted[s], typeData.raw));
    const nodes = loopObject(StatusNames, (s) => toNodes(raws[s]));
    StatusNames.forEach(s => {
        while(selectors.sections[s].firstChild) {
            selectors.sections[s].firstChild.remove();
        }
        nodes[s].forEach(n => selectors.sections[s].appendChild(n));
    });
}

const updateStatus = (entry, direction) => {
    const offset = directionOffset(direction);
    const status = StatusNames[entry.status.id - offset - 1];
    const index = sorted[status].findIndex(e => e.id === entry.id);
    sorted[status].splice(index, 1);
    sorted[entry.status.name.toLowerCase()].push(entry);
    renderEntries();
}

document.addEventListener('readystatechange', () => {
    if (document.readyState === "complete") {
        main();
    }
});