/**
 * MediaBox
 */

import Env from './Env.js';
import Entities from './Entities.js';
import Tools from './Tools.js';
import Dom from './Dom.js';
import Storage from './Storage.js';
import Theme from './Theme.js';
import Plugin from './Plugin.js';
import Svg from './Svg.js';
import Mimetype from './Mime.js';
import Parameter from './Parameter.js';
import Convert from './Convert.js';
import { settings, getSite, setSite } from './Config.js';

// array of popup links / objects
let popups = [];

// the matched link / area elements
let elements = [];

// array of popup items in the group currently open
let items = [];

// current position within items
let index = 0;

// the link that opened the popup
let activator = null;

let autoplayInterval;

// the numbers markup captured from the theme, was $(...).data('html')
let numbersTemplate = '';

// unbind functions for everything bound while a popup is open, replacing the
// jQuery .wf-mediabox event namespace
let boundListeners = [];

// unbind function for the tab trap, rebound on every change
let tabTrapUnbind = null;

function stopEvents(e) {
    if (e.target && e.target.closest) {

        if (e.target.closest('.wf-mediabox')) {
            return;
        }
    }

    e.stopPropagation();
}

// Workaround for Gantry menu weirdness that captures click / touch events which cancel the menu
function bindStopEvents(el, on) {
    if (!el) {
        return;
    }

    var types = ['click', 'mousedown', 'mouseup', 'pointerdown', 'pointerup', 'touchstart', 'touchend'];

    types.forEach(function (type) {
        if (on) {
            el.addEventListener(type, stopEvents, true); // capture
        } else {
            el.removeEventListener(type, stopEvents, true);
        }
    });
}

function scrollIntoView(el) {
    if (typeof el === 'string') {
        el = Dom.query(el);
    }

    if (!el) {
        return;
    }

    var supported = 'scrollBehavior' in document.documentElement.style;

    if (supported) {
        try {
            el.scrollIntoView({
                block: "center"
            });

            return;
        } catch (e) { }
    }

    // fallback to manual calculation
    var rect = el.getBoundingClientRect();
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var boxCenter = rect.top + scrollTop + (rect.height / 2);
    var windowCenter = window.innerHeight / 2;

    window.scrollTo(0, boxCenter - windowCenter);
}

/**
 * Return the svg markup for an icon
 * @param {String} name
 * @param {Object} attribs
 * @return {String}
 */
function getSVGIcon(name, attribs) {
    return Svg.get(name, attribs);
}

/**
 * Register a theme
 * @param {String} name
 * @param {Function} theme
 */
function addTheme(name, theme) {
    return Theme.add(name, theme);
}

/**
 * Resolve the Site Base URL from the configured base
 * @return {String|null} Site Base URL
 */
function resolveSite() {
    var base = settings.base || "";

    if (base) {
        // Get document location
        var site = document.location.href;
        // Split into port (http) and location
        var parts = site.split(':\/\/');

        var port = parts[0];
        var url = parts[1];

        // Get url part before base
        if (url.indexOf(base) !== -1) {
            url = url.substr(0, url.indexOf(base));
            // Get url part before first slash
        } else {
            url = url.substr(0, url.indexOf('/')) || url;
        }
        // Return full url
        return port + '://' + url + base;
    }

    // Can't get site URL!
    return null;
}

function isPrint() {
    var site = document.location.href;

    if (site.indexOf('&print=1') !== -1) {
        return true;
    }

    return false;
}

/**
 * Convert the legacy tooltip markup. UIkit / jQuery tooltip plugins are used when the
 * host site provides them - this is an optional integration, not a dependency.
 */
function convertTooltips() {
    Dom.queryAll('.jcetooltip, .jce_tooltip').forEach(function (el) {
        var text = el.getAttribute('title') || '',
            cls = el.getAttribute('class') || '';

        // Split tooltip text ie: title::text
        if (text.indexOf('::') !== -1) {
            var parts = text.split('::');
            text = (parts[1] || '').trim();
        } else {
            text = text.trim();
        }

        // reset title
        Dom.attr(el, 'title', text);

        // extact position if any
        var pos = /tooltip-(top|bottom|left|right)/.exec(cls);
        pos = pos ? pos[1] : 'top';

        if (window.UIkit && window.UIkit.tooltip) {
            window.UIkit.tooltip(el, { title: text, position: pos });
        } else if (window.jQuery && window.jQuery.fn && typeof window.jQuery.fn.tooltip !== 'undefined') {
            window.jQuery(el).tooltip({ 'title': text, placement: pos });
        }
    });
}

/**
 * Initializes MediaBox. This method will create a MediaBox based on various settings.
 *
 * @method init
 * @param {Object} options Settings object to be passed to MediaBox.
 * @example
 *
 * // Initializes MediaBox
 * WfMediabox.init({
 *    some_settings : 'some value'
 * });
 */
function init(options) {
    // in print mode, remove the links so they don't display
    if (isPrint()) {
        Dom.queryAll(settings.selector).forEach(function (el) {
            var parent = el.parentNode;

            if (!parent) {
                return;
            }

            while (el.firstChild) {
                parent.insertBefore(el.firstChild, el);
            }

            parent.removeChild(el);
        });

        return true;
    }

    // extend settings with passed in object
    Object.assign(settings, options);

    // normalise the transition speed so it is always a positive number of milliseconds
    settings.transition_speed = Math.max(0, parseInt(settings.transition_speed, 10) || 0);

    // get site url
    setSite(resolveSite());

    create();

    // convert legacy tooltips
    convertTooltips();

    return true;
}

/**
 * Get popup objects
 * @param {String} s Optional selector
 * @param {Object} p Optional parent element popups contained within
 * @return {Array} Array of elements
 */
function getPopups(s, p) {
    var selector = s || settings.selector;

    return Dom.queryAll(selector, p).filter(function (el) {
        return el.matches('a[href], area[href], a[data-mediabox-content]');
    });
}

/**
 * Translate popup labels
 * @param {String} s Theme HTML
 * @return {String}
 */
function translate(s) {
    var labels = settings.labels;

    if (s) {
        if (s.substr(0, 2) === '{{') {
            s = s.replace(/\{\{(\w+?)\}\}/g, function (a, b) {
                return labels[b] || a;
            });
        } else {
            s = labels[s] || s;
        }
    }

    return s;
}

