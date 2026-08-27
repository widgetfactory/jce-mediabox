import Entities from './Entities.js';

/**
 * Parse a parameter string into an object.
 *
 * Accepts a JSON string, the JCE MediaBox bracket format (eg: title[title];width[400]),
 * or a url style query string.
 *
 * @param {String|Array} s
 * @return {Object}
 */
function parse(s) {
    var a = [],
        x = [];

    if (typeof s === 'string') {
        // if a JSON string return the object
        if (/^\{[\w\W]+\}$/.test(s)) {
            return JSON.parse(s);
        }

        // JCE MediaBox parameter format eg: title[title]
        if (/\w+\[[^\]]+\]/.test(s)) {
            var items = [];

            s.split(';').forEach(function (item) {
                var matches = item.match(/([\w]+)\[([^\]]+)\]/);

                if (matches && matches.length == 3) {
                    items.push('"' + matches[1] + '":"' + matches[2] + '"');
                }
            });

            return JSON.parse('{' + items.join(',') + '}');
        }

        if (s.indexOf('=') !== -1) {
            // if url
            if (s.indexOf('&') !== -1) {
                x = s.split(/&(amp;)?/g);
            } else {
                x.push(s);
            }
        }
    }

    // if array
    if (Array.isArray(s)) {
        x = s;
    }

    x.forEach(function (n) {
        if (n) {
            n = n.replace(/^([^\[]+)(\[|=|:)([^\]]*)(\]?)$/, function (match, b, c, d) {
                if (d) {
                    if (!/[^0-9]/.test(d)) {
                        return '"' + b + '":' + parseInt(d);
                    }

                    return '"' + b + '":"' + Entities.encode(d.trim()) + '"';
                }
                return '';
            });

            if (n) {
                a.push(n);
            }
        }
    });

    return JSON.parse('{' + a.join(',') + '}');
}

export default {
    parse: parse
};
