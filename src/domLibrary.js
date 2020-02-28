const { post, patch } = require('./http');
const { kyurl, apiUrl } = require('./helpers');
const { TypeEnum } = require('./constants');
const auth = require('./auth');
const JwtHelper = require('./jwt');
const ee = require('./eventBus');

const submitEntry = () => {
    const body = {
        title: document.getElementById('title').value,
        body: document.getElementById('body').value,
        type: +document.getElementById('type').value,
        tags: []
    }
    post(kyurl(), body);
}

const updateStatus = (id, direction) => {
    patch(kyurl(`${direction}/${id}`), {}, 
        data => ee.emit('status', data, direction)
    );
}

const updateEntry = (id) => {
    const body = {
        id: id,
        title: document.getElementById(`title:${id}`).value,
        body: document.getElementById(`body:${id}`).value,
        type: +document.getElementById(`type:${id}`).value,
        tags: []
    }
    patch(kyurl(), body);
}

const openLink = (e, id) => {
    var type = +document.getElementById(`type:${id}`).value;
    if (e.ctrlKey && type === TypeEnum.link) {
        var link = document.getElementById(`body:${id}`).value;
        window.open(link);
    }
}

const login = (event) => {
    if (event) {
        event.preventDefault();
    }
    auth.login();
}

const logout = () => auth.logout();

function DomLibrary() { }
DomLibrary.prototype.submitEntry = submitEntry;
DomLibrary.prototype.updateStatus = updateStatus;
DomLibrary.prototype.updateEntry = updateEntry;
DomLibrary.prototype.openLink = openLink;
DomLibrary.prototype.login = login;
DomLibrary.prototype.logout = logout;
module.exports = DomLibrary;