/**
 * Returns a styles object from a parameter string
 * @param {String} o
 * @return {Object}
 */
function getStyles(o) {
    var x = [];

    if (!o) {
        return {};
    }

    o.split(';').forEach(function (s) {
        s = s.replace(/(.*):(.*)/, function (a, b, c) {
            return '"' + b + '":"' + c + '"';
        });

        x.push(s);
    });

    return JSON.parse('{' + x.join(',') + '}');
}

/**
 * Process autopopups
 */
function auto() {
    /**
     * Make a unique cookie ID
     * @param {string} src Element src
     * @returns {string} key
     */
    function makeID(src) {
        // use the current page URL for unique key
        var url = document.location.href;
        // base64 encode key and popup src
        var key = window.btoa(url + src);
        // remove non-word characters
        key = key.replace(/[^\w]/g, '');
        // keep it short
        key = key.substr(0, 24);

        return key;
    }

    popups.forEach(function (el, i) {
        if (!el.auto) {
            return;
        }

        if (el.auto == 'single') {
            // use element ID or base64 key
            var key = el.id || makeID(el.src);

            // get cookie
            var cookie = Storage.get('wf_mediabox_' + key + '_' + i);

            // create cookie with base64 key
            if (!cookie) {
                Storage.set('wf_mediabox_' + key + '_' + i, 1);

                // delay popup
                setTimeout(function () {
                    // start popup
                    start(el);
                }, el.delay);
            }
        } else if (el.auto == 'multiple') {
            // delay popup
            setTimeout(function () {
                // start popup
                start(el);
            }, el.delay);
        }
    });
}

/**
 * Get popup data from the data attribute or rel attribute
 * @param {object} n Element
 * @returns {object} Data object
 */
function getData(n) {
    var o = {},
        data, re = /\w+\[[^\]]+\]/;

    data = n.getAttribute('data-mediabox') || n.getAttribute('data-json');

    // try rel attribute
    if (!data) {
        var rel = n.getAttribute('rel');

        if (rel && re.test(rel)) {
            var args = [];

            rel = rel.replace(/\b((\w+)\[(.*?)\])(;?)/g, function (a, b) {
                args.push(b);
                return '';
            });
            // parse paramter string to object
            o = Parameter.parse(args) || {};

            // restore rel attribute
            Dom.attr(n, 'rel', rel || o.rel || '');

            return o;
        }
    } else {
        // remove data attributes
        n.removeAttribute('data-json');
        n.removeAttribute('data-mediabox');

        // parse paramter string to object
        if (re.test(data)) {
            o = Parameter.parse(data);
        }
    }

    // try data-mediabox attributes
    var i, attrs = n.attributes;

    for (i = attrs.length - 1; i >= 0; i--) {
        var attrName = attrs[i].name;

        if (attrName && attrName.indexOf('data-mediabox-') !== -1) {
            var attr = attrName.replace('data-mediabox-', '');
            o[attr] = attrs[i].value;
        }
    }

    return o;
}

/**
 * Process a popup link and return properties object
 * @param {Object} el Popup link element
 */
function process(el) {
    var data,
        o = {},
        group = '',
        autoType = false,
        match,
        delay = 0;

    // get src value from href attribute
    var src = el.getAttribute('href') || '';

    // not a popup link
    if (!src && !el.hasAttribute('data-mediabox-content')) {
        return;
    }

    // Legacy width/height values
    src = src.replace(/b(w|h)=([0-9]+)/g, function (s, k, v) {
        k = (k === 'w') ? 'width' : 'height';

        return k + '=' + v;
    });

    // process data
    data = getData(el) || {};

    // set title
    var title = data.title || el.title || '';

    // set caption
    var caption = data.caption || '';

    // set type
    var type = data.type || el.type || '';

    // get rel attribute value
    var rel = el.rel || '';

    // Process and cleanup rel attribute (legacy)
    if (!/\w+\[[^\]]+\]/.test(rel)) {
        var rx = 'alternate|stylesheet|start|next|prev|contents|index|glossary|copyright|chapter|section|subsection|appendix|help|bookmark|nofollow|noopener|noreferrer|licence|tag|friend';
        var lb = '(lightbox(\[(.*?)\])?)';
        var lt = '(lyte(box|frame|show)(\[(.*?)\])?)';

        group = rel.replace(new RegExp("(^|\\s+)" + rx + "|" + lb + "|" + lt + "(\\s+|$)", "g"), '').trim();
    }

    // Get AREA parameters from URL if not set
    if (el.nodeName == 'AREA') {
        if (!data) {
            data = Parameter.parse(src);
        }
        // Set AREA group
        group = group || 'AREA_ELEMENT';
        // set type
        if (!data.type) {
            if (match = /\b(ajax|iframe|image|flash|director|shockwave|mplayer|windowsmedia|quicktime|realaudio|real|divx|pdf)\b/.exec(el.className)) {
                data.type = match[0];
            }
        }
    }

    // check for auto popup in classname
    if (/autopopup-(single|multiple)/.test(el.className)) {
        autoType = /(multiple)/.test(el.className) ? 'multiple' : 'single';
    }

    // use data-mediabox-autopopup attribute if set
    autoType = autoType || data.autopopup || "";

    // get a delay value if any
    delay = data.delay || 0;

    // convert to integer
    delay = parseInt(delay);

    // convert to ms
    delay = delay * 1000;

    // get group
    if (Dom.hasClass(el, 'nogroup')) {
        group = "";
    } else {
        // get group from data object
        group = group || data.group || '';
    }

    // set width and height
    var width = data.width || settings.width;
    var height = data.height || settings.height;

    // cleanup data
    ['src', 'title', 'caption', 'group', 'width', 'height'].forEach(function (k) {
        delete data[k];
    });

    // convert to integer
    if (/!\D/.test(width)) {
        width = parseInt(width);
    }

    // convert to integer
    if (/!\D/.test(height)) {
        height = parseInt(height);
    }

    // Popup object
    Object.assign(o, {
        node: el,
        src: src,
        title: title,
        caption: caption,
        group: group,
        width: width,
        height: height,
        params: data,
        auto: autoType,
        type: type,
        delay: delay
    });

    // Remove type and update href
    src = src.replace(/&type=(ajax|text\/html|text\/xml)/, '');
    el.setAttribute('href', src);

    return o;
}

