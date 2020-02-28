const { tags, attr } = require('haipa');
const { div, option, span, details, summary, label, input, button, select, form } = tags;
const { value, id, isFor, name, classes, onclick, type, onsubmit } = attr;
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
    summary([classes(`type-${e.type.name}`)], [
        div([classes`summaryInfo`], [
            div([], [
                span([classes`typeDisplay`], [e.type.name]),
                span([], [e.title]),
            ]),
            div([classes`actions`], [
                button([disabled(e.status.id === StatusEnum.pending), onclick(`lib.updateStatus('${e.id}', '${StatusDirection.demote}')`)], ['🡑']),
                button([disabled(e.status.id === StatusEnum.complete), onclick(`lib.updateStatus('${e.id}', '${StatusDirection.elevate}')`)], ['🡓']),
                //button([], ['🗑'])
            ]),
        ])
    ]),
    div([classes`formGroup`], [
        label([isFor(`title:${e.id}`)], ['Title']),
        input([name(`title:${e.id}`), id(`title:${e.id}`), value(e.title)])
    ]),
    div([classes`formGroup`], [
        label([isFor(`body:${e.id}`)], ['Body']),
        input([name(`body:${e.id}`), id(`body:${e.id}`), value(e.body)])
    ]),
    div([classes`entryTypeGroup`], [
        div([classes`typeFormGroup`], [
            div([classes`formGroup`], [
                label([isFor(`type:${e.id}`)], ['Type']),
                select([name(`type:${e.id}`), id(`type:${e.id}`), value(e.type.id)], [typeOptions(types, e.type.id)]),    
            ]),
            button([classes`updateBtn`, onclick(`lib.updateEntry('${e.id}')`)], ['Update'])
        ])
    ])
]);

const entries = (entries, types) => entries.reduce((acc, cur) => acc + '\n' + singleEntry(cur, types), '');

const loginPage = () => form([onsubmit`lib.login(event)`], [
    input([id`password`, type`password`]),
    button([onclick`lib.login()`, type`submit`], ['login'])
]);

module.exports = {
    typeOptions,
    entries,
    loginPage
}