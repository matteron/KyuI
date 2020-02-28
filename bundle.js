(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.DomLibrary = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const { toNodes, filterEntries, loopObject, directionOffset } = require('./src/helpers');
const html = require('./src/templates');
const api = require('./src/api');
const { StatusNames } = require('./src/constants');
const ee = require('./src/eventBus');
const { authenticate } = require('./src/auth');

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
let entryLoadedFlag = false;

const main = () => {
    ee.on('ready', init);
    authenticate();
    ee.on('status', updateStatus);
}

const init = () => {
    selectors = buildSelectors();
    api.types(data =>{
        typeData = parseTypeData(data);
        renderTypes();
        if (entryLoadedFlag) {
            renderEntries();
        }
    });
    api.entries(data => {
        sorted = filterEntries(data);
        renderEntries();
        entryLoadedFlag = true;
    });
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
},{"./src/api":11,"./src/auth":12,"./src/constants":14,"./src/domLibrary":15,"./src/eventBus":16,"./src/helpers":17,"./src/templates":20}],2:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var objectCreate = Object.create || objectCreatePolyfill
var objectKeys = Object.keys || objectKeysPolyfill
var bind = Function.prototype.bind || functionBindPolyfill

function EventEmitter() {
  if (!this._events || !Object.prototype.hasOwnProperty.call(this, '_events')) {
    this._events = objectCreate(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

var hasDefineProperty;
try {
  var o = {};
  if (Object.defineProperty) Object.defineProperty(o, 'x', { value: 0 });
  hasDefineProperty = o.x === 0;
} catch (err) { hasDefineProperty = false }
if (hasDefineProperty) {
  Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
    enumerable: true,
    get: function() {
      return defaultMaxListeners;
    },
    set: function(arg) {
      // check whether the input is a positive number (whose value is zero or
      // greater and not a NaN).
      if (typeof arg !== 'number' || arg < 0 || arg !== arg)
        throw new TypeError('"defaultMaxListeners" must be a positive number');
      defaultMaxListeners = arg;
    }
  });
} else {
  EventEmitter.defaultMaxListeners = defaultMaxListeners;
}

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n))
    throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