function imageIsCentered(img) {
    if (img.style.marginLeft == 'auto' && img.style.marginRight == 'auto' && img.style.display == 'block') {
        return true;
    }

    return false;
}

/**
 * Add the zoom / link icon to a popup link
 * @param {Element} el The popup link
 */
function addIcon(el) {
    var img = Dom.query('img', el);

    // check for thumbnail image and ensure this is not a File Manager file link
    if (img && !Dom.hasClass(el, 'wf_file')) {
        var styles = {};

        // add zoom image icon
        var icon = document.createElement('span');
        icon.className = 'wf-icon-zoom-image';
        Dom.setHtml(icon, getSVGIcon('search'));

        img.parentNode.insertBefore(icon, img.nextSibling);

        var flt = Dom.getStyle(img, 'float');

        // transfer float
        if (flt && flt !== "none") {
            Dom.css(img.parentNode, 'float', flt);
            // reset float
            Dom.css(img, 'float', '');

            Dom.addClass(el, 'wf-mediabox-has-float');

            var w = img.getAttribute('width');

            if (w && /%/.test(w)) {
                Dom.attr(img, 'width', img.offsetWidth);
            }
        }

        // Transfer margin, padding and border
        ['top', 'right', 'bottom', 'left'].forEach(function (pos) {
            var m = Dom.getStyle(img, 'margin-' + pos),
                p = Dom.getStyle(img, 'padding-' + pos);

            if (m && /\d/.test(m) && parseInt(m) > 0) {
                // Set margin
                Dom.css(img.parentNode, 'margin-' + pos, m);
            }

            if (p && /\d/.test(p) && parseInt(p) > 0) {
                // Set padding
                Dom.css(img.parentNode, 'padding-' + pos, p);
            }
        });

        if (imageIsCentered(img)) {
            // set max-width as image width
            styles['max-width'] = img.offsetWidth;
            // add centered class for margin:auto and display:block
            Dom.addClass(el, 'wf-mediabox-is-centered');

            // remove margins
            styles['margin-left'] = '';
            styles['margin-right'] = '';
        }

        // reset image margin, padding and border
        Dom.css(img, {
            'margin': 0,
            'padding': 0,
            'float': 'none'
        });

        // set applied styles to span
        Dom.css(img.parentNode, styles);

        // add zoom class
        Dom.addClass(el, 'wf-zoom-image');
    } else {
        var link = document.createElement('span');
        link.className = 'wf-icon-zoom-link';
        Dom.setHtml(link, getSVGIcon('link'));

        el.appendChild(link);

        var svg = Dom.query('svg', link);

        if (svg) {
            Dom.css(svg, 'fill', Dom.getStyle(el, 'color'));
        }
    }
}

/**
 * Create a popup from identifiable link or area elements
 * Load the popup theme
 * @param {Array} list Optional array of popup elements
 */
function create(list) {
    var pageload = false;

    // set pageload marker
    if (!list) {
        pageload = true;
        popups = [];

        // Converts a legacy (window) popup into an inline popup
        if (settings.legacy === 1) {
            Convert.legacy();
        }

        // Converts a lightbox popup into mediabox popup
        if (settings.lightbox === 1) {
            Convert.lightbox();
        }

        // Converts a shadowbox popup into mediabox popup
        if (settings.shadowbox === 1) {
            Convert.shadowbox();
        }
    }

    // get supplied elements or from jcepopup class
    elements = list || getPopups();

    // Iterate through all found or specified popup links
    elements.forEach(function (el, i) {
        Dom.removeClass(el, 'jcelightbox jcebox jcepopup');
        Dom.addClass(el, 'wfpopup');

        var o = process(el);

        if (!o) {
            return;
        }

        // add noopener noreferrer if target="_blank"
        if (el.getAttribute('target') === "_blank") {
            var rel = el.getAttribute('rel') || '';

            if (rel.indexOf('noopener') === -1) {
                rel += " noopener";
            }

            if (rel.indexOf('noreferrer') === -1) {
                rel += " noreferrer";
            }

            Dom.attr(el, 'rel', rel.trim());
        }

        // normalise legacy zoom / icon position classes
        var cls = el.getAttribute('class') || '';

        Dom.attr(el, 'class', cls.replace(/(zoom|icon)-(top|right|bottom|left|center)(-(top|right|bottom|left|center))?/, function (match, prefix, pos1, pos2) {
            var str = 'wf-icon-zoom-' + pos1;

            if (pos2) {
                str += pos2;
            }

            return str;
        }));

        if (settings.icons === 1 && !Dom.hasClass(el, 'noicon')) {
            addIcon(el);
        }

        // skip pdf files on iOS
        if (Env.ios && (/\.pdf$/i.test(o.src) || o.type === 'pdf')) {
            Dom.attr(el, { 'target': '_blank', 'rel': 'noopener noreferrer', 'type': 'application/pdf' });
            return;
        }

        // add to popups array
        popups.push(o);

        // new index if not a pageload
        var n = pageload ? i : popups.length - 1;

        // Add click event to link
        Dom.on(el, 'click', function (e) {
            e.preventDefault();

            // update the src attribute value, this allows it to be changed dynamically by javsacript
            o.src = el.getAttribute('href');

            // set as lightbox activator
            if (!o.params.skipfocus) {
                activator = el;
            }

            return start(o, n);
        });
    });

    // trigger auto if there is no existing popup
    if (!Dom.query('.wf-mediabox')) {
        auto();
    }
}

/**
 * Public popup method
 * @param {String|Object} data Popup URL string or data object or element
 * @param {String} title Popup Title
 * @param {String} group Popup Group
 * @param {String} type Popup Type, eg: image, flash, ajax
 * @param {Object} params Popup Parameters Object
 */
