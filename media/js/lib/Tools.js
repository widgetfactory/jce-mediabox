
function extend(target, source) {
    if (!source) {
        return target;
    }

    for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
        }
    }

    return target;
}

/**
 * Iterate over an array, array-like object, or plain object.
 *
 * The callback is invoked with the following arguments:
 *   - value  : The current item value
 *   - key    : The array index or object property name
 *   - source : The original collection being iterated
 *
 * Iteration stops early if the callback explicitly returns false.
 *
 * @param {Array|Object} collection  The collection to iterate over
 * @param {Function}     callback    Function called for each item
 * @param {Object}       scope       Optional scope for callback (this value)
 *
 * @return {Boolean} true if iteration completed, false if aborted early
 */
function each(collection, callback, scope) {
    var key, length;

    if (!collection) {
        return false;
    }

    scope = scope || collection;

    // Array or array-like (Array, NodeList, arguments, etc.)
    if (typeof collection.length === 'number') {
        for (key = 0, length = collection.length; key < length; key++) {
            if (callback.call(scope, collection[key], key, collection) === false) {
                return false;
            }
        }
    } else {
        // Plain object / hashtable
        for (key in collection) {
            if (Object.prototype.hasOwnProperty.call(collection, key)) {
                if (callback.call(scope, collection[key], key, collection) === false) {
                    return false;
                }
            }
        }
    }

    return true;
}

function now() {
    return new Date().getTime();
}

/* A selection of functions from Underscore.js to expand tinymec.util.Tools
 * http://underscorejs.org
 * (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Underscore may be freely distributed under the MIT license.
 */

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
const debounce = function (func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function () {
        var last = now() - timestamp;

        if (last < wait && last > 0) {
            timeout = setTimeout(later, wait - last);
        } else {
            timeout = null;
            if (!immediate) {
                result = func.apply(context, args);
                if (!timeout)
                    context = args = null;
            }
        }
    };

    return function () {
        context = this;
        args = arguments;
        timestamp = now();
        var callNow = immediate && !timeout;
        if (!timeout)
            timeout = setTimeout(later, wait);
        if (callNow) {
            result = func.apply(context, args);
            context = args = null;
        }

        return result;
    };
};

/**
 * Resize dimensions proportionally to fit within a bounding box.
 *
 * The original aspect ratio is preserved while ensuring the
 * resulting width and height do not exceed the maximum bounds.
 *
 * @param {Number} width     Original width
 * @param {Number} height    Original height
 * @param {Number} maxWidth  Maximum allowed width
 * @param {Number} maxHeight Maximum allowed height
 *
 * @return {Object} Object containing resized width and height
 */
function resize(width, height, maxWidth, maxHeight) {
    if (width > maxWidth) {
        height = height * (maxWidth / width);
        width = maxWidth;

        if (height > maxHeight) {
            width = width * (maxHeight / height);
            height = maxHeight;
        }
    } else if (height > maxHeight) {
        width = width * (maxHeight / height);
        height = maxHeight;

        if (width > maxWidth) {
            height = height * (maxWidth / width);
            width = maxWidth;
        }
    }

    return {
        width: Math.round(width),
        height: Math.round(height)
    };
}

const parseWidth = function (w) {
    // calculate width if percentage
    if (/%/.test(w)) {
        w = Math.floor(window.innerWidth * parseInt(w) / 100);
    }
    // convert to integer
    if (/\d/.test(w)) {
        w = parseInt(w);
    }

    return w;
};

const parseHeight = function (h) {
    // calculate width if percentage
    if (/%/.test(h)) {
        h = Math.floor(window.innerHeight * parseInt(h) / 100);
    }
    // convert to integer
    if (/\d/.test(h)) {
        h = parseInt(h);
    }

    return h;
};

const Tools = {
    debounce: debounce,
    resize: resize,
    parseWidth: parseWidth,
    parseHeight: parseHeight,
    now: now,
    extend: extend,
    each: each
};

export default Tools;