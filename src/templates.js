const { tags, attr } = require('haipa');
const { div, option, span, details, summary, label, input, button, select } = tags;
const { value, id, isFor, name, classes, onclick } = attr;
const { StatusEnum, StatusDirection } = require('./constants.js');

const typeOptions = (types, selected) => 
    types.reduce((acc, cur) =>
        acc + '\n' + option([value(cur.id), (selected === cur.id ? 'selected="selected"' : '')], [cur.name]), option([value``], []
    )
);

const disabled = (test) => {
    return test ? 'disabled' : '';
}

const singleEntry = (e, types) => details([id(e.id), onclick(`lib.openLink(event, '${e.id}')`)], [
    summary([], [
        div([classes`summaryInfo`], [
            span([classes`typeDisplay`], [e.type.name]),
            span([], [e.title]),
        ]),
        div([classes`actions`], [
            button([disabled(e.status.id === StatusEnum.pending), onclick(`lib.updateStatus('${e.id}', '${StatusDirection.demote}')`)], ['🡑']),
            button([disabled(e.status.id === StatusEnum.complete), onclick(`lib.updateStatus('${e.id}', '${StatusDirection.elevate}')`)], ['🡓']),
            //button([], ['🗑'])
        ]),
    ]),
    div([], [
        label([isFor(`title:${e.id}`)], ['Title']),
        input([name(`title:${e.id}`), id(`title:${e.id}`), value(e.title)])
    ]),
    div([], [
        label([isFor(`body:${e.id}`)], ['Body']),
        input([name(`body:${e.id}`), id(`body:${e.id}`), value(e.body)])
    ]),
    div([], [
        label([isFor(`type:${e.id}`)], ['Type']),
        select([name(`type:${e.id}`), id(`type:${e.id}`), value(e.type.id)], [typeOptions(types, e.type.id)]),
        button([classes`updateBtn`, onclick(`lib.updateEntry('${e.id}')`)], ['Update'])
    ])
]);

const entries = (entries, types) => entries.reduce((acc, cur) => acc + '\n' + singleEntry(cur, types), '');

exports.html = {
    typeOptions,
    entries
}