define("mediabox/util/Tools", [], function () {
    var Tools = {};

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
    Tools.debounce = function (func, wait, immediate) {
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
     * Proportional resizing method
     * @param {Object} w
     * @param {Object} h
     * @param {Object} x
     * @param {Object} y
     */
    Tools.resize = function (w, h, x, y) {
        if (w > x) {
            h = h * (x / w);
            w = x;
            if (h > y) {
                w = w * (y / h);
                h = y;
            }
        } else if (h > y) {
            w = w * (y / h);
            h = y;
            if (w > x) {
                h = h * (x / w);
                w = x;
            }
        }
        w = Math.round(w);
        h = Math.round(h);

        return {
            width: Math.round(w),
            height: Math.round(h)
        };
    };

    Tools.parseWidth = function (w) {
        // calculate width if percentage
        if (/%/.test(w)) {
            w = Math.floor($(window).width() * parseInt(w) / 100);
        }
        // convert to integer
        if (/\d/.test(w)) {
            w = parseInt(w);
        }
        
        return w;
    };
    
    Tools.parseHeight = function (h) {
        // calculate width if percentage
        if (/%/.test(h)) {
            h = Math.floor($(window).height() * parseInt(h) / 100);
        }
        // convert to integer
        if (/\d/.test(h)) {
            h = parseInt(h);
        }
        
        return h;
    };

    return Tools;
});