function open(data, title, group, type, params) {
    var i, x = 0,
        o = {}, found = false;

    if (typeof data === "string") {
        Object.assign(o, {
            'src': data,
            'title': title,
            'group': group,
            'type': type,
            'params': params || {}
        });

        // pass through width if set
        if (o.params.width) {
            o.width = o.params.width;
        }

        // pass through height if set
        if (o.params.height) {
            o.height = o.params.height;
        }

        popups.forEach(function (obj) {
            if (obj.src == o.src) {
                found = true;
            }
        });

        if (!found) {
            popups.push(o);
        }
    }

    // process as an element
    if (data && data.nodeName && (data.nodeName === 'A' || data.nodeName === 'AREA')) {
        i = elements.indexOf(data);

        if (i >= 0) {
            o = popups[i];
            x = i;
        } else {
            // process element
            o = process(data);

            // add to array
            x = popups.push(o);
            // reduce by 1
            x--;
        }
    }

    return start(o, x);
}

/**
 * Start a popup
 * @param {Object} p The popup link object
 * @param {Number} i The popup index
 */
function start(p, i) {
    var n = 0,
        group = [],
        len;

    // build popup window
    if (build()) {
        if (p.group) {
            popups.forEach(function (o, x) {
                if (o.group === p.group) {
                    len = group.push(o);

                    if (i && x === i) {
                        n = len - 1;
                    }
                }
            });

            // Triggered popup
            if (!p.auto && typeof i === "undefined") {
                group.push(p);
                n = group.length - 1;
            }
        } else {
            group.push(p);
        }

        // wait for the overlay to fade in before displaying the popup
        window.setTimeout(function () {
            return show(group, n);
        }, settings.transition_speed);

        return true;
    }

    return false;
}

/**
 * Append the svg icon named by an element's svg-icon attribute
 * @param {String} selector
 */
function appendSvgIcons(selector) {
    Dom.queryAll(selector).forEach(function (el) {
        var name = el.getAttribute('svg-icon');

        if (name) {
            Dom.append(el, getSVGIcon(name));
        }
    });
}

/**
 * Build Popup structure
 */
function build() {
    if (!Dom.query('.wf-mediabox')) {
        // Create main page object
        var page = document.createElement('div');

        page.className = 'wf-mediabox';

        Dom.attr(page, {
            'role': 'dialog',
            'aria-modal': 'true',
            'aria-labelledby': '',
            'aria-describedby': '',
            'tabindex': -1
        });

        document.body.appendChild(page);

        // add the tranistion class
        Dom.addClass(page, 'wf-mediabox-overlay-transition');

        // expose the transition speed and overlay opacity to the stylesheet
        Dom.setProp(page, '--wf-mediabox-transition-speed', settings.transition_speed + 'ms');
        Dom.setProp(page, '--wf-mediabox-overlay-opacity', parseFloat(settings.overlay_opacity) || 0.8);

        // add ie6 identifier
        if (Env.ie6) {
            Dom.addClass(page, 'ie6');
        }

        // add ios identifier
        if (Env.ios) {
            Dom.addClass(page, 'ios');
        }

        // Create overlay
        if (settings.overlay === 1) {
            var overlay = document.createElement('div');

            overlay.className = 'wf-mediabox-overlay';
            Dom.attr(overlay, 'tabindex', -1);

            page.appendChild(overlay);

            if (settings.overlay_color) {
                Dom.css(overlay, 'background-color', settings.overlay_color);
            }
        }

        // Create Frame and body with theme content
        Dom.append(page, '<div class="wf-mediabox-frame" role="document" tabindex="-1"><div class="wf-mediabox-loader" role="status" aria-label="' + translate('loading') + '" tabindex="-1"></div><div class="wf-mediabox-body" aria-hidden="true" tabindex="-1"></div></div>');

        // add theme class to page
        Dom.addClass(page, 'wf-mediabox-theme-' + settings.theme);

        // add theme data
        Theme.parse(settings.theme, translate, Dom.query('.wf-mediabox-body'));

        // hide all objects
        Dom.hide(Array.prototype.slice.call(Dom.query('.wf-mediabox-frame').children));

        // add iPad scroll fix
        if (Env.ios) {
            Dom.css(Dom.queryAll('.wf-mediabox-content'), {
                '-webkit-overflow-scrolling': 'touch',
                'overflow': 'auto'
            });
        }

        // Add close function to frame on click
        if (settings.close === 2) {
            Dom.on(Dom.query('.wf-mediabox-frame'), 'click', function (e) {
                if (e.target && e.target === this) {
                    close();
                }
            });
        }

        // Setup Close link and Cancel link event
        Dom.queryAll('.wf-mediabox-close, .wf-mediabox-cancel').forEach(function (el) {
            Dom.on(el, 'click', function (e) {
                e.preventDefault();
                close();
            });

            Dom.attr(el, 'tabindex', 0);
        });

        // Setup Next link event
        Dom.queryAll('.wf-mediabox-next').forEach(function (el) {
            Dom.on(el, 'click', function (e) {
                e.preventDefault();
                nextItem();
            });

            Dom.attr(el, 'tabindex', 0);
        });

        // Setup Previous link event
        Dom.queryAll('.wf-mediabox-prev').forEach(function (el) {
            Dom.on(el, 'click', function (e) {
                e.preventDefault();
                previousItem();
            });

            Dom.attr(el, 'tabindex', 0);
        });

        // Setup Expand / Collapse icon
        Dom.attr(Dom.queryAll('.wf-mediabox-expand'), 'tabindex', 0);

        appendSvgIcons('.wf-mediabox-close, .wf-mediabox-cancel, .wf-mediabox-next, .wf-mediabox-prev, .wf-mediabox-expand');

        // store html
        var numbers = Dom.query('.wf-mediabox-numbers');

        if (numbers) {
            numbersTemplate = numbers.innerHTML;
            Dom.attr(numbers, 'aria-hidden', true);
        }

        // force a reflow so the overlay transitions from opacity 0 rather than jumping to the target opacity
        Dom.reflow(page);

        // add transition class, fading the overlay in to --wf-mediabox-overlay-opacity
        Dom.addClass(page, 'wf-mediabox-open');
    }

    return true;
}

/**
 * Show the popup window
 * @param {Array} list Array of popup objects
 * @param {Number} n Index of current popup
 */
function show(list, n) {
    items = list;

    bind(true);

    // Show popup
    Dom.show(Dom.query('.wf-mediabox-body'));

    Dom.addClass(Dom.query('.wf-mediabox'), 'wf-mediabox-transition-scale');

    return change(n);
}

/**
 * Create event / key bindings
 * @param {Boolean} open Whether popup is opened or closed
 */
