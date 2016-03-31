/**
 * Addons
 * @param {Object} $ mediabox/dom/DomQuery
 * @param {Object} JSON mediabox/util/JSON
 * @param {Object} Entities mediabox/util/Entities
 * @returns {mediabox/Addons}
 */
(function($, Entities) {
    var Parameter = {
        parse : function(s) {
            var a = [], x = [];

            if (typeof s === 'string') {
                // if a JSON string return the object
                if (/^\{[\w\W]+\}$/.test(s)) {
                    return $.parseJSON(s);
                }

                // JCE MediaBox parameter format eg: title[title]
                if (/\w+\[[^\]]+\]/.test(s)) {
                    s = s.replace(/([\w]+)\[([^\]]+)\](;)?/g, function(a, b, c, d) {

                        return '"' + b + '":"' + Entities.encode($.trim(c)) + '"' + (d ? ',' : '');
                    });

                    return $.parseJSON('{' + s + '}');
                }

                // if url
                if (s.indexOf('&') !== -1) {
                    x = s.split(/&(amp;)?/g);
                } else {
                    x.push(s);
                }
            }

            // if array
            if ($.isArray(s)) {
                x = s;
            }

            $.each(x, function(n, i) {
                if (n) {
                    n = n.replace(/^([^\[]+)(\[|=|:)([^\]]*)(\]?)$/, function(a, b, c, d) {
                        if (d) {
                            if (!/[^0-9]/.test(d)) {
                                return '"' + b + '":' + parseInt(d);
                            }

                            return '"' + b + '":"' + Entities.encode($.trim(d)) + '"';
                        }
                        return '';
                    });

                    if (n) {
                        a.push(n);
                    }
                }
            });

            return $.parseJSON('{' + a.join(',') + '}');
        }
    };

    window.MediaBox.Parameter = Parameter;
})(jQuery, MediaBox.Entities);
