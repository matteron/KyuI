const request = (url, options, successFunc, errorFunc) => {
    fetch(url, options).then((response) => {
        if (!response.ok) {
            throw new Error(error);
        }
        return response.json();
    }).then(successFunc)
    .catch(errorFunc ? errorFunc : console.error);
};

const requestTypes = {
    post: 'POST',
    patch: 'PATCH',
    delete: 'DELETE'
}

const jsonOptions = (type, body) => ({
    method: type,
    headers: {
        'Content-Type': 'application/json',
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
    // fetch(url).then((response) => {
    //     if (!response.ok) {
    //         throw new Error(error);
    //     }
    //     return response.json();
    // }).then(successFunc)
    // .catch(errorFunc ? errorFunc : console.error);
    request(url, null, successFunc, errorFunc);
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

const patch = (url, body, successFunc, errorFunc) => {
    const options = jsonOptions(requestTypes.patch, body);
    request(url, options, successFunc, errorFunc);
}

exports.patch = patch;