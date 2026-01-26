import Env from './Env.js';
import Entities from './Entities.js';
import Tools from './Tools.js';
import Storage from './Storage.js';
import Theme from './Theme.js';
import Svg from './Svg.js';
import Plugins from './Plugins.js';

/*var supportsES6 = function () {
    try {
        new Function('let foo; const bar = 2; (a = 0) => a; `template string`');
        return true;
    } catch (e) {
        return false;
    }
};

if (!supportsES6()) {
    throw new Error('Mediabox will not work in this browser!');
}*/

var autoplayInterval;

function scrollIntoView(el) {
    if (typeof el === 'string') {
        el = document.querySelector(el);
    }

    if (!el) {
        return;
    }

    var supported = 'scrollBehavior' in document.documentElement.style;

    if (supported) {
        try {
            el.scrollIntoView({ block: 'center' });
            return;
        }
        catch (e) { }
    }

    var rect = el.getBoundingClientRect();
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var boxCenter = rect.top + scrollTop + (rect.height / 2);
    var windowCenter = (window.innerHeight || document.documentElement.clientHeight || 0) / 2;

    window.scrollTo(0, boxCenter - windowCenter);
}

const settings = {
    selector: '.jcepopup,.wfpopup,[data-mediabox],.jcebox',
    labels: {
        "close": "Close",
        "next": "Next",
        "previous": "Previous"
    },
    convert_local_url: true,
    autoplay: 0
};

let site = '';

/**
 * Get the Site Base URL
 * @method getSite
 * @return {String} Site Base URL
 */
function getSite() {
    // already set
    if (site) {
        return site;
    }

    var base = settings.base || "";

    if (base) {
        // Get document location
        const url = document.location.href;

        // Split into port (http) and location
        var parts = url.split(':\/\/');

        var port = parts[0], path = parts[1];

        // Get url part before base
        if (path.indexOf(base) !== -1) {
            path = path.substr(0, path.indexOf(base));
            // Get url part before first slash
        } else {
            path = path.substr(0, path.indexOf('/')) || path;
        }

        // Return full url
        site = port + '://' + path + base;
    }

    return site;
}

// array of popup links / objects
var popupCollection = [];

// array of popup items
var itemCollection = [];

let currentIndex = 0;

// the link that opened the popup
let activator = null;

function isPrint() {
    const url = document.location.href;

    if (url.indexOf('&print=1') !== -1) {
        return true;
    }

    return false;
}

/**
 * Initializes MediaBox. This method will create a MediaBox based on various settings.
 *
 * @method init
 * @param {Object} settings Settings object to be passed to MediaBox.
 * @example
 *
 * // Initializes MediaBox
 * WFMediaBox.init({
 *    some_settings : 'some value'
 * });
 */
function init(options) {
    // in print mode, remove the links so they don't display
    if (isPrint()) {
        var items = document.querySelectorAll(settings.selector);

        for (var i = 0; i < items.length; i++) {
            var el = items[i];
            var parent = el.parentNode;

            if (!parent) {
                continue;
            }

            while (el.firstChild) {
                parent.insertBefore(el.firstChild, el);
            }

            parent.removeChild(el);
        }

        return true;
    }

    // extend module settings with passed in object
    Tools.extend(settings, options);

    createPopups();
    convertTooltips();

    return true;
}

function convertTooltips() {
    var items = document.querySelectorAll('.jcetooltip, .jce_tooltip');
    var hasUIkit = !!(window.UIkit && UIkit.tooltip);
    var hasjQueryTooltip = !!(window.jQuery && jQuery.fn && typeof jQuery.fn.tooltip === 'function');

    for (var i = 0; i < items.length; i++) {
        var elm = items[i];
        var text = elm.getAttribute('title') || '';
        var cls = elm.getAttribute('class') || '';
        var title = '';
        var pos;

        // Split tooltip text: title::text
        if (text.indexOf('::') !== -1) {
            var parts = text.split('::');

            title = (parts[0] || '').trim();
            text = (parts[1] || '').trim();
        }
        else {
            text = text.trim();
        }

        // reset title attribute to the tooltip body text
        elm.setAttribute('title', text);

        // extract position if any
        pos = /(?:^|\s)tooltip-(top|bottom|left|right)(?:\s|$)/.exec(cls);
        pos = pos ? pos[1] : 'top';

        if (hasUIkit) {
            // UIkit tooltip expects the element, not "this"
            UIkit.tooltip(elm, { title: text, position: pos });
        }
        else if (hasjQueryTooltip) {
            // Initialise on the element only (not the full selector each time)
            jQuery(elm).tooltip({
                title: text,
                placement: pos
            });
        }
    }
}

/**
 * Get popup objects
 * @param {String} s Optional selector
 * @param {Object} p Optional parent element popups contained within
 */
function getPopups(s, p) {
    var selector = s || settings.selector;
    var context = p || document;
    var result = [];

    if (!selector) {
        return result;
    }

    var nodes = context.querySelectorAll(selector);

    for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];

        if (
            (el.tagName === 'A' || el.tagName === 'AREA') &&
            el.hasAttribute('href')
        ) {
            result.push(el);
        }
    }

    return result;
}

/**
 * Translate popup labels
 * @param {String} str Theme HTML
 * @return {String}
 */
function translate(str) {
    var labels = settings.labels;

    if (!str || !labels) {
        return str;
    }

    // Replace {{token}} anywhere in the string
    if (str.indexOf('{{') !== -1) {
        return str.replace(/\{\{([^}]+)\}\}/g, function (a, b) {
            return labels[b] || a;
        });
    }

    // Direct key lookup
    return labels[str] || str;
}

/**
 * Returns a styles object from a CSS-style string
 * @param {String} str
 * @return {Object}
 */
function getStyles(str) {
    var obj = Object.create(null);

    if (!str || typeof str !== 'string') {
        return obj;
    }

    var values = str.split(';');

    for (var i = 0; i < values.length; i++) {
        var val = values[i].trim();

        if (!val) {
            continue;
        }

        var idx = val.indexOf(':');

        if (idx === -1) {
            continue;
        }

        var key = val.substring(0, idx).trim();
        var value = val.substring(idx + 1).trim();

        if (!key) {
            continue;
        }

        obj[key] = value;
    }

    return obj;
}

/**
 * Determine whether the url is local
 * @param {Object} s
 */
function islocal(url) {
    if (/^(\w+):\/\//.test(url)) {
        return new RegExp('^(' + Env.url + ')').test(url);
    }

    return true;
}

/**
 * Process autopopups
 */
function auto() {
    var key;

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

    for (var i = 0; i < popupCollection.length; i++) {
        var el = popupCollection[i];

        if (el.auto) {
            if (el.auto == 'single') {
                // use element ID or base64 key
                key = el.id || makeID(el.src);

                // get cookie
                var cookie = Storage.get('wf_mediabox_' + key + '_' + i);

                // create cookie with base64 key
                if (!cookie) {
                    Storage.set('wf_mediabox_' + key + '_' + i, 1);
                    start(el);
                }
            } else if (el.auto == 'multiple') {
                start(el);
            }
        }
    }
}

