import Dom from './Dom.js';

const themes = {};

function add(name, theme) {
    if (typeof name !== "string" || typeof theme !== "function") {
        return false;
    }

    // check if theme already exists
    if (themes.hasOwnProperty(name)) {
        return false;
    }

    // add theme
    themes[name] = theme;

    return true;
}

function get(name) {
    if (typeof name !== "string") {
        return null;
    }

    // check if theme exists
    if (themes.hasOwnProperty(name)) {
        return themes[name];
    }

    return null;
}


function parse (name, translate, parent) {
    var theme = get(name), data;

    if (typeof theme !== "function") {
        theme = get("standard");
    }

    data = new theme();

    // no theme data
    if (!data) {
        return;
    }

    // create parent div if no parent set
    if (!parent) {
        parent = document.createElement('div');
    }

    if (!translate) {
        translate = function (str) {
            return str;
        };
    }

    /**
     * Iterate an array by index or an object by key, passing (value, key) so that a
     * numeric key can be told apart from a tag name.
     */
    function eachEntry(obj, callback) {
        if (Array.isArray(obj)) {
            obj.forEach(function (val, i) {
                callback(val, i);
            });

            return;
        }

        Object.keys(obj).forEach(function (key) {
            callback(obj[key], key);
        });
    }

    /**
     * Internal function to create or process a node
     * @param o Data object
     * @param el Element
     */
    function createNode(obj, el) {
        // process node object
        eachEntry(obj, function (val, key) {
            if (typeof val === "string") {
                // translate
                val = translate(val);

                // text node
                if (key === "text") {
                    // labels arrive html encoded from the server, so they are set as
                    // markup rather than as a text node
                    Dom.setHtml(el, val);
                // attribute
                } else {
                    el.setAttribute(key, val);
                }
            } else {
                if (Array.isArray(val)) {
                    createNode(val, el);
                } else if (typeof key === "string") {
                    // create new node
                    var node = document.createElement(key);
                    // append to parent
                    el.appendChild(node);
                    // pass back
                    createNode(val, node);
                } else {
                    // pass back
                    createNode(val, el);
                }
            }
        });
    }

    // create nodes
    createNode(data, parent);

    // return parent node
    return parent;
}

export default {
    add,
    get,
    parse
}