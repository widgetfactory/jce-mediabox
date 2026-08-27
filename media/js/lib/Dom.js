/**
 * Dom
 *
 * Native replacements for the jQuery idioms the library used before 3.x. These are
 * deliberately flat functions rather than a chainable wrapper - the codebase has a few
 * hundred call sites, and a mini-jQuery would be more surface area than the thing it
 * replaces.
 *
 * Anything that accepts an element tolerates null, an Element, or an array of Elements,
 * so callers can pass the result of query()/queryAll() without guarding first.
 */

/**
 * Find the first matching element
 * @param {String} selector
 * @param {Element|Document} context Optional, defaults to document
 * @return {Element|null}
 */
function query(selector, context) {
    return (context || document).querySelector(selector);
}

/**
 * Find all matching elements. Always returns a real array, so .forEach / .filter / .map
 * are safe and a .length check replaces jQuery's `if ($('.x').length)` idiom verbatim.
 * @param {String} selector
 * @param {Element|Document} context Optional, defaults to document
 * @return {Array} Array of elements
 */
function queryAll(selector, context) {
    return Array.prototype.slice.call((context || document).querySelectorAll(selector));
}

/**
 * Normalise an element argument to an array of elements
 * @param {Element|Array|NodeList|null} el
 * @return {Array}
 */
function toArray(el) {
    if (!el) {
        return [];
    }

    if (el.nodeType || el === window) {
        return [el];
    }

    return Array.prototype.slice.call(el);
}

function splitNames(names) {
    if (!names) {
        return [];
    }

    return String(names).split(/\s+/).filter(Boolean);
}

/**
 * Add one or more space separated class names
 * @param {Element|Array} el
 * @param {String} names
 */
function addClass(el, names) {
    var list = splitNames(names);

    if (!list.length) {
        return;
    }

    toArray(el).forEach(function (node) {
        node.classList.add.apply(node.classList, list);
    });
}

/**
 * Remove one or more space separated class names
 * @param {Element|Array} el
 * @param {String} names
 */
function removeClass(el, names) {
    var list = splitNames(names);

    if (!list.length) {
        return;
    }

    toArray(el).forEach(function (node) {
        node.classList.remove.apply(node.classList, list);
    });
}

/**
 * Whether the element carries the class. False for null.
 * @param {Element} el
 * @param {String} name
 * @return {Boolean}
 */
function hasClass(el, name) {
    return !!(el && el.classList && el.classList.contains(name));
}

/**
 * Toggle a class, optionally forcing a state
 * @param {Element|Array} el
 * @param {String} name
 * @param {Boolean} state Optional
 */
function toggleClass(el, name, state) {
    toArray(el).forEach(function (node) {
        if (typeof state === 'undefined') {
            node.classList.toggle(name);
        } else {
            node.classList.toggle(name, !!state);
        }
    });
}

// CSS properties that take a bare number rather than a length. Everything else gets
// 'px' appended when passed a number, matching jQuery's .css() semantics - several
// callers pass raw numbers to max-width and would silently produce invalid CSS.
var cssNumber = {
    'animation-iteration-count': true,
    'column-count': true,
    'fill-opacity': true,
    'flex-grow': true,
    'flex-shrink': true,
    'font-weight': true,
    'line-height': true,
    'opacity': true,
    'order': true,
    'orphans': true,
    'widows': true,
    'z-index': true,
    'zoom': true
};

/**
 * Convert a camelCase property name to its hyphenated CSS form. Custom properties
 * (--x) and already hyphenated names pass through untouched.
 * @param {String} name
 * @return {String}
 */
function hyphenate(name) {
    if (name.indexOf('--') === 0) {
        return name;
    }

    return name.replace(/[A-Z]/g, function (chr) {
        return '-' + chr.toLowerCase();
    });
}

/**
 * Write an inline style. Numbers gain a 'px' suffix unless the property is unitless.
 * An empty string clears the inline value.
 *
 * @param {Element|Array} el
 * @param {String|Object} prop Property name, or an object of property/value pairs
 * @param {String|Number} value
 */
function css(el, prop, value) {
    var nodes = toArray(el);

    if (!nodes.length) {
        return;
    }

    if (prop && typeof prop === 'object') {
        Object.keys(prop).forEach(function (key) {
            css(nodes, key, prop[key]);
        });

        return;
    }

    var name = hyphenate(prop);

    if (value === '' || value === null || typeof value === 'undefined') {
        nodes.forEach(function (node) {
            node.style.removeProperty(name);
        });

        return;
    }

    if (typeof value === 'number' && !cssNumber[name]) {
        value = value + 'px';
    }

    nodes.forEach(function (node) {
        node.style.setProperty(name, String(value));
    });
}

/**
 * Read a computed style value. Must be used in place of jQuery's .css() getter -
 * reading el.style only sees inline values, not anything from a stylesheet.
 *
 * @param {Element} el
 * @param {String} prop
 * @return {String}
 */
function getStyle(el, prop) {
    if (!el) {
        return '';
    }

    return window.getComputedStyle(el).getPropertyValue(hyphenate(prop));
}

/**
 * Set a CSS custom property
 * @param {Element} el
 * @param {String} name eg: --wf-mediabox-transition-speed
 * @param {String|Number} value
 */
function setProp(el, name, value) {
    if (!el) {
        return;
    }

    el.style.setProperty(name, String(value));
}

/**
 * Get, set or bulk set attributes. A null or false value removes the attribute.
 *
 * @param {Element|Array} el
 * @param {String|Object} name Attribute name, or an object of name/value pairs
 * @param {String} value
 * @return {String|null|undefined} The attribute value when reading
 */
