const JwtHelper = require('./jwt');

const request = (url, options, successFunc, errorFunc) => {
    fetch(url, options).then((response) => {
        if (!response.ok) {
            throw new Error(response);
        }
        return response.json();
    }).then(successFunc)
    .catch(errorFunc ? errorFunc : console.error);
};

const requestTypes = {
    get: 'GET',
    post: 'POST',
    patch: 'PATCH',
    delete: 'DELETE'
}

const jsonOptions = (type, body) => ({
    method: type,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + JwtHelper.getToken()
    },
    body: JSON.stringify(body)
});

/**
 * 
 * @param {string} url 
 * @param {function} successFunc 
 * @param {function} errorFunc 
 */
const get = (url, successFunc, errorFunc) => {
    const options = jsonOptions(requestTypes.get);
    request(url, options, successFunc, errorFunc);
};

exports.get = get;

/**
 * 
 * @param {string} url 
 * @param {object} body 
 * @param {function} successFunc 
 * @param {function} errorFunc 
 */
const post = (url, body, successFunc, errorFunc) => {
    const options = jsonOptions(requestTypes.post, body);
    request(url, options, successFunc, errorFunc);
}

exports.post = post;

/**
 * 
 * @param {string} url 
 * @param {object} body 
 * @param {function} successFunc 
 * @param {function} errorFunc 
 */
const patch = (url, body, successFunc, errorFunc) => {
    const options = jsonOptions(requestTypes.patch, body);
    request(url, options, successFunc, errorFunc);
}

exports.patch = patch;