/**
 * Get popup data from the data attribute or rel attribute
 * @param {object} n Element
 * @returns {object} Data object
 */
function getData(n) {
    var obj = {},
        data, re = /\w+\[[^\]]+\]/;

    data = n.getAttribute('data-mediabox') || n.getAttribute('data-json') || '';

    // try rel attribute
    if (!data) {
        var rel = n.getAttribute('rel') || '';

        if (rel && re.test(rel)) {
            var args = [];

            rel = rel.replace(/\b((\w+)\[(.*?)\])(;?)/g, function (a, b, c) {
                args.push(b);
                return '';
            });

            // parse paramter string to object
            obj = Parameter.parse(args) || {};

            // restore rel attribute
            n.setAttribute('rel', rel || obj.rel || '');

            return obj;
        }
    } else {
        // remove data attributes
        n.removeAttribute('data-json');
        n.removeAttribute('data-mediabox');

        // parse paramter string to object
        if (re.test(data)) {
            obj = Parameter.parse(data);
        }
    }

    // try data-mediabox attributes
    var i, attrs = n.attributes;

    for (i = attrs.length - 1; i >= 0; i--) {
        var attrName = attrs[i].name;

        if (attrName && attrName.indexOf('data-mediabox-') !== -1) {
            var attr = attrName.replace('data-mediabox-', '');
            obj[attr] = attrs[i].value;
        }
    }

    return obj;
}

function preloadMedia() { }

/**
 * Process a popup link and return properties object
 * @param {Object} el Popup link element
 */