function attr(el, name, value) {
    var nodes = toArray(el);

    if (name && typeof name === 'object') {
        Object.keys(name).forEach(function (key) {
            attr(nodes, key, name[key]);
        });

        return;
    }

    // getter
    if (typeof value === 'undefined') {
        return nodes.length ? nodes[0].getAttribute(name) : null;
    }

    nodes.forEach(function (node) {
        if (value === null || value === false) {
            node.removeAttribute(name);
        } else {
            node.setAttribute(name, String(value));
        }
    });
}

/**
 * Parse an HTML string into a list of nodes
 * @param {String} html
 * @return {Array} Array of nodes
 */
function parseHtml(html) {
    var template = document.createElement('template');

    template.innerHTML = String(html).trim();

    return Array.prototype.slice.call(template.content.childNodes);
}

/**
 * Remove every child of an element
 * @param {Element|Array} el
 */
function empty(el) {
    toArray(el).forEach(function (node) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
    });
}

/**
 * Remove an element from its parent
 * @param {Element|Array} el
 */
function remove(el) {
    toArray(el).forEach(function (node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    });
}

/**
 * Append content to an element
 * @param {Element} parent
 * @param {String|Node|Array} content
 */
function append(parent, content) {
    if (!parent || typeof content === 'undefined' || content === null) {
        return;
    }

    var nodes = typeof content === 'string' ? parseHtml(content) : toArray(content);

    nodes.forEach(function (node) {
        parent.appendChild(node);
    });
}

/**
 * Replace the contents of an element. Accepts an HTML string, a node, or a list of nodes.
 * @param {Element|Array} el
 * @param {String|Node|Array} content
 */
function setHtml(el, content) {
    toArray(el).forEach(function (node) {
        empty(node);
        append(node, content);
    });
}

/**
 * Bind a handler for one or more space separated event types.
 *
 * jQuery event namespaces (.wf-mediabox) have no native equivalent, so callers that
 * need to unbind later should keep the returned function rather than relying on a
 * namespace.
 *
 * @param {Element|Array|Window} el
 * @param {String} types Space separated event types
 * @param {Function} handler
 * @param {Object|Boolean} options Optional addEventListener options
 * @return {Function} Call to unbind
 */
function on(el, types, handler, options) {
    var nodes = toArray(el);
    var list = splitNames(types);

    nodes.forEach(function (node) {
        list.forEach(function (type) {
            node.addEventListener(type, handler, options || false);
        });
    });

    return function () {
        nodes.forEach(function (node) {
            list.forEach(function (type) {
                node.removeEventListener(type, handler, options || false);
            });
        });
    };
}

/**
 * Unbind a handler for one or more space separated event types
 * @param {Element|Array|Window} el
 * @param {String} types
 * @param {Function} handler
 * @param {Object|Boolean} options
 */
function off(el, types, handler, options) {
    toArray(el).forEach(function (node) {
        splitNames(types).forEach(function (type) {
            node.removeEventListener(type, handler, options || false);
        });
    });
}

/**
 * Bind a handler that fires at most once across ALL of the given event types.
 *
 * This matches jQuery's .one('load loadedmetadata error', fn), where the first of any
 * of the types wins. A plain { once: true } listener would fire once per type, so a
 * <video> firing both loadedmetadata and load would run the handler twice.
 *
 * @param {Element|Array} el
 * @param {String} types Space separated event types
 * @param {Function} handler
 * @return {Function} Call to unbind
 */
function once(el, types, handler) {
    var fired = false;

    var unbind = on(el, types, function (e) {
        if (fired) {
            return;
        }

        fired = true;
        unbind();

        return handler.call(this, e);
    });

    return unbind;
}

/**
 * Dispatch a custom event
 * @param {Element} el
 * @param {String} type
 * @param {Object} detail Optional event detail
 * @return {Boolean} False if the event was cancelled
 */
function trigger(el, type, detail) {
    if (!el) {
        return false;
    }

    return el.dispatchEvent(new CustomEvent(type, {
        detail: detail,
        bubbles: false,
        cancelable: true
    }));
}

/**
 * Show an element by clearing its inline display value. The natural display comes from
 * the stylesheet, so there is no need to reproduce jQuery's remembered display value.
 * @param {Element|Array} el
 */
function show(el) {
    toArray(el).forEach(function (node) {
        node.style.display = '';
    });
}

/**
 * Hide an element
 * @param {Element|Array} el
 */
function hide(el) {
    toArray(el).forEach(function (node) {
        node.style.display = 'none';
    });
}

/**
 * Whether the element is rendered. Replaces the jQuery :visible selector.
 * @param {Element} el
 * @return {Boolean}
 */
function isVisible(el) {
    if (!el) {
        return false;
    }

    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

/**
 * Force a synchronous layout so a subsequent class change animates from the current
 * computed value rather than jumping straight to the target.
 *
 * This must stay a function call - a bare `el.offsetHeight;` expression statement is
 * something a minifier is entitled to drop.
 *
 * @param {Element} el
 * @return {Number} The element height, so the read cannot be optimised away
 */
function reflow(el) {
    return el ? el.offsetHeight : 0;
}

const Dom = {
    query: query,
    queryAll: queryAll,

    addClass: addClass,
    removeClass: removeClass,
    hasClass: hasClass,
    toggleClass: toggleClass,

    css: css,
    getStyle: getStyle,
    setProp: setProp,

    attr: attr,
    parseHtml: parseHtml,
    setHtml: setHtml,
    append: append,
    remove: remove,
    empty: empty,

    on: on,
    off: off,
    once: once,
    trigger: trigger,

    show: show,
    hide: hide,
    isVisible: isVisible,
    reflow: reflow
};

export default Dom;