function emitNone(handler, isFn, self) {
  if (isFn)
    handler.call(self);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self);
  }
}
function emitOne(handler, isFn, self, arg1) {
  if (isFn)
    handler.call(self, arg1);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1);
  }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn)
    handler.call(self, arg1, arg2);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2);
  }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn)
    handler.call(self, arg1, arg2, arg3);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2, arg3);
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn)
    handler.apply(self, args);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].apply(self, args);
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events;
  var doError = (type === 'error');

  events = this._events;
  if (events)
    doError = (doError && events.error == null);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    if (arguments.length > 1)
      er = arguments[1];
    if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      var err = new Error('Unhandled "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }

  handler = events[type];

  if (!handler)
    return false;

  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
      // fast cases
    case 1:
      emitNone(handler, isFn, this);
      break;
    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
      // slower
    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
      emitMany(handler, isFn, this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');

  events = target._events;
  if (!events) {
    events = target._events = objectCreate(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      target.emit('newListener', type,
          listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
          prepend ? [listener, existing] : [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    // Check for listener leak
    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' +
            existing.length + ' "' + String(type) + '" listeners ' +
            'added. Use emitter.setMaxListeners() to ' +
            'increase limit.');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        if (typeof console === 'object' && console.warn) {
          console.warn('%s: %s', w.name, w.message);
        }
      }
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    switch (arguments.length) {
      case 0:
        return this.listener.call(this.target);
      case 1:
        return this.listener.call(this.target, arguments[0]);
      case 2:
        return this.listener.call(this.target, arguments[0], arguments[1]);
      case 3:
        return this.listener.call(this.target, arguments[0], arguments[1],
            arguments[2]);
      default:
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; ++i)
          args[i] = arguments[i];
        this.listener.apply(this.target, args);
    }
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = bind.call(onceWrapper, state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = this._events;
      if (!events)
        return this;

      list = events[type];
      if (!list)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = objectCreate(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else
          spliceOne(list, position);

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (!events)
        return this;

      // not listening for removeListener, no need to emit
      if (!events.removeListener) {
        if (arguments.length === 0) {
          this._events = objectCreate(null);
          this._eventsCount = 0;
        } else if (events[type]) {
          if (--this._eventsCount === 0)
            this._events = objectCreate(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = objectKeys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = objectCreate(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (!events)
    return [];

  var evlistener = events[type];
  if (!evlistener)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

// About 1.5x faster than the two-arg version of Array#splice().
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
    list[i] = list[k];
  list.pop();
}

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function objectCreatePolyfill(proto) {
  var F = function() {};
  F.prototype = proto;
  return new F;
}
function objectKeysPolyfill(obj) {
  var keys = [];
  for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
    keys.push(k);
  }
  return k;
}
function functionBindPolyfill(context) {
  var fn = this;
  return function () {
    return fn.apply(context, arguments);
  };
}

},{}],3:[function(require,module,exports){
exports.ariaAttr = [
	'autocomplete',
	'checked',
	'current',
	'disabled',
	'errormessage',
	'expanded',
	'haspopup',
	'hidden',
	'invalid',
	'label',
	'level',
	'modal',
	'multiline',
	'multiselectable',
	'orientation',
	'placeholder',
	'pressed',
	'readonly',
	'required',
	'selected',
	'sort',
	'valuemax',
	'valuemin',
	'valuenow',
	'valuetext',
	'live',
	'relevant',
	'atomic',
	'busy',
	'dropeffect',
	'dragged',
	'activedescendant',
	'colcount',
	'colindex',
	'colspan',
	'controls',
	'describedby',
	'details',
	'errormessage',
	'flowto',
	'labelledby',
	'owns',
	'posinset',
	'rowcount',
	'rowindex',
	'rowspan',
	'setsize'
].map(a => 'aria-' + a);


},{}],4:[function(require,module,exports){
exports.baseTags = [
	//'html', Handeled manually to prepend <!DOCTYPE html>
	// Document Metadata
	'base', 'link', 'meta', 'head', 'style', 'title', 
	// Sectioning Root
	'body',
	// Content Sectioning
	'address', 'article', 'aside', 'footer', 'header', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hgroup', 'main', 'nav', 'section',
	// Text Content
	'blockquote', 'dd', 'div', 'dl', 'dt', 'figcaption', 'figure', 'hr', 'li', 'ol', 'p', 'pre', 'ul',
	// Inline Text Semantics
	'a', 'abbr', 'b', 'bdi', 'bdo', 'br', 'cite', 'code', 'data', 'dfn', 'em', 'i', 'kbd', 'mark', 'q','rb',
	'rp', 'rt', 'rtc', 'ruby', 's', 'samp', 'small', 'span', 'strong', 'sub', 'sup', 'time', 'u', 'var', 'wbr',
	// Image and Multimedia
	'area', 'audio', 'img', 'map', 'track', 'video',
	// Embedded Content
	'embed', 'iframe', 'object', 'param', 'picture', 'source',
	// Scripting
	'canvas', 'noscript', 'script',
	// Demarcating Edits
	'del', 'ins',
	// Table Content
	'caption', 'col', 'colgroup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr',
	// Forms
	'button', 'datalist', 'fieldset', 'form', 'input', 'label', 'legend', 'meter', 'optgroup', 'option', 'output', 'progress', 'select', 'textarea',
	// Interactive Elements
	'details', 'dialog', 'menu', 'summary',
	// Web Components
	'slot', 'template'
];

exports.baseAttr = [
	// A
	'abbr', 'accept', 'acceptCharset', 'accessKey', 'action', 'allowFullScreen', 'allowTransparency', 'alt', 'as', 'async', 'autoComplete', 'autoFocus', 'autoPlay',
	// C  NOTE: 'class' is replaced with 'classes' due to name collision.
	'cellPadding', 'cellSpacing', 'challenge', 'charset', 'checked', 'cite', 'className', 'cols', 'colSpan', 'command', 'content', 'contentEditable',
	'contextMenu', 'controls', 'coords', 'crossOrigin',
	// D
	'data', 'dateTime', 'default', 'defer', 'dir', 'disabled', 'download', 'draggable', 'dropzone',
	// E
	'encType',
	// F  NOTE: 'for' is replaced with 'isFor' due to name collision.
	'form', 'formAction', 'formEncType', 'formMethod', 'formNoValidate', 'formTarget', 'frameBorder',
	// H
	'headers', 'height', 'hidden', 'high', 'href', 'hrefLang', 'htmlFor', 'httpEquiv',
	// I
	'icon', 'id', 'inputMode', 'isMap', 'itemId', 'itemProp', 'itemRef', 'itemScope', 'itemType',
	// K
	'kind',
	// L
	'label', 'lang', 'list', 'loop',
	// M
	'manifest', 'max', 'maxLength', 'media', 'mediaGroup', 'method', 'min', 'minLength', 'multiple', 'muted',
	// N
	'name', 'noValidate',
	// O
	'open', 'optimum',
	// P
	'pattern', 'ping', 'placeholder', 'poster', 'preload',
	// R
	'radioGroup', 'readOnly', 'rel', 'required', 'role', 'rows', 'rowSpan',
	// S
	'sandbox', 'scope', 'scoped', 'scrolling', 'seamless', 'selected', 'shape', 'size', 'sizes', 'sortable', 'span', 'spellCheck', 'src', 'srcDoc', 'srcSet',
	'start', 'step', 'style',
	// T
	'tabIndex', 'target', 'title', 'translate', 'type', 'typeMustMatch',
	// U
	'useMap',
	// V
	'value', 'version',
	// W
	'width', 'wmode', 'wrap'
];
},{}],5:[function(require,module,exports){
// Based on MDN List
// https://developer.mozilla.org/en-US/docs/Web/HTML/Element
const { baseTags, baseAttr } = require('./base');
const { svgTags, svgAttr } = require('./svg');	
const { ariaAttr } = require('./aria');
const { eventAttr } = require('./events');

exports.tagList = [
	...baseTags,
	// SVG
	...svgTags
];

exports.attrList = [
	...baseAttr,
	// SVG
	...svgAttr,
	// Aria
	...ariaAttr,
	// Global Event Handlers
	...eventAttr
];

},{"./aria":3,"./base":4,"./events":6,"./svg":7}],6:[function(require,module,exports){
exports.eventAttr = [
	'onabort',
	'onanimationcancel ',
	'onanimationend ',
	'onanimationiteration ',
	'onanimationstart ',
	'onauxclick ',
	'onblur',
	'onerror',
	'onfocus',
	'oncancel',
	'oncanplay',
	'oncanplaythrough',
	'onchange',
	'onclick',
	'onclose',
	'oncontextmenu',
	'oncuechange',
	'ondblclick',
	'ondrag',
	'ondragend',
	'ondragenter',
	'ondragexit',
	'ondragleave',
	'ondragover',
	'ondragstart',
	'ondrop',
	'ondurationchange',
	'onemptied',
	'onended',
	'onformdata',
	'ongotpointercapture',
	'oninput',
	'oninvalid',
	'onkeydown',
	'onkeypress',
	'onkeyup',
	'onload',
	'onloadeddata',
	'onloadedmetadata',
	'onloadend',
	'onloadstart',
	'onlostpointercapture',
	'onmousedown',
	'onmouseenter',
	'onmouseleave',
	'onmousemove',
	'onmouseout',
	'onmouseover',
	'onmouseup',
	'onmousewheel  ',
	'onwheel',
	'onpause',
	'onplay',
	'onplaying',
	'onpointerdown',
	'onpointermove',
	'onpointerup',
	'onpointercancel',
	'onpointerover',
	'onpointerout',
	'onpointerenter',
	'onpointerleave',
	'onpointerlockchange ',
	'onpointerlockerror ',
	'onprogress',
	'onratechange',
	'onreset',
	'onresize',
	'onscroll',
	'onseeked',
	'onseeking',
	'onselect',
	'onselectstart',
	'onselectionchange',
	'onshow',
	'onsort ',
	'onstalled',
	'onsubmit',
	'onsuspend',
	'ontimeupdate',
	'onvolumechange',
	'ontouchcancel  ',
	'ontouchend  ',
	'ontouchmove  ',
	'ontouchstart  ',
	'ontransitioncancel',
	'ontransitionend',
	'ontransitionrun',
	'ontransitionstart',
	'onwaiting'
];
},{}],7:[function(require,module,exports){
exports.svgTags = [
	// A
	'a', 'animate', 'animateMotion', 'animateTransform',
	// C
	'circle', 'clipPath',
	// D
	'defs', 'desc', 'discard',
	// E
	'ellipse',
	// F
	'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting',
	'feDisplacementMap', 'feDistantLight', 'feDropShadow', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR',
	'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight',
	'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence', 'filter', 'foreignObject',
	// G
	'g',
	// H
	'hatch', 'hatchpath',
	// I
	'image',
	// L
	'line', 'linearGradient',
	// M
	'marker', 'mask', 'mesh', 'meshgradient', 'meshpatch', 'meshrow', 'metadata', 'mpath',
	// P
	'path', 'pattern', 'polygon', 'polyline',
	// R
	'radialGradient', 'rect',
	// S
	'script', 'set', 'solidcolor', 'stop', 'style', 'svg', 'switch', 'symbol',
	// T
	'text', 'textPath', 'title', 'tspan',
	// U
	'unknown', 'use',
	// V
	'view'
];

exports.svgAttr = [
	// A
	'accent-height', 'accumulate', 'additive', 'alignment-baseline', 'allowReorder', 'alphabetic',
	'amplitude', 'arabic-form', 'ascent', 'attributeName', 'attributeType', 'autoReverse', 'azimuth',
	// B
	'baseFrequency', 'baseline-shift', 'baseProfile', 'bbox', 'begin', 'bias', 'by',
	// C
	'calcMode', 'cap-height', 'class', 'clip', 'clipPathUnits', 'clip-path', 'clip-rule', 'color',
	'color-interpolation', 'color-interpolation-filters', 'color-profile', 'color-rendering', 'contentScriptType',
	'contentStyleType', 'cursor', 'cx', 'cy',
	// D
	'd', 'decelerate', 'descent', 'diffuseConstant', 'direction', 'display', 'divisor', 'dominant-baseline', 'dur', 'dx', 'dy',
	// E
	'edgeMode', 'elevation', 'enable-background', 'end', 'exponent', 'externalResourcesRequired',
	// F
	'fill', 'fill-opacity', 'fill-rule', 'filter', 'filterRes', 'filterUnits', 'flood-color', 'flood-opacity',
	'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight',
	'format', 'from', 'fr', 'fx', 'fy',
	// G
	'g1', 'g2', 'glyph-name', 'glyph-orientation-horizontal', 'glyph-orientation-vertical', 'glyphRef', 'gradientTransform', 'gradientUnits',
	// H
	'hanging', 'height', 'href', 'hreflang', 'horiz-adv-x', 'horiz-origin-x',
	// I
	'id', 'ideographic', 'image-rendering', 'in', 'in2', 'intercept',
	// K
	'k', 'k1', 'k2', 'k3', 'k4', 'kernelMatrix', 'kernelUnitLength', 'kerning', 'keyPoints', 'keySplines', 'keyTimes',
	// L
	'lang', 'lengthAdjust', 'letter-spacing', 'lighting-color', 'limitingConeAngle', 'local',
	// M
	'marker-end', 'marker-mid', 'marker-start', 'markerHeight', 'markerUnits', 'markerWidth', 'mask', 'maskContentUnits', 'maskUnits',
	'mathematical', 'max', 'media', 'method', 'min', 'mode',
	// N
	'name', 'numOctaves',
	// O
	'offset', 'opacity', 'operator', 'order', 'orient', 'orientation', 'origin', 'overflow', 'overline-position', 'overline-thickness',
	// P
	'panose-1', 'paint-order', 'path', 'pathLength', 'patternContentUnits', 'patternTransform', 'patternUnits', 'ping', 'pointer-events',
	'points', 'pointsAtX', 'pointsAtY', 'pointsAtZ', 'preserveAlpha', 'preserveAspectRatio', 'primitiveUnits',
	// R
	'r', 'radius', 'referrerPolicy', 'refX', 'refY', 'rel', 'rendering-intent', 'repeatCount', 'repeatDur', 'requiredExtensions',
	'requiredFeatures', 'restart', 'result', 'rotate', 'rx', 'ry',
	// S
	'scale', 'seed', 'shape-rendering', 'slope', 'spacing', 'specularConstant', 'specularExponent', 'speed', 'spreadMethod', 'startOffset',
	'stdDeviation', 'stemh', 'stemv', 'stitchTiles', 'stop-color', 'stop-opacity', 'strikethrough-position', 'strikethrough-thickness',
	'string', 'stroke', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity',
	'stroke-width', 'style', 'surfaceScale', 'systemLanguage',
	// T
	'tabindex', 'tableValues', 'target', 'targetX', 'targetY', 'text-anchor', 'text-decoration', 'text-rendering', 'textLength', 'to', 'transform', 'type',
	// U
	'u1', 'u2', 'underline-position', 'underline-thickness', 'unicode', 'unicode-bidi', 'unicode-range', 'units-per-em',
	// V
	'v-alphabetic', 'v-hanging', 'v-ideographic', 'v-mathematical', 'values', 'vector-effect', 'version', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y',
	'viewBox', 'viewTarget', 'visibility',
	// W
	'width', 'widths', 'word-spacing', 'writing-mode',
	// X
	'x', 'x-height', 'x1', 'x2', 'xChannelSelector', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title',
	'xlink:type', 'xml:base', 'xml:lang', 'xml:space', 'xmlns',
	// Y
	'y', 'y1', 'y2', 'yChannelSelector',
	// Z
	'z', 'zoomAndPan'
];
},{}],8:[function(require,module,exports){
function kebabeToCamel(s) {
  return s.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase().replace('-', '');
  });
};

function createAttr(attrName) {
	return function(prop) {
		return `${attrName}="${prop}"`
	}
}

function createAttributes(arr) {
	const out = { 
		classes: createAttr('class'),
		isFor: createAttr('for')
 	};
	var result = arr.forEach(a => out[kebabeToCamel(a)] = createAttr(a));
	return out;
}

module.exports = (attrList) => createAttributes(attrList);
},{}],9:[function(require,module,exports){
class Element {
	constructor(name, attr, internal) {
		this.tag = name;
		this.attr = attr;
		this.internal = internal;
	}
	compose() {
		return this.internal
		? `<${this.tag}${this.expandAttr()}>\t${this.expandInternal()}\n</${this.tag}>`
		: `<${this.tag}${this.expandAttr()}/>\n`;
	}
	expandAttr() {
		return this.attr.reduce((acc, cur) => `${acc} ${cur}`, '');
	}
	expandInternal(){
		return this.internal.reduce((acc, cur) => `${acc}\n${typeof cur == 'string' ? cur : cur.compose()}`, '');
	}
};

function createTag(tagName) {
	return function(attr, internal) {
		return (new Element(tagName, attr, internal)).compose();
	}
}

function generateTags(arr) {
	const out = { html: (a, i) => '<!DOCTYPE html>\n' + createTag('html')(a, i)};
	arr.forEach(t => out[t] = createTag(t));
	return out;
}

module.exports = (tagList) => generateTags(tagList);
},{}],10:[function(require,module,exports){
const { tagList, attrList } = require('./data/data');

const haipa = {
	tags: require('./factories/tags')(tagList),
	attr: require('./factories/attr')(attrList)
}

module.exports = haipa;
},{"./data/data":5,"./factories/attr":8,"./factories/tags":9}],11:[function(require,module,exports){
const { get, post } = require('./http');
const { apiUrl, kyurl } = require('./helpers');

const fetchTypes = (callback) => get(apiUrl('entryType'), callback);

const fetchEntries = (callback) => get(kyurl(), callback);

module.exports = {
    types: fetchTypes,
    entries: fetchEntries,
};
},{"./helpers":17,"./http":18}],12:[function(require,module,exports){
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
},{"./eventBus":16,"./helpers":17,"./http":18,"./jwt":19,"./templates":20}],13:[function(require,module,exports){
const ports = {
    work: 44306,
    mac: 5001,
}
module.exports = {
    port: ports.work,
    url: 'https://localhost'
};

},{}],14:[function(require,module,exports){
exports.StatusEnum = {
    pending: 1,
    active: 2,
    complete: 3
}

exports.StatusNames = [
  'pending',
  'active',
  'complete'  
]

exports.StatusDirection = {
    elevate: 'elevate',
    demote: 'demote'
}

exports.TypeEnum = {
    link: 1
}
},{}],15:[function(require,module,exports){
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
},{"./auth":12,"./constants":14,"./eventBus":16,"./helpers":17,"./http":18,"./jwt":19}],16:[function(require,module,exports){
const EventEmitter = require('events');
const ee = new EventEmitter;

module.exports = ee;
},{"events":2}],17:[function(require,module,exports){
var config = require('./config');
var { StatusNames, StatusDirection } = require('./constants');

const toNodes = (html) => new DOMParser().parseFromString(html, 'text/html').body.childNodes;
exports.toNodes = toNodes;

const baseUrl = `${config.url}:${config.port}/`;
const apiUrl = (endpoint) => baseUrl + endpoint;
const kyurl = (endpoint) => baseUrl + 'api/kyu/' + (endpoint ? endpoint : '');

exports.apiUrl = apiUrl;
exports.kyurl = kyurl;

const loopObject = (array, callback) => {
    return array.reduce((acc, cur) => {
        acc[cur] = callback(cur);
        return acc;
    }, {});
}
exports.loopObject = loopObject;

const filterEntries = (entries) => {
    const filtered = loopObject(StatusNames, s => []);
    entries.forEach(e => {
        filtered[e.status.name.toLowerCase()].push(e);
    });
    return filtered;
}
exports.filterEntries = filterEntries;

const directionOffset = (direction) => 
    direction === StatusDirection.elevate
        ? 1
        : direction === StatusDirection.demote
            ? -1
            : 0;
exports.directionOffset = directionOffset;
},{"./config":13,"./constants":14}],18:[function(require,module,exports){
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
},{"./jwt":19}],19:[function(require,module,exports){
class JwtHelper {
    static key = 'auth_token';
    static storeToken(token) {
      localStorage.setItem(this.key, token);
    }
  
    static getToken() {
      return localStorage.getItem(this.key);
    }
  
    static removeToken() {
      localStorage.removeItem(this.key);
    }
  
    static decodeToken(token) {
      if (token) {
        return JSON.parse(atob(token.split('.')[1]));
      }
      return null;
    }
  
    static isExpired(token) {
      const jwt = this.decodeToken(token);
      if (jwt) {
        const now = new Date().getTime() / 1000;
        return now > jwt.exp;
      }
      return true;
    }  
}

module.exports = JwtHelper;
  
},{}],20:[function(require,module,exports){
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
},{"./constants.js":14,"haipa":10}]},{},[1])(1)
});