function processPopup(el) {
    var data, s = settings,
        o = {},
        group = '',
        auto = false,
        match;

    // get src value from href attribute
    var src = el.getAttribute('href');

    // not a popup link
    if (!src) {
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

    // skip pdf files on iOS
    if (Env.mobile && (/\.pdf$/i.test(src) || type === 'pdf')) {
        return;
    }

    // Process and cleanup rel attribute (legacy)
    if (!/\w+\[[^\]]+\]/.test(rel)) {
        var rx = 'alternate|stylesheet|start|next|prev|contents|index|glossary|copyright|chapter|section|subsection|appendix|help|bookmark|nofollow|noopener|noreferrer|licence|tag|friend';
        var lb = '(lightbox(\[(.*?)\])?)';
        var lt = '(lyte(box|frame|show)(\[(.*?)\])?)';

        group = rel.replace(new RegExp("(^|\\s+)" + rx + "|" + lb + "|" + lt + "(\\s+|$)", "g"), '', 'gi');
        group = group.trim();
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
        auto = /(multiple)/.test(el.className) ? 'multiple' : 'single';
    }

    // use data-mediabox-autopopup attribute if set
    auto = auto || data.autopopup || "";

    // get group
    if (el.classList.contains('no-group')) {
        group = "";
    } else {
        // get group from data object
        group = group || data.group || '';
    }

    // set width and height
    var width = data.width || s.width;
    var height = data.height || s.height;

    // cleanup data
    Tools.each(['src', 'title', 'caption', 'group', 'width', 'height'], function (i, k) {
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
    Tools.extend(o, {
        node: el,
        src: src,
        title: title,
        caption: caption,
        group: group,
        width: width,
        height: height,
        params: data,
        auto: auto,
        type: type
    });

    // Remove type and update href
    src = src.replace(/&type=(ajax|text\/html|text\/xml)/, '');
    el.setAttribute('href', src);

    return o;
}

/**
 * Check whether an image is visually centered using CSS
 * (margin-left:auto, margin-right:auto, display:block)
 *
 * @param {HTMLElement} img
 * @return {Boolean}
 */
function imageIsCentered(img) {
    if (!img) {
        return false;
    }

    var style = img.style;
    var computed = window.getComputedStyle ? window.getComputedStyle(img, null) : null;

    var marginLeft = style.marginLeft || (computed ? computed.marginLeft : '');
    var marginRight = style.marginRight || (computed ? computed.marginRight : '');
    var display = style.display || (computed ? computed.display : '');

    if (marginLeft === 'auto' && marginRight === 'auto' && display === 'block') {
        return true;
    }

    return false;
}

/**
 * Create a popup from identifiable link or area elements
 * Load the popup theme
 * @param {Object} elements Optional array of popup elements
 */
function createPopups(elements) {
    var pageload = false,
        auto = false;

    // set pageload marker
    if (!elements) {
        pageload = true;
        popupCollection = [];

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
    elements = elements || getPopups();

    // Iterate through all found or specified popup links
    Tools.each(elements, function (i, el) {
        el.classList.remove('jcepopup', 'jcebox', 'jcelightbox');
        el.classList.add('wfpopup');

        var item = processPopup(el);

        if (!item) {
            return true;
        }

        // add to popups array
        popupCollection.push(item);

        // new index if not a pageload
        if (!pageload) {
            i = popupCollection.length - 1;
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

            rel = rel.trim();

            // set rel attribute
            el.setAttribute('rel', rel);
        }

        var cls = el.getAttribute('class') || '';

        cls = cls.replace(/(zoom|icon)-(top|right|bottom|left|center)(-(top|right|bottom|left|center))?/, function (match, prefix, pos1, pos2) {
            var str = 'wf-icon-zoom-' + pos1;

            if (pos2) {
                str += pos2;
            }

            return str;
        });

        el.setAttribute('class', cls);

        if (settings.icons === 1 && !el.classList.contains('noicon')) {
            // Equivalent to: $('img:first', this)
            var img = el.querySelector('img');

            if (img) {
                var styles = {};
                var parent = img.parentNode;

                // Add zoom image icon after the image
                var iconImg = document.createElement('span');
                iconImg.className = 'wf-icon-zoom-image';
                iconImg.innerHTML = Svg.get('search');

                if (img.nextSibling) {
                    parent.insertBefore(iconImg, img.nextSibling);
                } else {
                    parent.appendChild(iconImg);
                }

                // Get computed style values from the image
                var imgStyle = window.getComputedStyle ? window.getComputedStyle(img, null) : img.style;

                // Transfer float
                var flt = imgStyle ? imgStyle.cssFloat || imgStyle.float : '';

                if (flt && flt !== 'none') {
                    // Apply float to parent
                    parent.style.cssFloat = flt;
                    parent.style.float = flt;

                    // Reset float on image
                    img.style.cssFloat = '';
                    img.style.float = '';

                    el.classList.add('wf-mediabox-has-float');
                }

                // Transfer margin and padding per side from image to parent
                var sides = ['top', 'right', 'bottom', 'left'];

                for (var i = 0; i < sides.length; i++) {
                    var side = sides[i];

                    var marginVal = imgStyle ? imgStyle.getPropertyValue('margin-' + side) : '';
                    var paddingVal = imgStyle ? imgStyle.getPropertyValue('padding-' + side) : '';

                    if (marginVal && /\d/.test(marginVal) && parseInt(marginVal, 10) > 0) {
                        parent.style['margin' + side.charAt(0).toUpperCase() + side.slice(1)] = marginVal;
                    }

                    if (paddingVal && /\d/.test(paddingVal) && parseInt(paddingVal, 10) > 0) {
                        parent.style['padding' + side.charAt(0).toUpperCase() + side.slice(1)] = paddingVal;
                    }
                }

                if (imageIsCentered(img)) {
                    // Set max-width as image width
                    styles['max-width'] = img.offsetWidth;

                    // Add centered class for margin:auto and display:block
                    el.classList.add('wf-mediabox-is-centered');

                    // Remove margins
                    styles['margin-left'] = '';
                    styles['margin-right'] = '';
                }

                // Reset image styles
                img.style.margin = '0';
                img.style.padding = '0';
                img.style.cssFloat = 'none';
                img.style.float = 'none';

                // Apply collected styles to parent
                for (var key in styles) {
                    if (Object.prototype.hasOwnProperty.call(styles, key)) {
                        parent.style.setProperty(key, styles[key]);
                    }
                }

                // Add zoom class
                el.classList.add('wf-zoom-image');
            } else {
                // Add zoom link icon to the link element itself
                var iconLink = document.createElement('span');
                iconLink.className = 'wf-icon-zoom-link';
                iconLink.innerHTML = Svg.get('link');

                el.appendChild(iconLink);

                // Equivalent to: .find('svg').css('fill', $(this).css('color'))
                var svg = iconLink.querySelector('svg');

                if (svg) {
                    var linkStyle = window.getComputedStyle ? window.getComputedStyle(el, null) : el.style;
                    var color = linkStyle ? linkStyle.color : '';

                    svg.style.fill = color;
                }
            }
        }

        // Add click event to link
        (function (popupItem, index, node) {
            node.addEventListener('click', function (e) {
                e.preventDefault();

                // update src dynamically
                popupItem.src = node.getAttribute('href');

                // store activator unless skipped
                if (!popupItem.params || !popupItem.params.skipfocus) {
                    activator = node;
                }

                return start(popupItem, index);
            }, false);
        }(item, i, el));
    });

    var popups = document.querySelectorAll('.wfpopup');

    // trigger auto if there is no existing popup
    if (popups.length === 0) {
        auto();
    }
}

/**
 * Public popup method
 * @param {String / Object} data Popup URL string or data object or element
 * @param {String} title Popup Title
 * @param {String} group Popup Group
 * @param {String} type Popup Type, eg: image, flash, ajax
 * @param {Object} params Popup Parameters Object
 */
function open(data, title, group, type, params) {
    var i, x = 0,
        o = {}, found = false;

    if (typeof data === "string") {
        Tools.extend(o, {
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

        Tools.each(popupCollection, function (i, obj) {
            if (obj.src == o.src) {
                found = true;
            }
        });

        if (!found) {
            popupCollection.push(o);
        }
    }

    // process as an element
    if (data && typeof data === 'object' && data.nodeName && (data.nodeName === 'A' || data.nodeName === 'AREA')) {
        var idx = -1;

        for (var j = 0; j < popupCollection.length; j++) {
            if (popupCollection[j].node === data) {
                idx = j;
                break;
            }
        }

        if (idx >= 0) {
            o = popupCollection[idx];
            x = idx;
        }
        else {
            o = processPopup(data);

            if (o) {
                x = popupCollection.push(o) - 1;
            }
        }
    }

    return start(o, x);
}

/**
 * Start a popup
 * @param {Object} p The popup link object
 * @param {Object} i The popup index
 */
function start(p, i) {
    var self = this,
        n = 0,
        items = [],
        len;

    // build popup window
    if (build()) {
        if (p.group) {
            Tools.each(popupCollection, function (x, o) {
                if (o.group === p.group) {
                    len = items.push(o);
                    if (i && x === i) {
                        n = len - 1;
                    }
                }
            });

            // Triggered popup
            if (!p.auto && typeof i === "undefined") {
                items.push(p);
                n = items.length - 1;
            }
        } else {
            items.push(p);
        }

        var overlayDuration = 0;

        var overlay = document.querySelector('.wf-mediabox-overlay');

        if (overlay) {
            overlayDuration = overlay.style.transitionDuration || overlay.style.webkitTransitionDuration;
            overlayDuration = (parseFloat(overlayDuration) * 1000) || 300;
        }

        window.setTimeout(function () {
            return show(items, n);
        }, overlayDuration);

        return true;
    }

    return false;
}

/**
 * Build Popup structure
 * @return {Boolean}
 */
function build() {
    var mediabox = document.querySelector('.wf-mediabox');

    if (!mediabox) {
        // Create main page element
        mediabox = document.createElement('div');
        mediabox.className = 'wf-mediabox';
        mediabox.setAttribute('role', 'dialog');
        mediabox.setAttribute('aria-modal', 'true');
        mediabox.setAttribute('aria-labelledby', '');
        mediabox.setAttribute('aria-describedby', '');
        mediabox.setAttribute('tabindex', '-1');

        document.body.appendChild(mediabox);

        // Add the transition class
        mediabox.classList.add('wf-mediabox-overlay-transition');

        // Add iOS identifier
        if (Env.ios) {
            mediabox.classList.add('ios');
        }

        // Create overlay
        if (settings.overlay === 1) {
            var overlay = document.createElement('div');
            overlay.className = 'wf-mediabox-overlay';
            overlay.setAttribute('tabindex', '-1');

            if (settings.overlay_color) {
                overlay.style.backgroundColor = settings.overlay_color;
            }

            mediabox.appendChild(overlay);
        }

        // Create frame / loader / body
        var frame = document.createElement('div');
        frame.className = 'wf-mediabox-frame';
        frame.setAttribute('role', 'document');
        frame.setAttribute('tabindex', '-1');

        var loader = document.createElement('div');
        loader.className = 'wf-mediabox-loader';
        loader.setAttribute('role', 'status');
        loader.setAttribute('aria-label', translate('loading'));
        loader.setAttribute('tabindex', '-1');

        var body = document.createElement('div');
        body.className = 'wf-mediabox-body';
        body.setAttribute('aria-hidden', 'true');
        body.setAttribute('tabindex', '-1');

        frame.appendChild(loader);
        frame.appendChild(body);
        mediabox.appendChild(frame);

        // Add theme class to page
        mediabox.classList.add('wf-mediabox-theme-' + settings.theme);

        // Add theme data (Theme.parse writes into .wf-mediabox-body)
        Theme.parse(settings.theme, function (key) {
            return translate(key);
        }, '.wf-mediabox-body');

        // Hide all objects inside the frame
        for (var i = 0; i < frame.children.length; i++) {
            frame.children[i].style.display = 'none';
        }

        // iPad scroll fix
        if (Env.ios) {
            var content = mediabox.querySelector('.wf-mediabox-content');

            if (content) {
                content.style.webkitOverflowScrolling = 'touch';
                content.style.overflow = 'auto';
            }
        }

        // Add close on frame click
        if (settings.close === 2) {
            frame.addEventListener('click', function (e) {
                if (e.target && e.target === frame) {
                    close();
                }
            }, false);
        }

        function appendSvgIconForSelector(selector) {
            var nodes = mediabox.querySelectorAll(selector);

            for (var j = 0; j < nodes.length; j++) {
                var el = nodes[j];

                el.setAttribute('tabindex', '0');

                var iconName = el.getAttribute('svg-icon');

                if (iconName) {
                    var wrap = document.createElement('span');
                    wrap.innerHTML = Svg.get(iconName);

                    while (wrap.firstChild) {
                        el.appendChild(wrap.firstChild);
                    }
                }
            }
        }

        // Setup Close / Cancel
        (function () {
            var nodes = mediabox.querySelectorAll('.wf-mediabox-close, .wf-mediabox-cancel');

            for (var j = 0; j < nodes.length; j++) {
                nodes[j].addEventListener('click', function (e) {
                    e.preventDefault();
                    self.close();
                }, false);
            }
        }());

        // Setup Next
        (function () {
            var nodes = mediabox.querySelectorAll('.wf-mediabox-next');

            for (var j = 0; j < nodes.length; j++) {
                nodes[j].addEventListener('click', function (e) {
                    e.preventDefault();
                    processItem(1);
                }, false);
            }
        }());

        // Setup Previous
        (function () {
            var nodes = mediabox.querySelectorAll('.wf-mediabox-prev');

            for (var j = 0; j < nodes.length; j++) {
                nodes[j].addEventListener('click', function (e) {
                    e.preventDefault();
                    processItem(-1);
                }, false);
            }
        }());

        // Append SVG icons based on svg-icon attribute (matches your .attr('svg-icon', fn) pattern)
        appendSvgIconForSelector('.wf-mediabox-close, .wf-mediabox-cancel');
        appendSvgIconForSelector('.wf-mediabox-next');
        appendSvgIconForSelector('.wf-mediabox-prev');

        // Store numbers HTML (jQuery .data('html', ...) replacement)
        var numbers = mediabox.querySelector('.wf-mediabox-numbers');

        if (numbers) {
            numbers.setAttribute('data-html', numbers.innerHTML);
            numbers.setAttribute('aria-hidden', 'true');
        }

        // Add transition class
        mediabox.classList.add('wf-mediabox-open');

        // Update overlay opacity
        var overlay2 = mediabox.querySelector('.wf-mediabox-overlay');

        if (overlay2) {
            overlay2.style.opacity = (settings.overlayopacity || 0.8);
        }
    }

    return true;
}

/**
 * Show the popup window
 * @param {Array} items Array of popup objects
 * @param {Number} n Index of current popup
 * @return {*}
 */
function show(items, n) {
    itemCollection = items;

    bindEvents(true);

    // Show popup body
    var body = document.querySelector('.wf-mediabox-body');

    if (body) {
        body.style.display = '';
    }

    // Fade in overlay
    if (settings.overlay === 1 && settings.overlay_opacity) {
        var overlay = document.querySelector('.wf-mediabox-overlay');

        if (overlay) {
            var opacity = parseFloat(settings.overlay_opacity);
            var speed = parseInt(settings.transition_speed, 10) || 0;

            // Start from 0
            overlay.style.opacity = 0;

            // Apply transition and move to target opacity
            overlay.style.transitionProperty = 'opacity';
            overlay.style.transitionDuration = speed + 'ms';

            // Force reflow so the transition reliably triggers
            overlay.offsetWidth;

            overlay.style.opacity = isNaN(opacity) ? '' : String(opacity);
        }
    }

    // Add transition class
    var mediabox = document.querySelector('.wf-mediabox');

    if (mediabox) {
        mediabox.classList.add('wf-mediabox-transition-scale');
    }

    return change(n);
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
            processItem(-1);
            break;

        case 39:
            processItem(1);
            break;
    }
}

/*
    Keep handler references so we can remove them later.
*/
var onTouchStartHandler = null;
var onTouchMoveHandler = null;
var onResizeHandler = null;

/**
 * Create event / key bindings
 * @param {Boolean} open Whether popup is opened or closed
 */
function bindEvents(open) {
    var mediabox = document.querySelector('.wf-mediabox');
    var body = document.querySelector('.wf-mediabox-body');

    if (!mediabox || !body) {
        return;
    }

    if (open) {
        document.addEventListener('keydown', addListener, false);

        if (settings.swipe !== false) {
            var xDown = null;
            var yDown = null;

            // Touch start handler (single finger only)
            onTouchStartHandler = function (e) {
                var touches = e.touches;

                if (!touches || touches.length !== 1 || itemCollection.length === 1) {
                    return;
                }

                xDown = touches[0].clientX;
                yDown = touches[0].clientY;
            };

            // Touch move handler (single finger only)
            onTouchMoveHandler = function (e) {
                var touches = e.touches;

                if (!xDown || !yDown) {
                    return;
                }

                if (!touches || touches.length !== 1 || itemCollection.length === 1) {
                    return;
                }

                var xUp = touches[0].clientX;
                var yUp = touches[0].clientY;

                var xDiff = xDown - xUp;
                var yDiff = yDown - yUp;

                if (Math.abs(xDiff) > Math.abs(yDiff)) {
                    if (xDiff > 0) {
                        nextItem();
                    } else {
                        previousItem();
                    }

                    e.preventDefault();
                }

                // reset values
                xDown = null;
                yDown = null;
            };

            body.addEventListener('touchstart', onTouchStartHandler, false);
            body.addEventListener('touchmove', onTouchMoveHandler, false);
        }

        // Resize / orientationchange (debounced)
        onResizeHandler = MediaBox.Tools.debounce(function () {
            var popup = itemCollection[currentIndex];

            if (!popup) {
                return;
            }

            updateBodyWidth(popup);
        }, 300);

        window.addEventListener('resize', onResizeHandler, false);
        window.addEventListener('orientationchange', onResizeHandler, false);

        // Slideshow
        if (s && s.autoplay) {
            autoplayInterval = setInterval(function () {
                if (nextItem() === false) {
                    clearInterval(autoplayInterval);
                }
            }, s.autoplay * 1000);
        }
    } else {
        document.removeEventListener('keydown', addListener, false);

        // Remove swipe handlers if attached
        if (onTouchStartHandler) {
            body.removeEventListener('touchstart', onTouchStartHandler, false);
            onTouchStartHandler = null;
        }

        if (onTouchMoveHandler) {
            body.removeEventListener('touchmove', onTouchMoveHandler, false);
            onTouchMoveHandler = null;
        }

        // Remove resize/orientation handlers
        if (onResizeHandler) {
            window.removeEventListener('resize', onResizeHandler, false);
            window.removeEventListener('orientationchange', onResizeHandler, false);
            onResizeHandler = null;
        }

        if (onMediaboxKeydownHandler) {
            mediabox.removeEventListener('keydown', onMediaboxKeydownHandler, false);
            onMediaboxKeydownHandler = null;
        }

        // Stop slideshow
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
        }
    }
}

function updateBodyWidth(popup) {
    var w, h, ratio;
    var ww = window.innerWidth || document.documentElement.clientWidth || 0;
    var wh = window.innerHeight || document.documentElement.clientHeight || 0;

    var frame = document.querySelector('.wf-mediabox-frame');
    var body = document.querySelector('.wf-mediabox-body');
    var content = document.querySelector('.wf-mediabox-content');

    if (!frame || !body) {
        return;
    }

    var fw = frame.clientWidth;
    var fh = frame.clientHeight;

    if (settings.scrolling === 'scroll') {
        var frameStyle = window.getComputedStyle ? window.getComputedStyle(frame, null) : frame.style;
        var framePaddingLeft = frameStyle ? frameStyle.getPropertyValue('padding-left') : '0';
        var framePaddingTop = frameStyle ? frameStyle.getPropertyValue('padding-top') : '0';

        fw = ww - (parseInt(framePaddingLeft, 10) * 2);
        fh = wh - (parseInt(framePaddingTop, 10) * 2);
    }

    w = MediaBox.Tools.parseWidth(popup.width);
    h = MediaBox.Tools.parseHeight(popup.height || fh);

    if (content && content.classList.contains('wf-mediabox-content-ratio-flex')) {
        // get size of border padding and info box
        var modh = body.clientHeight - content.clientHeight;

        // clamp height
        h = Math.min(h, fh);

        // border padding + info box + frame padding
        modh = modh + (wh - h);

        var contentItem = document.querySelector('.wf-mediabox-content-item');

        if (contentItem) {
            contentItem.style.height = 'calc(100vh - ' + modh + 'px)';
        }
    }

    var dim = MediaBox.Tools.resize(w, h, fw, fh);
    var bw = dim.width;

    // set the width as calculated
    body.style.maxWidth = bw + 'px';

    // get the resultant height
    var bh = body.clientHeight;

    // find ratio
    if (fw > fh) {
        ratio = (bw / bh).toFixed(1);

        if (bh > fh) {
            bw = ratio * (fh - 16) - 32;
            body.style.maxWidth = bw + 'px';
        }
    } else {
        ratio = (bh / bw).toFixed(1);

        if (bh > fh) {
            // find ratio
            if (bw > bh) {
                ratio = (bh / bw).toFixed(1);
            } else {
                ratio = (bw / bh).toFixed(1);
            }

            while (bh > fh) {
                bw = Math.max(260, bw);
                bh = ratio * bw;
            }

            body.style.maxWidth = (bw - 16) + 'px';
        }
    }
}

/**
 * Process a popup in the group queue
 * @param {Object} n Queue position
 */
function queue(n) {
    // Optional element
    var changed = false;

    var body = document.querySelector('.wf-mediabox-body');

    if (!body) {
        return false;
    }

    var callback = function () {
        if (!changed) {
            changed = true;

            body.classList.remove('wf-mediabox-transition');

            return change(n);
        }
    };

    callback();
}

/**
 * Process a popup in the group by index offset
 *
 * @param {Number} offset Index offset from the current item
 * @return {Boolean|*}
 */
function processItem(offset) {
    if (!itemCollection || itemCollection.length === 1) {
        return false;
    }

    var index = currentIndex + offset;

    if (index < 0 || index >= itemCollection.length) {
        return false;
    }

    return queue(index);
}

/**
 * Process the next popup in the group
 */
function nextItem() {
    return processItem(1);
}

/**
 * Process the previous popup in the group
 */
function previousItem() {
    return processItem(-1);
}

/**
 * Set the popup information (caption, title, numbers)
 */
function info() {
    var popup = itemCollection[currentIndex];
    var len = itemCollection.length;

    var mediabox = document.querySelector('.wf-mediabox');
    var body = document.querySelector('.wf-mediabox-body');
    var content = document.querySelector('.wf-mediabox-content');

    if (!popup || !mediabox) {
        return;
    }

    function showNodes(selector) {
        var nodes = document.querySelectorAll(selector);

        for (var i = 0; i < nodes.length; i++) {
            nodes[i].style.display = '';
        }
    }

    function hideNodes(selector) {
        var nodes = document.querySelectorAll(selector);

        for (var i = 0; i < nodes.length; i++) {
            nodes[i].style.display = 'none';
        }
    }

    function setAriaHidden(selector, val) {
        var nodes = document.querySelectorAll(selector);

        for (var i = 0; i < nodes.length; i++) {
            nodes[i].setAttribute('aria-hidden', val ? 'true' : 'false');
        }
    }

    function addClassToNodes(selector, cls) {
        var nodes = document.querySelectorAll(selector);

        for (var i = 0; i < nodes.length; i++) {
            nodes[i].classList.add(cls);
        }
    }

    function removeClassFromNodes(selector, cls) {
        var nodes = document.querySelectorAll(selector);

        for (var i = 0; i < nodes.length; i++) {
            nodes[i].classList.remove(cls);
        }
    }

    function clearNode(node) {
        while (node && node.firstChild) {
            node.removeChild(node.firstChild);
        }
    }

    function processRe(html) {
        var ex = /([-!#$%&\'\*\+\\./0-9=?A-Z^_`a-z{|}~]+@[-!#$%&\'\*\+\\/0-9=?A-Z^_`a-z{|}~]+\.[-!#$%&\'*+\\./0-9=?A-Z^_`a-z{|}~]+)/gi;
        var ux = /([a-zA-Z]{3,9}:\/\/[^\s]+)/gi;

        html = html.replace(ex, '<a href="mailto:$1" target="_blank">$1</a>');
        html = html.replace(ux, '<a href="$1" target="_blank">$1</a>');

        return html;
    }

    // remove existing focus
    removeClassFromNodes('.wf-mediabox-focus', 'wf-mediabox-focus');

    // download - remove existing
    if (content) {
        var downloads = content.querySelectorAll('a[download]');

        for (var i = 0; i < downloads.length; i++) {
            downloads[i].parentNode.removeChild(downloads[i]);
        }

        if (popup.params && popup.params.download) {
            var a = document.createElement('a');
            a.setAttribute('href', popup.src);
            a.setAttribute('target', '_blank');
            a.setAttribute('download', '');
            a.appendChild(document.createTextNode(translate('download')));

            content.appendChild(a);
        }
    }

    // Optional Element Caption/Title
    var caption = document.querySelector('.wf-mediabox-caption');

    if (caption) {
        var title = popup.title || '';
        var text = popup.caption || '';
        var h = '';

        // decode title/text
        title = Entities.decode(title);
        text = Entities.decode(text);

        // get title / caption from popup title: "title::caption"
        if (title.indexOf('::') !== -1) {
            var parts = title.split('::');
            title = (parts[0] || '').trim();
            text = (parts[1] || '').trim();
        }

        if (title) {
            h += '<h4 id="wf-mediabox-modal-title">' + title + '</h4>';
            mediabox.setAttribute('aria-labelledby', 'wf-mediabox-modal-title');
        }
        else {
            mediabox.setAttribute('aria-labelledby', '');
        }

        if (text) {
            h += '<p id="wf-mediabox-modal-description">' + text + '</p>';
            mediabox.setAttribute('aria-describedby', 'wf-mediabox-modal-description');
        }
        else {
            mediabox.setAttribute('aria-describedby', '');
        }

        // set caption html (may be empty)
        caption.innerHTML = h;
        caption.classList.add('wf-mediabox-caption-hidden');

        if (h) {
            // Process e-mail and urls inside elements that are not anchors
            // Equivalent to: $('.wf-mediabox-caption').find(':not(a)').each(...)
            var nodes = caption.querySelectorAll('*');

            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];

                if (node.tagName === 'A') {
                    continue;
                }

                var s = node.innerHTML;

                // contains a link but is not already html
                if (s && /(@|:\/\/)/.test(s) && s.indexOf('<') === -1) {
                    var replaced = processRe(s);

                    if (replaced && replaced !== s) {
                        // Replace the node with parsed HTML
                        var wrap = document.createElement('span');
                        wrap.innerHTML = replaced;

                        var parent = node.parentNode;

                        while (wrap.firstChild) {
                            parent.insertBefore(wrap.firstChild, node);
                        }

                        parent.removeChild(node);
                    }
                }
            }
        }
    }

    // Numbers (Optional Element)
    var numbers = document.querySelector('.wf-mediabox-numbers');

    if (numbers && len > 1) {
        // jQuery .data('html') replacement: use data-html attribute
        var htmlTpl = numbers.getAttribute('data-html') || '{{numbers}}';

        if (htmlTpl.indexOf('{{numbers}}') !== -1) {
            clearNode(numbers);

            var ol = document.createElement('ol');
            numbers.appendChild(ol);

            for (var i = 0; i < len; i++) {
                var n = i + 1;
                var label = itemCollection[i].title || n;

                var button = document.createElement('button');
                button.className = 'wf-mediabox-number';
                button.setAttribute('aria-label', label);
                button.setAttribute('tabindex', '0');
                button.appendChild(document.createTextNode(String(n)));

                if (currentIndex === i) {
                    button.classList.add('active');
                }

                (function (idx) {
                    button.addEventListener('click', function () {
                        if (currentIndex === idx) {
                            return false;
                        }

                        return queue(idx);
                    }, false);
                }(i));

                var li = document.createElement('li');
                li.appendChild(button);
                ol.appendChild(li);
            }
        }

        if (htmlTpl.indexOf('{{current}}') !== -1) {
            numbers.innerHTML = htmlTpl
                .replace('{{current}}', String(currentIndex + 1))
                .replace('{{total}}', String(len));
        }

        numbers.setAttribute('aria-hidden', 'false');
    }
    else if (numbers) {
        clearNode(numbers);
        numbers.setAttribute('aria-hidden', 'true');
    }

    // show info
    showNodes('.wf-mediabox-info-top, .wf-mediabox-info-bottom');

    // Show / Hide Previous and Next buttons
    hideNodes('.wf-mediabox-next, .wf-mediabox-prev');
    setAriaHidden('.wf-mediabox-next, .wf-mediabox-prev', true);

    if (len > 1) {
        if (currentIndex > 0) {
            showNodes('.wf-mediabox-prev');
            setAriaHidden('.wf-mediabox-prev', false);
            addClassToNodes('.wf-mediabox-prev', 'wf-mediabox-focus');
        }
        else {
            hideNodes('.wf-mediabox-prev');
            setAriaHidden('.wf-mediabox-prev', true);
        }

        if (currentIndex < len - 1) {
            showNodes('.wf-mediabox-next');
            setAriaHidden('.wf-mediabox-next', false);
            addClassToNodes('.wf-mediabox-next', 'wf-mediabox-focus');
        }
        else {
            hideNodes('.wf-mediabox-next');
            setAriaHidden('.wf-mediabox-next', true);
        }
    }
    else {
        // add focus to close button
        addClassToNodes('.wf-mediabox-close', 'wf-mediabox-focus');
    }

    if (popup.params && popup.params.css && body) {
        body.classList.add(popup.params.css);
    }

    // thumbnails
    var thumbs = document.querySelector('.wf-mediabox-thumbnails');

    if (thumbs && len > 1) {
        clearNode(thumbs);

        Tools.each(itemCollection, function (item, i) {
            var img = document.createElement('img');
            img.setAttribute('src', item.src);
            img.className = 'loading';

            if (currentIndex === i) {
                img.classList.add('active');
            }

            img.addEventListener('click', function () {
                return queue(i);
            }, false);

            img.addEventListener('load', function () {
                img.classList.remove('loading');
            }, false);

            thumbs.appendChild(img);
        });
    }
}

/**
 * Change the popup
 * @param {Number} n Popup number
 * @return {Boolean}
 */
function change(n) {
    var popup, type, html, plugin;

    if (n < 0 || n >= itemCollection.length) {
        return false;
    }

    // set current popup index
    currentIndex = n;

    // Show Container, Loader, Cancel
    (function () {
        var nodes = document.querySelectorAll('.wf-mediabox-container, .wf-mediabox-cancel');

        for (var i = 0; i < nodes.length; i++) {
            nodes[i].style.display = '';
        }
    }());

    // set loader (add class + show loader element)
    var mediabox = document.querySelector('.wf-mediabox');

    if (mediabox) {
        mediabox.classList.add('wf-mediabox-loading');

        var loader = mediabox.querySelector('.wf-mediabox-loader');

        if (loader) {
            loader.setAttribute('aria-hidden', 'false');
        }
    }

    // get current popup item
    popup = itemCollection[n];

    type = 'error';
    html = '';

    // get plugin for this media type
    plugin = Plugins.get(popup);

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

    // update classes on content
    var content = document.querySelector('.wf-mediabox-content');

    if (content) {
        content.className = 'wf-mediabox-content';
        content.classList.add('wf-mediabox-content-' + type);
        content.style.height = '';
    }

    // pass through plugin html to popup
    popup.html = html;

    // re-set with updated parameters
    itemCollection[n] = popup;

    setup();

    return false;
}

/*
    Keep a reference so bindEvents(false) / close() can remove it.
*/
var onMediaboxKeydownHandler = null;

/**
 * Pre-animation setup. Resize images, set width / height
 */
function setup() {
    // Setup info
    info();

    if (Env.ie) {
        var imgs = document.querySelectorAll('.wf-mediabox-content img');

        for (var i = 0; i < imgs.length; i++) {
            imgs[i].style.msInterpolationMode = 'bicubic';
        }
    }

    var mediabox = document.querySelector('.wf-mediabox');

    if (!mediabox) {
        return false;
    }

    var tabIndex = 0;

    function isVisible(el) {
        if (!el) {
            return false;
        }

        // Fast reject for display:none ancestors
        if (el.offsetParent === null && el !== document.body) {
            return false;
        }

        var cs = window.getComputedStyle ? window.getComputedStyle(el, null) : null;

        if (cs && (cs.display === 'none' || cs.visibility === 'hidden')) {
            return false;
        }

        return true;
    }

    function getTabbableItems(root) {
        var nodes = root.querySelectorAll('[tabindex]');
        var items = [];

        for (var i = 0; i < nodes.length; i++) {
            var el = nodes[i];
            var ti = parseInt(el.getAttribute('tabindex'), 10);

            if (ti >= 0 && isVisible(el)) {
                items.push(el);
            }
        }

        return items;
    }

    // Remove existing handler if setup() can be called multiple times
    if (onMediaboxKeydownHandler) {
        mediabox.removeEventListener('keydown', onMediaboxKeydownHandler, false);
        onMediaboxKeydownHandler = null;
    }

    onMediaboxKeydownHandler = function (e) {
        // only TAB
        if (e.keyCode !== 9) {
            return;
        }

        // prevent tabbing outside the lightbox
        e.preventDefault();

        // get all visible, tabbable items
        var items = getTabbableItems(mediabox);

        if (!items.length) {
            return;
        }

        // find index of the currently focused item (has focus class)
        tabIndex = 0;

        for (var i = 0; i < items.length; i++) {
            if (items[i].classList.contains('wf-mediabox-focus')) {
                tabIndex = i;
                break;
            }
        }

        // reverse on SHIFT+TAB
        if (e.shiftKey) {
            tabIndex--;
        }
        else {
            tabIndex++;
        }

        // wrap
        if (tabIndex < 0) {
            tabIndex = items.length - 1;
        }
        else if (tabIndex >= items.length) {
            tabIndex = 0;
        }

        // remove focus class from all items
        for (var i = 0; i < items.length; i++) {
            items[i].classList.remove('wf-mediabox-focus');
        }

        // focus the nth item
        items[tabIndex].focus();
        items[tabIndex].classList.add('wf-mediabox-focus');
    };

    mediabox.addEventListener('keydown', onMediaboxKeydownHandler, false);

    // Animate box
    return animate();
}

/**
 * Animate the Popup
 */
function animate() {
    var self = this;
    var s = settings;

    // current popup
    var popup = itemCollection[currentIndex];

    var cw = popup.width || 0;
    var ch = popup.height || 0;

    var mediabox = document.querySelector('.wf-mediabox');
    var body = document.querySelector('.wf-mediabox-body');
    var frame = document.querySelector('.wf-mediabox-frame');
    var content = document.querySelector('.wf-mediabox-content');
    var contentItem = document.querySelector('.wf-mediabox-content-item');
    var caption = document.querySelector('.wf-mediabox-caption');

    if (!mediabox || !content || !contentItem || !body) {
        return false;
    }

    function removeAllSvg(node) {
        if (!node) {
            return;
        }

        var svgs = node.querySelectorAll('svg');

        for (var i = 0; i < svgs.length; i++) {
            if (svgs[i].parentNode) {
                svgs[i].parentNode.removeChild(svgs[i]);
            }
        }
    }

    function removeClassFromAll(selector, cls) {
        var nodes = document.querySelectorAll(selector);

        for (var i = 0; i < nodes.length; i++) {
            nodes[i].classList.remove(cls);
        }
    }

    function addClassToAll(selector, cls) {
        var nodes = document.querySelectorAll(selector);

        for (var i = 0; i < nodes.length; i++) {
            nodes[i].classList.add(cls);
        }
    }

    function showAll(selector) {
        var nodes = document.querySelectorAll(selector);

        for (var i = 0; i < nodes.length; i++) {
            nodes[i].style.display = '';
        }
    }

    function triggerEvent(el, name) {
        if (!el) {
            return;
        }

        if (typeof window.CustomEvent === 'function') {
            el.dispatchEvent(new CustomEvent(name, { bubbles: true }));
        }
        else {
            // IE fallback
            var evt = document.createEvent('Event');
            evt.initEvent(name, true, false);
            el.dispatchEvent(evt);
        }
    }

    function matchesSelector(el, selector) {
        if (!el) {
            return false;
        }

        var p = Element.prototype;
        var fn = p.matches || p.matchesSelector || p.msMatchesSelector || p.webkitMatchesSelector;

        if (fn) {
            return fn.call(el, selector);
        }

        // Very old fallback: no match support
        return false;
    }

    function addOneTimeListener(el, type, handler) {
        if (!el) {
            return;
        }

        var wrap = function (e) {
            el.removeEventListener(type, wrap, false);
            handler.call(el, e);
        };

        el.addEventListener(type, wrap, false);
    }

    function addListener(el, type, handler) {
        if (!el) {
            return;
        }

        el.addEventListener(type, handler, false);
    }

    // Reset error states
    content.classList.remove('wf-mediabox-broken-image');
    content.classList.remove('wf-mediabox-broken-media');

    var icon404 = content.querySelector('.wf-icon-404');

    if (icon404) {
        icon404.classList.remove('wf-icon-404');
        removeAllSvg(icon404);
    }

    if (caption) {
        caption.classList.remove('wf-mediabox-caption-hidden');
    }

    // constrain width for ajax loading
    if (content.classList.contains('wf-mediabox-content-ajax')) {
        body.style.maxWidth = '640px';
    }

    // create loader cache
    var cache = document.createElement('div');
    cache.className = 'wf-mediabox-cache';

    if (popup.type === 'iframe' || popup.type === 'ajax') {
        contentItem.innerHTML = popup.html;
    }
    else {
        cache.innerHTML = popup.html;
        mediabox.appendChild(cache);
    }

    function removeCache() {
        if (cache && cache.parentNode) {
            cache.innerHTML = '';
            cache.parentNode.removeChild(cache);
        }
    }

    function itemLoaded() {
        // remove loader cache
        removeCache();

        // append media element to popup content if it isn't an iframe (iframe will reload if appended)
        if (this.nodeName !== 'IFRAME') {
            contentItem.innerHTML = popup.html;
        }

        // update loader
        mediabox.classList.remove('wf-mediabox-loading');

        var loader = mediabox.querySelector('.wf-mediabox-loader');

        if (loader) {
            loader.setAttribute('aria-hidden', 'true');
        }

        // remove padding
        contentItem.style.paddingBottom = '';

        // trigger display
        mediabox.classList.add('wf-mediabox-show');

        // Show Information
        addClassToAll('.wf-mediabox-info-top, .wf-mediabox-info-bottom', 'wf-info-show');

        if (this.nodeName === 'IMG') {
            // use passed in width or the images actual width, whichever is less
            cw = cw || this.naturalWidth || this.width;
            ch = ch || this.naturalHeight || this.height;

            // parse to integer value
            cw = Tools.parseWidth(cw);
            ch = Tools.parseWidth(ch);

            // store width/height
            popup.width = cw;
            popup.height = ch;

            // Toggle fullscreen on image click
            addListener(this, 'click', function () {
                if (frame && frame.classList.contains('wf-mediabox-fullscreen')) {
                    self.updateBodyWidth(popup);
                }
                else {
                    body.style.maxWidth = (this.naturalWidth || this.width || cw) + 'px';
                }

                if (frame) {
                    frame.classList.toggle('wf-mediabox-fullscreen');
                }
            });
        }
        else {
            if (this.nodeName === 'VIDEO') {
                cw = cw || this.videoWidth || 0;
                ch = ch || this.videoHeight || 0;
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
                if (matchesSelector(this, '.wf-mediabox-iframe-video, .wf-mediabox-video, .wf-mediabox-audio')) {
                    ratio = 0.56;
                }

                if (ratio === 0.75) {
                    content.classList.add('wf-mediabox-content-ratio-4by3');
                }
                else if (ratio !== 0.56) {
                    content.classList.add('wf-mediabox-content-ratio-flex');
                }
            }

            contentItem.classList.add('wf-mediabox-content-ratio');

            // store width
            popup.width = cw;
        }

        // update popup width
        self.updateBodyWidth(popup);

        // Changes if scroll popup
        if (s.scrolling === 'scroll') {
            document.body.classList.add('wf-mediabox-scrolling');

            // scroll to popup body
            scrollIntoView('.wf-mediabox-body');
        }

        body.classList.add('wf-mediabox-transition');
        body.setAttribute('aria-hidden', 'false');

        // focus item
        var focusEl = document.querySelector('.wf-mediabox-focus');

        if (focusEl) {
            focusEl.focus();
        }

        // focus iframe window
        if (this.nodeName === 'IFRAME') {
            var ifr = this;

            setTimeout(function () {
                try {
                    if (ifr.contentWindow) {
                        ifr.contentWindow.focus();
                    }
                }
                catch (ex) {
                    // ignore cross-origin focus errors
                }
            }, 10);
        }

        // force autoplay in IE11
        if (this.nodeName === 'VIDEO' || this.nodeName === 'AUDIO') {
            if (Env.ie && this.autoplay && this.play) {
                this.play();
            }
        }

        // trigger custom load event
        triggerEvent(this, 'mediabox:load');
    }

    function itemError() {
        var n = this;

        // remove loader cache
        removeCache();

        mediabox.classList.remove('wf-mediabox-loading');

        if (n.nodeName === 'IMG') {
            content.classList.add('wf-mediabox-broken-image');
        }
        else {
            content.classList.add('wf-mediabox-broken-media');
        }

        body.classList.add('wf-mediabox-transition');
        body.style.maxWidth = '';
        body.setAttribute('aria-hidden', 'false');

        mediabox.classList.add('wf-mediabox-show');

        var inner = content.querySelector('div');

        if (inner) {
            inner.classList.add('wf-icon-404');
            inner.innerHTML = Svg.get('404');
        }
    }

    /*
        Listen for media load / metadata.

        jQuery did:
        $('img, video, audio, object, embed', $cache)
            .add('iframe', '.wf-mediabox-content')
            .one('load loadedmetadata', ...)
            .on('error', itemError);
    */
    var mediaNodes = [];

    // from cache
    var cacheMedia = cache.querySelectorAll('img, video, audio, object, embed');

    for (var i = 0; i < cacheMedia.length; i++) {
        mediaNodes.push(cacheMedia[i]);
    }

    // from content (iframes)
    var iframes = content.querySelectorAll('iframe');

    for (var i = 0; i < iframes.length; i++) {
        mediaNodes.push(iframes[i]);
    }

    // Ensure loader class is present (your change() adds it earlier, but keep safe)
    mediabox.classList.add('wf-mediabox-loading');

    for (var i = 0; i < mediaNodes.length; i++) {
        (function (node) {
            var done = false;

            function loadedHandler() {
                if (done) {
                    return;
                }

                done = true;

                setTimeout(function () {
                    itemLoaded.apply(node);
                }, 300);
            }

            function errorHandler() {
                if (done) {
                    return;
                }

                done = true;
                itemError.apply(node);
            }

            // load (IMG/IFRAME/OBJECT/EMBED) and loadedmetadata (VIDEO/AUDIO)
            addListener(node, 'error', errorHandler);

            addOneTimeListener(node, 'load', loadedHandler);
            addOneTimeListener(node, 'loadedmetadata', loadedHandler);
        }(mediaNodes[i]));
    }

    return true;
}

/**
 * Close the popup window and destroy all related objects.
 *
 * @param {Boolean} keepopen  If true, keep the mediabox wrapper open but clear the content
 * @return {Boolean} Always false (for event handler usage)
 */
function close(keepopen) {
    var mediabox = document.querySelector('.wf-mediabox');
    var container = document.querySelector('.wf-mediabox-container');
    var body = document.querySelector('.wf-mediabox-body');

    if (!mediabox || !container || !body) {
        // No container or body, nothing to close
        return false;
    }

    function getTransitionDurationMs(el, fallback) {
        var duration = 0;

        if (el) {
            // Note: this reads inline style only (matches your original behaviour)
            duration = el.style.transitionDuration || 0;
            duration = (parseFloat(duration) * 1000) || 0;
        }

        return duration || fallback || 0;
    }

    // Destroy objects after transition delay
    body.classList.remove('wf-mediabox-transition');

    var transitionDuration = getTransitionDurationMs(container, 300);

    var transitionTimer = setTimeout(function () {
        // Remove iframe/media sources and clear content
        var item = body.querySelector('.wf-mediabox-content-item');

        if (item) {
            Tools.each(item.querySelectorAll('video, audio'), function (el) {
                el.setAttribute('src', '');
            });

            item.innerHTML = '';
        }

        if (!keepopen) {
            // Remove events
            bindEvents(false);

            // Hide info divs
            Tools.each(body.querySelectorAll('.wf-mediabox-info-bottom, .wf-mediabox-info-top'), function (el) {
                el.style.display = 'none';
            });

            // Remove frame if present
            var frame = document.querySelector('.wf-mediabox-frame');

            if (frame) {
                frame.parentNode.removeChild(frame);
            }

            // Remove mediabox classes
            mediabox.classList.remove('wf-mediabox-open', 'wf-mediabox-show');

            // Fade out overlay and then remove the mediabox
            var overlay = document.querySelector('.wf-mediabox-overlay');
            var overlayDuration = getTransitionDurationMs(overlay, 300);

            if (overlay) {
                overlay.style.opacity = 0;

                setTimeout(function () {
                    mediabox.parentNode.removeChild(mediabox);
                    document.body.classList.remove('wf-mediabox-scrolling');
                }, overlayDuration);
            }
            else {
                // No overlay, remove immediately
                mediabox.parentNode.removeChild(mediabox);
                document.body.classList.remove('wf-mediabox-scrolling');
            }

            // Restore focus to the activator
            if (activator) {
                activator.focus();
            }
        }
    }, transitionDuration);

    // Hide close link immediately
    var closeLink = document.querySelector('.wf-mediabox-close');

    if (closeLink) {
        closeLink.style.display = 'none';
    }

    clearTimeout(transitionTimer);
    transitionTimer = setTimeout(function () {
        // Re-run the above timer handler after transitionDuration
        // (This preserves original structure if you rely on transitionTimer elsewhere)
    }, 0);

    window.clearInterval(autoplayInterval);

    return false;
}

function addTheme(name, theme) {
    Theme.add(name, theme);
}

const MediaBox = {
    init,
    getSite,
    addTheme,
    settings: settings,
};

// Export MediaBox as WFMediaBox/jcepopup in global namespace
window.WfMediabox = window.jcepopup = MediaBox;