function bind(isOpen) {
    var page = Dom.query('.wf-mediabox');

    if (isOpen) {
        bindStopEvents(page, true);

        boundListeners.push(Dom.on(document, 'keydown', addListener));

        if (settings.swipe !== false) {
            var xDown, yDown;
            var body = Dom.query('.wf-mediabox-body');

            // touch events
            boundListeners.push(Dom.on(body, 'touchstart', function (e) {
                // single finger swipe only
                if (e.touches.length !== 1 || items.length === 1) {
                    return;
                }

                xDown = e.touches[0].clientX;
                yDown = e.touches[0].clientY;
            }));

            boundListeners.push(Dom.on(body, 'touchmove', function (e) {
                if (!xDown || !yDown) {
                    return;
                }
                // single finger swipe only
                if (e.touches.length !== 1 || items.length === 1) {
                    return;
                }

                var xUp = e.touches[0].clientX;
                var yUp = e.touches[0].clientY;

                var xDiff = xDown - xUp;
                var yDiff = yDown - yUp;

                if (Math.abs(xDiff) > Math.abs(yDiff)) {
                    /*most significant*/
                    if (xDiff > 0) {
                        nextItem();
                    } else {
                        previousItem();
                    }

                    e.preventDefault();
                }
                /* reset values */
                xDown = null;
                yDown = null;
            }));
        }

        var lastLayoutWidth = window.innerWidth;

        var onResize = Tools.debounce(function () {
            var currentLayoutWidth = window.innerWidth;

            // Ignore pinch-zoom (which changes visualViewport but NOT innerWidth)
            if (currentLayoutWidth !== lastLayoutWidth) {
                lastLayoutWidth = currentLayoutWidth;

                var popup = items[index];

                if (!popup) {
                    return;
                }

                updateBodyWidth(popup);
            }
        }, 150);

        boundListeners.push(Dom.on(window, 'resize orientationchange', onResize));

        // slideshow
        if (settings.autoplay) {
            autoplayInterval = setInterval(function () {
                if (nextItem() === false) {
                    clearInterval(autoplayInterval);
                }
            }, settings.autoplay * 1000);
        }
    } else {
        bindStopEvents(page, false);

        // remove everything bound while open
        boundListeners.forEach(function (unbind) {
            unbind();
        });

        boundListeners = [];

        if (tabTrapUnbind) {
            tabTrapUnbind();
            tabTrapUnbind = null;
        }

        window.clearInterval(autoplayInterval);
    }
}

function updateBodyWidth(popup) {
    var ww = window.innerWidth;
    var wh = window.visualViewport ? window.visualViewport.height : window.innerHeight; // can't rely on window height as it doesn't work in iOS Safari

    var iosBuffer = Env.ios ? 40 : 0; // iOS Safari has a bug where the height is not correct when the address bar is visible

    var frame = Dom.query('.wf-mediabox-frame');

    if (!frame || Dom.hasClass(frame, 'wf-mediabox-fullscreen')) {
        return;
    }

    var pl = parseInt(Dom.getStyle(frame, 'padding-left'), 10) || 0;
    var pt = parseInt(Dom.getStyle(frame, 'padding-top'), 10) || 0;

    var container = Dom.query('.wf-mediabox-container');
    var cInset = (parseInt(Dom.getStyle(container, 'padding-left'), 10) || 0) + (parseInt(Dom.getStyle(container, 'border-left-width'), 10) || 0);

    // frame width - padding on both sides. Calculated from window dimensions due to iOS viewport bug
    var fw = ww - pl * 2 - cInset * 2; // frame width minus frame and container padding/border
    var fh = wh - pt * 2; // frame height - window height - padding

    var w = Tools.parseWidth(popup.width);
    var h = Tools.parseHeight(popup.height || fh);

    var body = Dom.query('.wf-mediabox-body');
    var content = Dom.query('.wf-mediabox-content');
    var contentItem = Dom.query('.wf-mediabox-content-item');

    if (settings.display_mode == 'scroll' && contentItem && contentItem.offsetHeight > fh && w) {
        Dom.addClass(frame, 'wf-mediabox-scrolling');

        Dom.css(body, 'max-width', Math.min(w, fw));
    }

    if (Dom.hasClass(frame, 'wf-mediabox-scrolling')) {
        return;
    }

    if (Dom.hasClass(content, 'wf-mediabox-content-ratio-flex')) {
        var modh = body.offsetHeight - content.offsetHeight;
        h = Math.min(h, fh);
        var totalModH = modh + (wh - h) + iosBuffer;
        Dom.css(contentItem, 'height', (wh - totalModH) + 'px');
    }

    var dim = Tools.resize(w, h, fw, fh);
    var bw = dim.width + cInset * 2; // body width = image content width + container padding/border on each side
    Dom.css(body, 'max-width', bw);

    var bh = body.offsetHeight;
    var ratio;

    if (fw > fh) {
        ratio = (bw / bh).toFixed(1);

        if (bh > fh) {
            bw = ratio * fh - 32;
            Dom.css(body, 'max-width', bw);
        }
    } else {
        ratio = (bh / bw).toFixed(1);

        if (bh > fh) {
            ratio = (bw > bh) ? (bh / bw).toFixed(1) : (bw / bh).toFixed(1);

            while (bh > fh && bw > 260) {
                bh = ratio * bw;
                bw = bw - 1;
            }

            Dom.css(body, 'max-width', bw);
        }
    }

    if (settings.scrolling === "scroll") {
        scrollIntoView('.wf-mediabox-body');
    }
}

/**
 * Keyboard listener
 * @param {Object} e Event
 */
function addListener(e) {
    switch (e.keyCode) {
        case 27:
            close();
            break;
        case 37:
            previousItem();
            break;
        case 39:
            nextItem();
            break;
    }
}

/**
 * Process a popup in the group queue
 *
 * change() is called synchronously on purpose. Removing wf-mediabox-transition puts
 * the body back to opacity 0 / scale 0.9, and the class is only re-added from the
 * load handler in animate() a task or more later, so the fade out still renders.
 *
 * @param {Number} n Queue position
 */
function queue(n) {
    Dom.removeClass(Dom.query('.wf-mediabox-body'), 'wf-mediabox-transition');

    return change(n);
}

