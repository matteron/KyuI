/**
 * 
 * @param {string} url 
 * @param {function} successFunc 
 * @param {function} errorFunc 
 */
const get = (url, successFunc, errorFunc) => {
    fetch(url).then((response) => {
        if (!response.ok) {
            throw new Error(error);
        }
        return response.json();
    }).then(successFunc)
    .catch(errorFunc);
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
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    };

    fetch(url, options).then((response) => {
        if (!response.ok) {
            throw new Error(response);
        }
        return response.json();
    }).then(successFunc)
    .catch(errorFunc);
}

exports.post = post;