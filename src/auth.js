const JwtHelper = require('./jwt');
const html = require('./templates');
const { toNodes } = require('./helpers');
const ee = require('./eventBus');
const { post } = require('./http');
const { apiUrl } = require('./helpers');
let page = {};

const authenticate = () => {
    const token = JwtHelper.getToken();
    if (token && !JwtHelper.isExpired(token)) {
        ee.emit('ready');
    } else {
        if (token) {
            JwtHelper.removeToken();
        }
        razePage();
    }
}

exports.authenticate = authenticate;

const login = () => {
    var body ={
        password: document.getElementById('password').value
    };
    post(apiUrl('api/auth'), body, (data) => {
        JwtHelper.storeToken(data.token);
        restorePage();
    });
}

exports.login = login;

const logout = () => {
    JwtHelper.removeToken();
    razePage();
}

exports.logout = logout;

const razePage = () => {
    const body = document.getElementById('body');
    page = body.innerHTML;
    while(body.firstChild) {
        body.firstChild.remove();
    }
    const loginPage = toNodes(html.loginPage())[0];
    body.appendChild(loginPage);
}

const restorePage = () => {
    const body = document.getElementById('body');
    body.innerHTML = page;
    ee.emit('ready');
}