/**
 * Process the next popup in the group
 */
function nextItem() {
    if (items.length === 1) {
        return false;
    }

    var n = index + 1;

    if (n < 0 || n >= items.length) {
        return false;
    }

    return queue(n);
}

/**
 * Process the previous popup in the group
 */
function previousItem() {
    if (items.length === 1) {
        return false;
    }

    var n = index - 1;

    if (n < 0 || n >= items.length) {
        return false;
    }

    return queue(n);
}

/**
 * Set the popup information (caption, title, numbers)
 */
function info() {
    var popup = items[index];

    // remove existing focus
    Dom.removeClass(Dom.queryAll('.wf-mediabox-focus'), 'wf-mediabox-focus');

    var content = Dom.query('.wf-mediabox-content');

    // download - remove existing
    Dom.remove(Dom.queryAll('a[download]', content));

    if (popup.params.download) {
        var download = document.createElement('a');

        Dom.attr(download, {
            'href': popup.src,
            'target': '_blank',
            'download': ''
        });

        Dom.setHtml(download, translate('download'));

        content.appendChild(download);
    }

    // Optional Element Caption/Title
    var caption = Dom.query('.wf-mediabox-caption');

    if (caption) {
        var title = popup.title || '',
            text = popup.caption || '',
            h = '';

        var ex = /([-!#$%&\'\*\+\\./0-9=?A-Z^_`a-z{|}~]+@[-!#$%&\'\*\+\\/0-9=?A-Z^_`a-z{|}~]+\.[-!#$%&\'*+\\./0-9=?A-Z^_`a-z{|}~]+)/gi;

        // simple URL matching without any concern for correct syntax, eg: http://something_not_a_space
        var ux = /([a-zA-Z]{3,9}:\/\/[^\s]+)/gi;

        function processRe(s) {
            s = s.replace(ex, '<a href="mailto:$1" target="_blank">$1</a>');
            s = s.replace(ux, '<a href="$1" target="_blank">$1</a>');

            return s;
        }

        // decode title
        title = Entities.decode(title);
        // decode text
        text = Entities.decode(text);

        // get title / caption from popup title
        if (title.indexOf('::') !== -1) {
            var parts = title.split('::');
            title = (parts[0] || '').trim();
            text = (parts[1] || '').trim();
        }

        var page = Dom.query('.wf-mediabox');

        if (title) {
            h += '<h4 id="wf-mediabox-modal-title">' + title + '</h4>';
            // update aria-labelledby
            Dom.attr(page, 'aria-labelledby', 'wf-mediabox-modal-title');
        }

        if (text) {
            h += '<p id="wf-mediabox-modal-description">' + text + '</p>';
            // update aria-describedby
            Dom.attr(page, 'aria-describedby', 'wf-mediabox-modal-description');
        }

        // set caption html (may be empty)
        Dom.setHtml(caption, h);
        Dom.addClass(caption, 'wf-mediabox-caption-hidden');

        if (h) {
            // Process e-mail and urls
            Dom.queryAll('*', caption).forEach(function (el) {
                if (el.nodeName === 'A') {
                    return;
                }

                var s = el.innerHTML;

                // contains a link but is not already html
                if (s && /(@|:\/\/)/.test(s) && s.indexOf('<') === -1) {
                    s = processRe(s);

                    if (s) {
                        Dom.setHtml(el, s);
                    }
                }
            });
        }
    }

    // Optional Element
    var len = items.length;
    var numbers = Dom.query('.wf-mediabox-numbers');

    if (numbers && len > 1) {
        var html = numbersTemplate || "{{numbers}}";

        if (html.indexOf('{{numbers}}') !== -1) {
            Dom.empty(numbers);

            var ol = document.createElement('ol');
            numbers.appendChild(ol);

            for (let i = 0; i < len; i++) {
                var n = i + 1;
                var label = items[i].title || n;

                // Create Numbers link
                var link = document.createElement('button');

                link.className = 'wf-mediabox-number';

                Dom.attr(link, {
                    'aria-label': label,
                    'tabindex': 0
                });

                Dom.setHtml(link, String(n));

                if (index === i) {
                    Dom.addClass(link, 'active');
                }

                var li = document.createElement('li');
                li.appendChild(link);
                ol.appendChild(li);

                // add click event
                Dom.on(link, 'click', function () {
                    if (index == i) {
                        return false;
                    }

                    return queue(i);
                });
            }
        }

        if (html.indexOf('{{current}}') !== -1) {
            Dom.setHtml(numbers, html.replace('{{current}}', index + 1).replace('{{total}}', len));
        }

        Dom.attr(numbers, 'aria-hidden', false);
    } else if (numbers) {
        Dom.empty(numbers);
        Dom.attr(numbers, 'aria-hidden', true);
    }

    // show info
    Dom.show(Dom.queryAll('.wf-mediabox-info-top, .wf-mediabox-info-bottom'));

    // Show / Hide Previous and Next buttons
    var next = Dom.query('.wf-mediabox-next');
    var prev = Dom.query('.wf-mediabox-prev');

    Dom.hide([next, prev].filter(Boolean));
    Dom.attr([next, prev].filter(Boolean), 'aria-hidden', true);

    if (len > 1) {
        if (index > 0) {
            Dom.show(prev);
            Dom.attr(prev, 'aria-hidden', false);
            Dom.addClass(prev, 'wf-mediabox-focus');
        } else {
            Dom.hide(prev);
            Dom.attr(prev, 'aria-hidden', true);
        }

        if (index < len - 1) {
            Dom.show(next);
            Dom.attr(next, 'aria-hidden', false);
            Dom.addClass(next, 'wf-mediabox-focus');
        } else {
            Dom.hide(next);
            Dom.attr(next, 'aria-hidden', true);
        }
    } else {
        // add focus to close button
        Dom.addClass(Dom.query('.wf-mediabox-close'), 'wf-mediabox-focus');
    }

    if (popup.params.css) {
        Dom.addClass(Dom.query('.wf-mediabox-body'), popup.params.css);
    }

    // thumbnails
    var thumbnails = Dom.query('.wf-mediabox-thumbnails');

    if (thumbnails && len > 1) {
        Dom.empty(thumbnails);

        items.forEach(function (item, i) {
            var img = document.createElement('img');

            img.className = 'loading';
            Dom.attr(img, 'src', item.src);

            Dom.on(img, 'click', function () {
                return queue(i);
            });

            Dom.toggleClass(img, 'active', index == i);

            Dom.on(img, 'load', function () {
                Dom.removeClass(img, 'loading');
            });

            thumbnails.appendChild(img);
        });
    }
}

/**
 * Change the popup
 * @param {Number} n Popup number
 */
function change(n) {
    var popup;

    if (n < 0 || n >= items.length) {
        return false;
    }

    // set current popup index
    index = n;

    // Show Container, Loader, Cancel
    Dom.show(Dom.queryAll('.wf-mediabox-container, .wf-mediabox-cancel'));

    // set loader
    var page = Dom.query('.wf-mediabox');

    Dom.addClass(page, 'wf-mediabox-loading');
    Dom.attr(Dom.queryAll('.wf-mediabox-loader', page), 'aria-hidden', false);

    // get current popup item
    popup = items[n];

    var type = "error";
    var html = "";

    // get plugin for this media type
    var plugin = Plugin.getPlugin(popup);

    // Get parameters from addon
    if (plugin) {
        html = plugin.html(popup);
        type = plugin.type;

        // pass plugin width to popup
        if (!popup.width && plugin.width) {
            popup.width = plugin.width;
        }

        // pass plugin height to popup
        if (!popup.height && plugin.height) {
            popup.height = plugin.height;
        }

        popup.type = type;
    }

    // update classes
    var content = Dom.query('.wf-mediabox-content');

    content.className = 'wf-mediabox-content';
    Dom.addClass(content, 'wf-mediabox-content-' + type);
    Dom.css(content, 'height', '');

    // pass through plugin html to popup
    popup.html = html;

    // re-set with updated parameters
    items[n] = popup;

    setup();

    return false;
}

/**
 * Pre-animation setup. Resize images, set width / height
 */
function setup() {
    // Setup info
    info();

    if (Env.ie) {
        Dom.css(Dom.queryAll('.wf-mediabox-content img'), '-ms-interpolation-mode', 'bicubic');
    }

    var tabIndex = 0;
    var page = Dom.query('.wf-mediabox');

    // rebound on every change, so drop the previous handler first
    if (tabTrapUnbind) {
        tabTrapUnbind();
    }

    tabTrapUnbind = Dom.on(page, 'keydown', function (e) {
        // only TAB
        if (e.keyCode !== 9) {
            return;
        }

        // prevent tabbing outside the lightbox
        e.preventDefault();

        // get all visible, tabbable items
        var tabbable = Dom.queryAll('[tabindex]', page).filter(function (el) {
            return Dom.isVisible(el) && parseInt(el.getAttribute('tabindex')) >= 0;
        });

        // get index of the currently focused item
        tabbable.forEach(function (el, i) {
            if (Dom.hasClass(el, 'wf-mediabox-focus')) {
                tabIndex = i;
            }
        });

        // must be >= 0
        tabIndex = Math.max(tabIndex, 0);

        // reverse on SHIFT+TAB
        if (e.shiftKey) {
            tabIndex--;
        } else {
            tabIndex++;
        }

        // must be >= 0
        tabIndex = Math.max(tabIndex, 0);

        // if greater than the last item, then go back to 0
        if (tabIndex === tabbable.length) {
            tabIndex = 0;
        }

        Dom.removeClass(tabbable, 'wf-mediabox-focus');

        // focus the nth item
        if (tabbable[tabIndex]) {
            tabbable[tabIndex].focus();
            Dom.addClass(tabbable[tabIndex], 'wf-mediabox-focus');
        }
    });

    // Animate box
    return animate();
}

/**
 * Animate the Popup
 */
function animate() {
    // current popup
    var popup = items[index];

    var cw = popup.width || 0;
    var ch = popup.height || 0;

    var page = Dom.query('.wf-mediabox');
    var content = Dom.query('.wf-mediabox-content');
    var contentItem = Dom.query('.wf-mediabox-content-item');
    var body = Dom.query('.wf-mediabox-body');

    Dom.removeClass(content, 'wf-mediabox-broken-image wf-mediabox-broken-media');

    Dom.queryAll('.wf-icon-404', content).forEach(function (el) {
        Dom.removeClass(el, 'wf-icon-404');
        Dom.remove(Dom.queryAll('svg', el));
    });

    Dom.removeClass(Dom.query('.wf-mediabox-caption'), 'wf-mediabox-caption-hidden');

    // constrain width for ajax loading
    if (Dom.hasClass(content, 'wf-mediabox-content-ajax')) {
        Dom.css(body, 'max-width', 640);
    }

    // create loader cache
    var cache = document.createElement('div');
    cache.className = 'wf-mediabox-cache';

    var loadTime = new Date().getTime(), speed = settings.transition_speed;

    if (popup.type == 'iframe' || popup.type == 'ajax' || popup.type == 'dom') {
        Dom.setHtml(contentItem, popup.html);
    } else {
        Dom.setHtml(cache, popup.html);
        page.appendChild(cache);
    }

    function itemLoaded(node) {
        // append media element to popup content if it isn't an iframe (iframe will reload if appended)
        if (!node || node.nodeName !== "IFRAME") {
            Dom.setHtml(contentItem, popup.html);
        }

        // update loader
        Dom.removeClass(page, 'wf-mediabox-loading');
        Dom.attr(Dom.queryAll('.wf-mediabox-loading', page), 'aria-hidden', true);

        // remove padding
        Dom.css(contentItem, 'padding-bottom', '');

        // trigger display
        Dom.addClass(page, 'wf-mediabox-show');

        // Show Information
        Dom.addClass(Dom.queryAll('.wf-mediabox-info-top, .wf-mediabox-info-bottom'), 'wf-info-show');

        if (node && node.nodeName === "IMG") {
            // use passed in width or the images actual width, whichever is less
            cw = cw || node.naturalWidth || node.width;
            ch = ch || node.naturalHeight || node.height;

            // parse to integer value
            cw = Tools.parseWidth(cw);
            ch = Tools.parseWidth(ch);

            // store width
            popup.width = cw;
            // store height
            popup.height = ch;
        } else {
            if (node && node.nodeName === "VIDEO") {
                cw = cw || node.videoWidth || 0;
                ch = ch || node.videoHeight || 0;
            }

            // a default width
            cw = cw || 640;

            // check for 4:3 aspect ratio, otherwise assume 16:9
            if (cw && ch) {
                // process passed in values
                var w = Tools.parseWidth(cw);
                var h = Tools.parseHeight(ch);

                var ratio = parseFloat((h / w).toFixed(2));

                // force 16:9 ratio for video
                if (node && node.matches('.wf-mediabox-iframe-video, .wf-mediabox-video, .wf-mediabox-audio')) {
                    ratio = 0.56;
                }

                if (ratio === 0.75) {
                    Dom.addClass(content, 'wf-mediabox-content-ratio-4by3');
                } else if (ratio !== 0.56) {
                    Dom.addClass(content, 'wf-mediabox-content-ratio-flex');
                }
            }

            Dom.addClass(contentItem, 'wf-mediabox-content-ratio');

            // store width
            popup.width = cw;
        }

        // update popup width
        updateBodyWidth(popup);

        Dom.addClass(body, 'wf-mediabox-transition');
        Dom.attr(body, 'aria-hidden', false);

        if (!node) {
            return;
        }

        // focus iframe window
        if (node.nodeName === 'IFRAME') {
            setTimeout(function () {
                node.contentWindow.focus();
            }, 10);
        }

        // force autoplay in IE11
        if (node.nodeName === 'VIDEO' || node.nodeName === 'AUDIO') {
            if (Env.ie && node.autoplay) {
                node.play();
            }
        }

        // trigger custom load event
        Dom.trigger(node, 'mediabox:load');

        // update body width on resize event
        Dom.on(node, 'mediabox:resize', function () {
            updateBodyWidth(popup);
        });
    }

    function itemError(node) {
        // remove loader cache
        Dom.remove(cache);

        Dom.removeClass(page, 'wf-mediabox-loading');

        Dom.addClass(content, node && node.nodeName === "IMG" ? 'wf-mediabox-broken-image' : 'wf-mediabox-broken-media');

        Dom.addClass(body, 'wf-mediabox-transition');
        Dom.css(body, 'max-width', '');
        Dom.attr(body, 'aria-hidden', false);

        Dom.addClass(page, 'wf-mediabox-show');

        Dom.queryAll('.wf-mediabox-content > div').forEach(function (el) {
            Dom.addClass(el, 'wf-icon-404');
            Dom.setHtml(el, getSVGIcon('404'));
        });
    }

    if (popup.type == 'dom') {
        // Fallback: Trigger itemLoaded after 5 seconds if not triggered by event
        setTimeout(function () {
            itemLoaded(null);
        }, 0);

        return;
    }

    var nodes = Dom.queryAll('img, video, audio, object, embed', cache)
        .concat(Dom.queryAll('iframe', content));

    nodes.forEach(function (node) {
        var hasTriggered = false;

        // Function to handle the itemLoaded logic
        function triggerItemLoaded() {
            if (!hasTriggered) {
                hasTriggered = true; // Mark as triggered
                itemLoaded(node);
            }
        }

        // Attempt to trigger itemLoaded on load, loadedmetadata, or handle error event
        Dom.once(node, 'load loadedmetadata error', function (e) {
            loadTime = new Date().getTime() - loadTime;

            // Wait out the remainder of the out-transition (the overlay fade on open, the body fade
            // on gallery navigation) before revealing the item. With transition_speed 0 this is 0.
            var delay = Math.max(0, speed - loadTime);

            setTimeout(function () {
                if (e.type === 'error') {
                    hasTriggered = true;
                    itemError(node);
                } else {
                    triggerItemLoaded();
                }
            }, delay);
        });

        // Fallback: Trigger itemLoaded after 5 seconds if not triggered by event
        setTimeout(function () {
            triggerItemLoaded();
        }, 5000);
    });
}

/**
 * Close the popup window. Destroy all objects
 * @param {Boolean} keepopen Leave the overlay in place
 */
function close(keepopen) {
    var page = Dom.query('.wf-mediabox');

    if (!page) {
        return false;
    }

    var transitionDuration = settings.transition_speed;

    // Destroy objects after delay
    Dom.removeClass(Dom.query('.wf-mediabox-body'), 'wf-mediabox-transition');

    setTimeout(function () {
        var contentItem = Dom.query('.wf-mediabox-content-item');

        if (contentItem) {
            // remove iframe src
            Dom.attr(Dom.queryAll('iframe, video', contentItem), 'src', '');

            Dom.empty(contentItem);
        }

        if (keepopen) {
            return;
        }

        // remove events
        bind(false);

        // hide info divs
        Dom.hide(Dom.queryAll('.wf-mediabox-info-bottom, .wf-mediabox-info-top'));

        Dom.remove(Dom.query('.wf-mediabox-frame'));

        // fade the overlay back out to opacity 0
        Dom.removeClass(page, 'wf-mediabox-open wf-mediabox-show');

        setTimeout(function () {
            Dom.remove(page);

            Dom.removeClass(document.body, 'wf-mediabox-scrolling');
        }, settings.transition_speed);

        // restore focus to the activator
        if (activator) {
            activator.focus();
        }
    }, transitionDuration);

    // Hide closelink
    Dom.hide(Dom.query('.wf-mediabox-close'));

    window.clearInterval(autoplayInterval);

    return false;
}

const MediaBox = {
    init: init,
    open: open,
    close: close,
    create: create,
    start: start,
    getPopups: getPopups,
    getSite: getSite,
    translate: translate,
    getStyles: getStyles,
    nextItem: nextItem,
    previousItem: previousItem,
    addTheme: addTheme,
    getSVGIcon: getSVGIcon,

    settings: settings,

    Env: Env,
    Tools: Tools,
    Dom: Dom,
    Storage: Storage,
    Entities: Entities,
    Parameter: Parameter,
    Convert: Convert,
    Mimetype: Mimetype,
    Theme: Theme,
    Plugin: Plugin
};

// Plugins.js reads WfMediabox.site, so keep it in step with Config
Object.defineProperty(MediaBox, 'site', {
    get: getSite
});

// Export MediaBox as WfMediabox/jcepopup in global namespace
window.WfMediabox = window.jcepopup = MediaBox;

export default MediaBox;
