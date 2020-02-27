const {tags, attr} = require('haipa')();
const { div, option } = tags;
const { value, id } = attr;

const typeOptions = (types) => 
    types.reduce((acc, cur) =>
        acc + '\n' + option([value(cur.id)], [cur.name]), option([value``], []
    )
);

const singleEntry = (e) => div([id(e.id)], [e.title]);

const entries = (entries) => entries.reduce((acc, cur) => acc + '\n' + singleEntry(cur), '');

exports.html = {
    typeOptions,
    entries
}