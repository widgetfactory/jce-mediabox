/**
 * Addons
 * @param {Object} $ mediabox/dom/DomQuery
 * @param {Object} JSON mediabox/util/JSON
 * @param {Object} Entities mediabox/util/Entities
 * @returns {mediabox/Addons}
 */
(function ($, Entities) {
    var Parameter = {
        parse: function (s) {
            var a = [],
                x = [];

            if (typeof s === 'string') {
                // if a JSON string return the object
                if (/^\{[\w\W]+\}$/.test(s)) {
                    return $.parseJSON(s);
                }

                // JCE MediaBox parameter format eg: title[title]
                if (/\w+\[[^\]]+\]/.test(s)) {                    
                    
                    var items = [];

                    $.each(s.split(';'), function(i, item) {
                        var matches = item.match(/([\w]+)\[([^\]]+)\]/);

                        if (matches && matches.length == 3) {
                            items.push('"' + matches[1] + '":"' + matches[2] + '"');
                        }
                    });                   

                    return $.parseJSON('{' + items.join(',') + '}');
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
            if ($.isArray(s)) {
                x = s;
            }

            $.each(x, function (i, n) {
                if (n) {
                    n = n.replace(/^([^\[]+)(\[|=|:)([^\]]*)(\]?)$/, function (a, b, c, d) {
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

    window.WfMediabox.Parameter = Parameter;
})(jQuery, WfMediabox.Entities);