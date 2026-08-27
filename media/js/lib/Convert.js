import Parameter from './Parameter.js';
import Dom from './Dom.js';
import { getSite } from './Config.js';

/**
 * Convert legacy popups to new format
 */
function legacy() {
    Dom.queryAll('a[href]').forEach(function (el) {
        // Only JCE Popup links
        if (!/com_jce/.test(el.href)) {
            return;
        }

        var p, s, img = '', title = '';
        var oc = el.getAttribute('onclick');

        if (oc) {
            s = oc.replace(/&#39;/g, "'").split("'");
            p = Parameter.parse(s[1]);

            img = p.img || '';
            title = p.title || '';
        }

        if (img) {
            if (!/http:\/\//.test(img)) {
                if (img.charAt(0) === '/') {
                    img = img.substr(1);
                }

                img = getSite().replace(/http:\/\/([^\/]+)/, '') + img;
            }

            Dom.attr(el, {
                'href': img,
                'title': title.replace(/_/, ' '),
                'onclick': ''
            });

            Dom.addClass(el, 'jcepopup');
        }
    });
}

/**
 * Convert lightbox popups to MediaBox
 */
function lightbox() {
    Dom.queryAll('a[rel*=lightbox]').forEach(function (el) {
        Dom.addClass(el, 'jcepopup');

        var r = el.rel.replace(/lightbox\[?([^\]]*)\]?/, function (a, b) {
            if (b) {
                return 'group[' + b + ']';
            }

            return '';
        });

        Dom.attr(el, 'rel', r);
    });
}

/**
 * Convert shadowbox popups to MediaBox
 */
function shadowbox() {
    Dom.queryAll('a[rel*=shadowbox]').forEach(function (el) {
        Dom.addClass(el, 'jcepopup');

        var r = el.rel.replace(/shadowbox\[?([^\]]*)\]?/, function (a, b) {
            var attribs = '', group = '';

            // group
            if (b) {
                group = 'group[' + b + ']';
            }

            // attributes
            if (/;=/.test(a)) {
                attribs = a.replace(/=([^;"]+)/g, function (x, z) {
                    return '[' + z + ']';
                });
            }

            if (group && attribs) {
                return group + ';' + attribs;
            }

            return group || attribs || '';
        });

        Dom.attr(el, 'rel', r);
    });
}

export default {
    legacy: legacy,
    lightbox: lightbox,
    shadowbox: shadowbox
};
