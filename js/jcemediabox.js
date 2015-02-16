/**
 * JCEMediaBox 		@@version@@
 * @package 		JCEMediaBox
 * @url				http://www.joomlacontenteditor.net
 * @copyright 		@@copyright@@
 * @copyright		Copyright 2009, Moxiecode Systems AB
 * @license 		@@licence@@
 * @date			@@date@@
 * This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 *
 */
(function (window) {
    /**
     *
     *  Base64 encode / decode
     *  http://www.webtoolkit.info/
     *
     **/
    var Base64 = {
        // private property
        _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
        // public method for encoding
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;

            input = Base64._utf8_encode(input);

            while (i < input.length) {

                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                        Base64._keyStr.charAt(enc1) + Base64._keyStr.charAt(enc2) +
                        Base64._keyStr.charAt(enc3) + Base64._keyStr.charAt(enc4);

            }

            return output;
        },
        // public method for decoding
        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;

            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            while (i < input.length) {

                enc1 = Base64._keyStr.indexOf(input.charAt(i++));
                enc2 = Base64._keyStr.indexOf(input.charAt(i++));
                enc3 = Base64._keyStr.indexOf(input.charAt(i++));
                enc4 = Base64._keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

            }

            output = Base64._utf8_decode(output);

            return output;

        },
        // private method for UTF-8 encoding
        _utf8_encode: function (string) {
            string = string.replace(/\r\n/g, "\n");
            var utftext = "";

            for (var n = 0; n < string.length; n++) {

                var c = string.charCodeAt(n);

                if (c < 128) {
                    utftext += String.fromCharCode(c);
                }
                else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
                else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }

            }

            return utftext;
        },
        // private method for UTF-8 decoding
        _utf8_decode: function (utftext) {
            var string = "";
            var i = 0;
            var c = 0, c1 = 0, c2 = 0;

            while (i < utftext.length) {

                c = utftext.charCodeAt(i);

                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                }
                else if ((c > 191) && (c < 224)) {
                    c1 = utftext.charCodeAt(i + 1);
                    string += String.fromCharCode(((c & 31) << 6) | (c1 & 63));
                    i += 2;
                }
                else {
                    c1 = utftext.charCodeAt(i + 1);
                    c2 = utftext.charCodeAt(i + 2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c1 & 63) << 6) | (c2 & 63));
                    i += 3;
                }

            }
            return string;
        }
    };

    // patch in btoa
    if (!window.btoa) {
        window.btoa = Base64.encode;
    }
    // patch in atob
    if (!window.atob) {
        window.atob = Base64.decode;
    }

    // html5 element support
    var support = {};

    /*
     * From Modernizr v2.0.6
     * http://www.modernizr.com
     * Copyright (c) 2009-2011 Faruk Ates, Paul Irish, Alex Sexton
     */
    support.video = (function () {
        var el = document.createElement('video');
        var bool = false;
        // IE9 Running on Windows Server SKU can cause an exception to be thrown, bug #224
        try {
            if (bool = !!el.canPlayType) {
                bool = new Boolean(bool);
                bool.ogg = el.canPlayType('video/ogg; codecs="theora"');

                // Workaround required for IE9, which doesn't report video support without audio codec specified.
                //   bug 599718 @ msft connect
                var h264 = 'video/mp4; codecs="avc1.42E01E';
                bool.mp4 = el.canPlayType(h264 + '"') || el.canPlayType(h264 + ', mp4a.40.2"');

                bool.webm = el.canPlayType('video/webm; codecs="vp8, vorbis"');
            }

        } catch (e) {
        }

        return bool;
    })();

    var entities = {
        '\"': '&quot;',
        "'": '&#39;',
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;'
    };

    /*
     * From Modernizr v2.0.6
     * http://www.modernizr.com
     * Copyright (c) 2009-2011 Faruk Ates, Paul Irish, Alex Sexton
     */
    support.audio = (function () {
        var el = document.createElement('audio');

        try {
            if (bool = !!el.canPlayType) {
                bool = new Boolean(bool);
                bool.ogg = el.canPlayType('audio/ogg; codecs="vorbis"');
                bool.mp3 = el.canPlayType('audio/mpeg;');

                // Mimetypes accepted:
                //   https://developer.mozilla.org/En/Media_formats_supported_by_the_audio_and_video_elements
                //   http://bit.ly/iphoneoscodecs
                bool.wav = el.canPlayType('audio/wav; codecs="1"');
                bool.m4a = el.canPlayType('audio/x-m4a;') || el.canPlayType('audio/aac;');
                bool.webm = el.canPlayType('audio/webm; codecs="vp8, vorbis"');
            }
        } catch (e) {
        }

        return bool;
    })();

    window.JCEMediaBox = {
        /**
         * Global Options Object
         */
        options: {
            popup: {
                width: '',
                height: '',
                legacy: 0,
                lightbox: 0,
                shadowbox: 0,
                overlay: 1,
                overlayopacity: 0.8,
                overlaycolor: '#000000',
                resize: 0,
                icons: 1,
                fadespeed: 500,
                scalespeed: 500,
                hideobjects: 1,
                scrolling: 'fixed',
                //protect				: 1,
                close: 2,
                labels: {
                    'close': 'Close',
                    'next': 'Next',
                    'previous': 'Previous',
                    'numbers': '{$current} of {$total}',
                    'cancel': 'Cancel'
                },
                cookie_expiry: 7,
                google_viewer: 0,
                pdfjs: 0
            },
            tooltip: {
                speed: 150,
                offsets: {
                    x: 16,
                    y: 16
                },
                position: 'br',
                opacity: 0.8,
                background: '#000000',
                color: '#ffffff'
            },
            base: '/',
            pngfix: false,
            pngfixclass: '',
            theme: 'standard',
            imgpath: 'plugins/system/jcemediabox/img'
        },
        init: function (options) {
            this.extend(this.options, options);
            // Clear IE6 background cache
            if (this.isIE6) {
                try {
                    document.execCommand("BackgroundImageCache", false, true);
                } catch (e) {
                }
            }
            this.ready();
        },
        /**
         * Function to determine if DOM is ready.
         * Based on JQuery 'bindReady' function - http://jquery.com/
         * Copyright (c) 2009 John Resig
         */
        ready: function () {
            // Mozilla, Opera and webkit nightlies currently support this event
            if (document.addEventListener) {
                // Use the handy event callback
                document.addEventListener("DOMContentLoaded", function () {
                    document.removeEventListener("DOMContentLoaded", arguments.callee, false);
                    return JCEMediaBox._init();
                }, false);

                // If IE event model is used
            } else if (document.attachEvent) {
                // ensure firing before onload,
                // maybe late but safe also for iframes
                document.attachEvent("onreadystatechange", function () {
                    if (document.readyState === "complete") {
                        document.detachEvent("onreadystatechange", arguments.callee);
                        return JCEMediaBox._init();
                    }
                });

                // If IE and not an iframe
                // continually check to see if the document is ready
                if (document.documentElement.doScroll && window == window.top) {
                    (function () {
                        if (JCEMediaBox.domLoaded)
                            return;

                        try {
                            // If IE is used, use the trick by Diego Perini
                            // http://javascript.nwbox.com/IEContentLoaded/
                            document.documentElement.doScroll("left");
                        } catch (error) {
                            setTimeout(arguments.callee, 0);
                            return;
                        }

                        // and execute any waiting functions
                        return JCEMediaBox._init();
                    })();

                }
            }

            // A fallback to window.onload, that will always work
            JCEMediaBox.Event.add(window, "load", function () {
                return JCEMediaBox._init();
            });
        },
        /**
         * Get the Site Base URL
         * @method getSite
         * @return {String} Site Base URL
         */
        getSite: function () {
            var base = this.options.base;

            if (base) {
                // Get document location
                var site = document.location.href;
                // Split into port (http) and location
                var parts = site.split(':\/\/');

                var port = parts[0];
                var url = parts[1];

                // Get url part before base
                if (url.indexOf(base) != -1) {
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
        },
        /**
         * Private internal function
         * Initialize JCEMediaBox
         */
        _init: function () {
            if (this.domLoaded)
                return;

            this.domLoaded = true;

            var t = this, na = navigator, ua = na.userAgent;

            /**
             * Constant that is true if the browser is Opera.
             *
             * @property isOpera
             * @type Boolean
             * @final
             */
            t.isOpera = window.opera && opera.buildNumber;

            /**
             * Constant that is true if the browser is WebKit (Safari/Chrome).
             *
             * @property isWebKit
             * @type Boolean
             * @final
             */
            t.isWebKit = /WebKit/.test(ua);

            t.isChrome = /Chrome\//.test(ua);

            t.isSafari = /Safari\//.test(ua);

            /**
             * Constant that is true if the browser is IE.
             *
             * @property isIE
             * @type Boolean
             * @final
             */
            t.isIE = !t.isWebKit && !t.isOpera && (/MSIE/gi).test(ua) && (/Explorer/gi).test(na.appName) && !!window.ActiveXObject;

            /**
             * Constant that is true if the browser is IE 6 or older.
             *
             * @property isIE6
             * @type Boolean
             * @final
             */
            t.isIE6 = t.isIE && /MSIE [56]/.test(ua) && !window.XMLHttpRequest;

            /**
             * Constant that is true if the browser is IE 7.
             *
             * @property isIE7
             * @type Boolean
             * @final
             */
            t.isIE7 = t.isIE && /MSIE [7]/.test(ua) && !!window.XMLHttpRequest && !document.querySelector;

            /**
             * Constant that tells if the current browser is an iPhone or iPad.
             *
             * @property isiOS
             * @type Boolean
             * @final
             */
            t.isiOS = /(iPad|iPhone)/.test(ua);

            t.isAndroid = /Android/.test(ua);

            /**
             * Get the Site URL
             * @property site
             * @type String
             */
            this.site = this.getSite();

            // Can't get reliable site URL
            if (!this.site) {
                return false;
            }

            // Initialize Popup / Tooltip creation
            this.Popup.init();
            this.ToolTip.init();
        },
        /**
         * Performs an iteration of all items in a collection such as an object or array. This method will execure the
         * callback function for each item in the collection, if the callback returns false the iteration will terminate.
         * The callback has the following format: cb(value, key_or_index).
         *
         * @method each
         * @param {Object} o Collection to iterate.
         * @param {function} cb Callback function to execute for each item.
         * @param {Object} s Optional scope to execute the callback in.
         * @copyright	Copyright 2009, Moxiecode Systems AB
         */
        each: function (o, cb, s) {
            var n, l;

            if (!o)
                return 0;

            s = s || o;

            if (o.length !== undefined) {
                // Indexed arrays, needed for Safari
                for (n = 0, l = o.length; n < l; n++) {
                    if (cb.call(s, o[n], n, o) === false)
                        break;
                }
            } else {
                // Hashtables
                for (n in o) {
                    if (o.hasOwnProperty(n)) {
                        if (cb.call(s, o[n], n, o) === false)
                            break;
                    }
                }
            }

            return o;
        },
        /**
         * Extends an object with the specified other object(s).
         *
         * @method extend
         * @param {Object} o Object to extend with new items.
         * @param {Object} e..n Object(s) to extend the specified object with.
         * @return {Object} o New extended object, same reference as the input object.
         * @copyright	Copyright 2009, Moxiecode Systems AB
         */
        extend: function (o, e) {
            var t = JCEMediaBox, i, l, a = arguments;

            for (i = 1, l = a.length; i < l; i++) {
                e = a[i];

                t.each(e, function (v, n) {
                    if (v !== undefined)
                        o[n] = v;
                });

            }

            return o;
        },
        /**
         * Removes whitespace from the beginning and end of a string.
         *
         * @method trim
         * @param {String} s String to remove whitespace from.
         * @return {String} New string with removed whitespace.
         * @copyright	Copyright 2009, Moxiecode Systems AB
         */
        trim: function (s) {
            return (s ? '' + s : '').replace(/^\s*|\s*$/g, '');
        },
        /**
         * Find index of item in array
         * @param {array} a Array to look in
         * @param {mixed} s Item to find
         * @return {Number, i} Index
         */
        inArray: function (a, s) {
            var i, l;

            if (a) {
                for (i = 0, l = a.length; i < l; i++) {
                    if (a[i] === s) {
                        return i;
                    }
                }
            }

            return -1;
        },
        /**
         * DOM functions
         */
        DOM: {
            /**
             * Get an Element by ID
             * @param {Object} s ID
             */
            get: function (s) {
                if (typeof (s) == 'string')
                    return document.getElementById(s);

                return s;
            },
            /**
             * Return elements matching a simple selector, eg: a, a[id], a.classname
             * @param {Object} o Selector
             * @param {Object} p Parent Element
             */
            select: function (o, p) {
                var t = this, r = [], s, parts, at, tag, cl, each = JCEMediaBox.each;
                p = p || document;
                // Return all elements
                if (o == '*') {
                    return p.getElementsByTagName(o);
                }

                // Use native support if available
                if (p.querySelectorAll) {
                    return p.querySelectorAll(o);
                }

                /**
                 * Internal inArray function
                 * @param {Object} a Array to check
                 * @param {Object} s Key to check for
                 */
                function inArray(a, v) {
                    var i, l;

                    if (a) {
                        for (i = 0, l = a.length; i < l; i++) {
                            if (a[i] === v)
                                return true;
                        }
                    }

                    return false;
                }

                // Split selector
                s = o.split(',');
                each(s, function (selectors) {
                    parts = JCEMediaBox.trim(selectors).split('.');
                    // Element
                    tag = parts[0] || '*';
                    // Class
                    cl = parts[1] || '';
                    // Handle attributes
                    if (/\[(.*?)\]/.test(tag)) {
                        tag = tag.replace(/(.*?)\[(.*?)\]/, function (a, b, c) {
                            at = c;
                            return b;
                        });

                    }
                    // Get all elements for the given parent and tag
                    var elements = p.getElementsByTagName(tag);

                    // If class or attribute
                    if (cl || at) {
                        each(elements, function (el) {
                            // If class
                            if (cl) {
                                if (t.hasClass(el, cl)) {
                                    if (!inArray(r, el)) {
                                        r.push(el);
                                    }
                                }
                            }
                            // If attribute
                            if (at) {
                                if (el.getAttribute(at)) {
                                    if (!inArray(r, el)) {
                                        r.push(el);
                                    }
                                }
                            }
                        });

                    } else {
                        r = elements;
                    }
                });

                return r;
            },
            /**
             * Check if an element has a specific class
             * @param {Object} el Element
             * @param {Object} c Class
             */
            hasClass: function (el, c) {
                return new RegExp(c).test(el.className);
            },
            /**
             * Add a class to an element
             * @param {Object} el Element
             * @param {Object} c Class
             */
            addClass: function (el, c) {
                if (!this.hasClass(el, c)) {
                    el.className = JCEMediaBox.trim(el.className + ' ' + c);
                }
            },
            /**
             * Remove a class from an element
             * @param {Object} el Element
             * @param {Object} c Class to remove
             */
            removeClass: function (el, c) {
                if (this.hasClass(el, c)) {
                    var s = el.className;
                    var re = new RegExp("(^|\\s+)" + c + "(\\s+|$)", "g");
                    var v = s.replace(re, ' ');
                    v = v.replace(/^\s|\s$/g, '');
                    el.className = v;
                }
            },
            /**
             * Show an element
             * @param {Object} el Element to show
             */
            show: function (el) {
                el.style.display = 'block';
            },
            /**
             * Hide and element
             * @param {Object} el Element to hide
             */
            hide: function (el) {
                el.style.display = 'none';
            },
            /**
             * Remove an element or attribute
             * @param {Object} el Element
             * @param {String} attrib Attribute
             */
            remove: function (el, attrib) {
                if (attrib) {
                    el.removeAttribute(attrib);
                } else {
                    var p = el.parentNode || document.body;
                    p.removeChild(el);
                }
            },
            /**
             * Set or retrieve a style
             * @param {Object} el Target Element
             * @param {Object} s Style to set / get
             * @param {Object} v Value to set
             */
            style: function (n, na, v) {
                var isIE = JCEMediaBox.isIE, r, s;

                if (!n) {
                    return;
                }

                // Camelcase it, if needed
                na = na.replace(/-(\D)/g, function (a, b) {
                    return b.toUpperCase();
                });

                s = n.style;

                // Get value
                if (typeof v == 'undefined') {

                    if (na == 'float')
                        na = isIE ? 'styleFloat' : 'cssFloat';

                    r = s[na];

                    if (document.defaultView && !r) {
                        if (/float/i.test(na))
                            na = 'float';

                        // Remove camelcase
                        na = na.replace(/[A-Z]/g, function (a) {
                            return '-' + a;
                        }).toLowerCase();

                        try {
                            r = document.defaultView.getComputedStyle(n, null).getPropertyValue(na);
                        } catch (e) {
                        }
                    }

                    if (n.currentStyle && !r)
                        r = n.currentStyle[na];

                    return r;

                } else {

                    switch (na) {
                        case 'opacity':
                            v = parseFloat(v);
                            // IE specific opacity
                            if (isIE) {
                                s.filter = v === '' ? '' : "alpha(opacity=" + (v * 100) + ")";

                                if (!n.currentStyle || !n.currentStyle.hasLayout)
                                    s.display = 'inline-block';
                            }
                            s[na] = v;
                            break;
                        case 'float':
                            na = isIE ? 'styleFloat' : 'cssFloat';
                            break;
                        default:
                            if (v && /(margin|padding|width|height|top|bottom|left|right)/.test(na)) {
                                // Add pixel value if number
                                v = /^[\-0-9\.]+$/.test(v) ? v + 'px' : v;
                            }
                            break;
                    }
                    s[na] = v;
                }
            },
            /**
             * Set styles
             * @param {Object} el Target Element
             * @param {Object} props Object of style key/values
             */
            styles: function (el, props) {
                var t = this;
                JCEMediaBox.each(props, function (v, s) {
                    return t.style(el, s, v);
                });

            },
            /**
             * Set an Element attribute
             * @param {Object} el
             * @param {Object} s
             * @param {Object} v
             */
            attribute: function (el, s, v) {
                if (typeof v == 'undefined') {
                    if (s == 'class') {
                        return el.className;
                    }
                    v = el.getAttribute(s);
                    // Remove anonymous function from events
                    if (v && /^on/.test(s)) {
                        v = v.toString();
                        v = v.replace(/^function\s+anonymous\(\)\s+\{\s+(.*)\s+\}$/, '$1');
                    }
                    // Fix Hspace
                    if (s == 'hspace' && v == -1) {
                        v = '';
                    }
                    return v;
                }
                // Remove attribute if no value
                if (v === '') {
                    el.removeAttribute(s);
                }

                switch (s) {
                    case 'style':
                        if (typeof v == 'object') {
                            this.styles(el, v);
                        } else {
                            el.style.cssText = v;
                        }
                        break;
                    case 'class':
                        el.className = v || '';
                        break;
                    default:
                        el.setAttribute(s, v);
                        break;
                }
            },
            /**
             * Set Attributes on an Element
             * @param {Object} el Target Element
             * @param {Object} attribs Attributes Object
             */
            attributes: function (el, attribs) {
                var t = this;
                JCEMediaBox.each(attribs, function (v, s) {
                    t.attribute(el, s, v);
                });

            },
            /**
             * Create an Element
             * @param {Object} el Element to create
             * @param {Object} attribs Attributes
             * @param {Object} styles Styles
             * @param {Object} html HTML
             */
            create: function (el, attribs, html) {
                var o = document.createElement(el);
                this.attributes(o, attribs);
                if (typeof html != 'undefined') {
                    o.innerHTML = html;
                }

                return o;
            },
            /**
             * Add an element to another
             * @param {Object} n Element to add to
             * @param {Object} o Element to add. Will be created if string
             * @param {Object} a Optional attributes
             * @param {Object} h Optional HTML
             */
            add: function (n, o, a, h) {
                if (typeof o == 'string') {
                    a = a || {};
                    o = this.create(o, a, h);
                }
                n.appendChild(o);

                return o;
            },
            /**
             * Add an element before the passed in element
             * @param {Object} n Element to insert into
             * @param {Object} o Element to insert
             * @param {Object} c Element to insert before
             */
            addBefore: function (n, o, c) {
                if (typeof c == 'undefined') {
                    c = n.firstChild;
                }
                n.insertBefore(o, c);
            },
            /**
             * IE6 PNG Fix
             * @param {Object} el Element to fix
             */
            png: function (el) {
                var s;
                // Image Elements
                if (el.nodeName == 'IMG') {
                    s = el.src;
                    if (/\.png$/i.test(s)) {
                        this.attribute(el, 'src', JCEMediaBox.site + 'plugins/system/jcemediabox/img/blank.gif');
                        this.style(el, 'filter', "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + s + "')");
                    }
                    // Background-image styles
                } else {
                    s = this.style(el, 'background-image');
                    if (/\.png/i.test(s)) {
                        var bg = /url\("(.*)"\)/.exec(s)[1];
                        this.styles(el, {
                            'background-image': 'none',
                            'filter': "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + bg + "', sizingMethod='image')"
                        });
                    }
                }
            },
            encode: function (s) {
                return ('' + s).replace(/[<>&\"\']/g, function (c) {
                    return entities[c] || c;
                });
            },
            decode: function (s) {
                var el;

                el = document.createElement("div");
                el.innerHTML = s;

                return el.textContent || el.innerText || s;
            }

        },
        /**
         * Event Functions
         */
        Event: {
            events: [],
            /**
             * Add an Event handler
             * @param {Object} o Target Element
             * @param {Object} n Event name
             * @param {Object} f Callback function
             * @param {Object} s Scope
             * @copyright	Copyright 2009, Moxiecode Systems AB
             */
            add: function (o, n, f, s) {
                var t = this;

                // Setup event callback
                cb = function (e) {
                    // Is all events disabled
                    if (t.disabled)
                        return;

                    e = e || window.event;

                    // Patch in target, preventDefault and stopPropagation in IE it's W3C valid
                    if (e && JCEMediaBox.isIE) {
                        if (!e.target) {
                            e.target = e.srcElement || document;
                        }

                        if (!e.relatedTarget && e.fromElement) {
                            e.relatedTarget = e.fromElement == e.target ? e.toElement : e.fromElement;
                        }

                        // Patch in preventDefault, stopPropagation methods for W3C compatibility
                        JCEMediaBox.extend(e, {
                            preventDefault: function () {
                                this.returnValue = false;
                            },
                            stopPropagation: function () {
                                this.cancelBubble = true;
                            }

                        });
                    }
                    if (e && JCEMediaBox.isWebKit) {
                        if (e.target.nodeType == 3) {
                            e.target = e.target.parentNode;
                        }
                    }

                    if (!s)
                        return f(e);

                    return f.call(s, e);
                };

                // Internal function to add an event to an object
                function _add(o, n, f) {
                    if (o.attachEvent) {
                        o.attachEvent('on' + n, f);
                    } else if (o.addEventListener) {
                        o.addEventListener(n, f, false);
                    } else {
                        o['on' + n] = f;
                    }
                }

                t.events.push({
                    obj: o,
                    name: n,
                    func: f,
                    cfunc: cb,
                    scope: s
                });

                // Add event
                _add(o, n, cb);
            },
            /**
             * Removes the specified event handler by name and function from a element or collection of elements.
             *
             * @method remove
             * @param {String/Element/Array} o Element ID string or HTML element or an array of elements or ids to remove handler from.
             * @param {String} n Event handler name like for example: "click"
             * @param {function} f Function to remove.
             * @return {bool/Array} Bool state if true if the handler was removed or an array with states if multiple elements where passed in.
             * @copyright	Copyright 2009, Moxiecode Systems AB
             */
            remove: function (o, n, f) {
                var t = this, a = t.events, s = false;

                JCEMediaBox.each(a, function (e, i) {
                    if (e.obj == o && e.name == n && (!f || (e.func == f || e.cfunc == f))) {
                        a.splice(i, 1);
                        t._remove(o, n, e.cfunc);
                        s = true;
                        return false;
                    }
                });

                return s;
            },
            /**
             * Internal function to remove an Event
             * @param {Object} o
             * @param {Object} n
             * @param {Object} f
             * @copyright	Copyright 2009, Moxiecode Systems AB
             */
            _remove: function (o, n, f) {
                if (o) {
                    try {
                        if (o.detachEvent)
                            o.detachEvent('on' + n, f);
                        else if (o.removeEventListener)
                            o.removeEventListener(n, f, false);
                        else
                            o['on' + n] = null;
                    } catch (ex) {
                        // Might fail with permission denined on IE so we just ignore that
                    }
                }
            },
            /**
             * Cancels an event for both bubbeling and the default browser behavior.
             *
             * @method cancel
             * @param {Event} e Event object to cancel.
             * @return {Boolean} Always false.
             * @copyright Copyright 2009, Moxiecode Systems AB
             */
            cancel: function (e) {
                if (!e)
                    return false;

                this.stop(e);

                return this.prevent(e);
            },
            /**
             * Stops propogation/bubbeling of an event.
             *
             * @method stop
             * @param {Event} e Event to cancel bubbeling on.
             * @return {Boolean} Always false.
             * @copyright	Copyright 2009, Moxiecode Systems AB
             */
            stop: function (e) {
                if (e.stopPropagation)
                    e.stopPropagation();
                else
                    e.cancelBubble = true;

                return false;
            },
            /**
             * Prevent default browser behvaior of an event.
             *
             * @method prevent
             * @param {Event} e Event to prevent default browser behvaior of an event.
             * @return {Boolean} Always false.
             * @copyright	Copyright 2009, Moxiecode Systems AB
             */
            prevent: function (e) {
                if (e.preventDefault)
                    e.preventDefault();
                else
                    e.returnValue = false;

                return false;
            },
            /**
             * Destroys the instance.
             *
             * @method destroy
             * @copyright	Copyright 2009, Moxiecode Systems AB
             */
            destroy: function () {
                var t = this;

                JCEMediaBox.each(t.events, function (e, i) {
                    t._remove(e.obj, e.name, e.cfunc);
                    e.obj = e.cfunc = null;
                });

                t.events = [];
                t = null;
            },
            /**
             * Adds an unload handler to the document. This handler will be executed when the document gets unloaded.
             * This method is useful for dealing with browser memory leaks where it might be vital to remove DOM references etc.
             *
             * @method addUnload
             * @param {function} f Function to execute before the document gets unloaded.
             * @param {Object} s Optional scope to execute the function in.
             * @return {function} Returns the specified unload handler function.
             * @copyright	Copyright 2009, Moxiecode Systems AB
             */
            addUnload: function (f, s) {
                var t = this;

                f = {
                    func: f,
                    scope: s || this
                };

                if (!t.unloads) {
                    function unload() {
                        var li = t.unloads, o, n;

                        if (li) {
                            // Call unload handlers
                            for (n in li) {
                                o = li[n];

                                if (o && o.func)
                                    o.func.call(o.scope, 1); // Send in one arg to distinct unload and user destroy
                            }

                            // Detach unload function
                            if (window.detachEvent) {
                                window.detachEvent('onbeforeunload', fakeUnload);
                                window.detachEvent('onunload', unload);
                            } else if (window.removeEventListener)
                                window.removeEventListener('unload', unload, false);

                            // Destroy references
                            t.unloads = o = li = w = unload = 0;

                            // Run garbarge collector on IE
                            if (window.CollectGarbage)
                                CollectGarbage();
                        }
                    }
                    ;

                    function fakeUnload() {
                        var d = document;

                        // Is there things still loading, then do some magic
                        if (d.readyState == 'interactive') {
                            function stop() {
                                // Prevent memory leak
                                d.detachEvent('onstop', stop);

                                // Call unload handler
                                if (unload)
                                    unload();

                                d = 0;
                            }
                            ;

                            // Fire unload when the currently loading page is stopped
                            if (d)
                                d.attachEvent('onstop', stop);

                            // Remove onstop listener after a while to prevent the unload function
                            // to execute if the user presses cancel in an onbeforeunload
                            // confirm dialog and then presses the browser stop button
                            window.setTimeout(function () {
                                if (d)
                                    d.detachEvent('onstop', stop);
                            }, 0);

                        }
                    }
                    ;

                    // Attach unload handler
                    if (window.attachEvent) {
                        window.attachEvent('onunload', unload);
                        window.attachEvent('onbeforeunload', fakeUnload);
                    } else if (window.addEventListener)
                        window.addEventListener('unload', unload, false);

                    // Setup initial unload handler array
                    t.unloads = [f];
                } else
                    t.unloads.push(f);

                return f;
            },
            /**
             * Removes the specified function form the unload handler list.
             *
             * @method removeUnload
             * @param {function} f Function to remove from unload handler list.
             * @return {function} Removed function name or null if it wasn't found.
             */
            removeUnload: function (f) {
                var u = this.unloads, r = null;

                JCEMediaBox.each(u, function (o, i) {
                    if (o && o.func == f) {
                        u.splice(i, 1);
                        r = f;
                        return false;
                    }
                });

                return r;
            }

        },
        Dimensions: {
            /**
             * Get client window width
             */
            getWidth: function () {
                return document.documentElement.clientWidth || document.body.clientWidth || window.innerWidth || 0;
            },
            /**
             * Get client window height
             */
            getHeight: function () {
                if (JCEMediaBox.isiOS || JCEMediaBox.isAndroid) {
                    // Get zoom level of mobile Safari
                    // Note, that such zoom detection might not work correctly in other browsers
                    // We use width, instead of height, because there are no vertical toolbars :)
                    var zoomLevel = document.documentElement.clientWidth / window.innerWidth;

                    // window.innerHeight returns height of the visible area. 
                    // We multiply it by zoom and get out real height.
                    return window.innerHeight * zoomLevel;
                }

                return document.documentElement.clientHeight || document.body.clientHeight || window.innerHeight || 0;
            },
            /**
             * Get client window scroll height
             */
            getScrollHeight: function () {
                return document.documentElement.scrollHeight || document.body.scrollHeight || 0;
            },
            /**
             * Get client window scroll width
             */
            getScrollWidth: function () {
                return document.documentElement.scrollWidth || document.body.scrollWidth || 0;
            },
            /**
             * Get client window scroll top
             */
            getScrollTop: function () {
                return document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop || 0;
            },
            /**
             * Get the page scrollbar width
             */
            getScrollbarWidth: function () {
                var DOM = JCEMediaBox.DOM;

                if (this.scrollbarWidth) {
                    return this.scrollbarWidth;
                }

                var outer = DOM.add(document.body, 'div', {
                    'style': {
                        position: 'absolute',
                        visibility: 'hidden',
                        width: 200,
                        height: 200,
                        border: 0,
                        margin: 0,
                        padding: 0,
                        overflow: 'hidden'
                    }
                });

                var inner = DOM.add(outer, 'div', {
                    'style': {
                        width: '100%',
                        height: 200,
                        border: 0,
                        margin: 0,
                        padding: 0
                    }
                });

                var w1 = parseInt(inner.offsetWidth);
                outer.style.overflow = 'scroll';
                var w2 = parseInt(inner.offsetWidth);
                if (w1 == w2) {
                    w2 = parseInt(outer.clientWidth);
                }
                document.body.removeChild(outer);
                this.scrollbarWidth = (w1 - w2);

                return this.scrollbarWidth;
            },
            /**
             * Get the outerwidth of an element
             * @param {Object} n Element
             */
            outerWidth: function (n) {
                var v = 0, x = 0;

                x = n.offsetWidth;

                if (!x) {
                    JCEMediaBox.each(['padding-left', 'padding-right', 'border-left', 'border-right', 'width'], function (s) {
                        v = parseFloat(JCEMediaBox.DOM.style(n, s));
                        v = /[0-9]/.test(v) ? v : 0;

                        x = x + v;
                    });

                }
                return x;
            },
            /**
             * Get the outerheight of an Element
             * @param {Object} n Element
             */
            outerHeight: function (n) {
                var v = 0, x = 0;

                x = n.offsetHeight;

                if (!x) {
                    JCEMediaBox.each(['padding-top', 'padding-bottom', 'border-top', 'border-bottom', 'height'], function (s) {
                        v = parseFloat(JCEMediaBox.DOM.style(n, s));
                        v = /[0-9]/.test(v) ? v : 0;
                        x = x + v;
                    });

                }
                return x;
            }

        },
        /**
         * FX Functions
         * @param {Object} t
         * @param {Object} b
         * @param {Object} c
         * @param {Object} d
         */
        FX: {
            animate: function (el, props, speed, cb) {
                var DOM = JCEMediaBox.DOM;
                var options = {
                    speed: speed || 100,
                    callback: cb ||
                            function () {
                            }

                };

                var styles = {}, sv;

                JCEMediaBox.each(props, function (v, s) {
                    // Find start value
                    sv = parseFloat(DOM.style(el, s));
                    styles[s] = [sv, v];
                });

                new JCEMediaBox.fx(el, options).custom(styles);
                return true;
            }

        }
    };

    /**
     * XHR Functions
     * Based on XHR.js (Mootools) and XHR.js (TinyMCE)
     * Copyright 2009, Moxiecode Systems AB, <http://tinymce.moxiecode.com>
     * copyright (c) 2007 Valerio Proietti, <http://mad4milk.net>
     */
    JCEMediaBox.XHR = function (options, scope) {
        this.options = {
            //method: 'GET',
            async: true,
            headers: {
                //'User-Agent' 		: 'XMLHTTP/1.0',
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
            },
            data: null,
            encoding: 'UTF-8',
            success: function () {
            },
            error: function () {
            }

        };
        // Set options
        JCEMediaBox.extend(this.options, options);
        // optional scope for callback functions
        this.scope = scope || this;
    };

    JCEMediaBox.XHR.prototype = {
        /**
         * Set transport method
         */
        setTransport: function () {
            function get(s) {
                var x = 0;

                try {
                    x = new ActiveXObject(s);
                } catch (ex) {
                }

                return x;
            }

            this.transport = window.XMLHttpRequest ? new XMLHttpRequest() : get('Microsoft.XMLHTTP') || get('Msxml2.XMLHTTP');
        },
        /**
         * Process return
         */
        onStateChange: function () {
            if (this.transport.readyState != 4 || !this.running) {
                return;
            }

            this.running = false;

            if ((this.transport.status >= 200) && (this.transport.status < 300)) {
                var s = this.transport.responseText;
                var x = this.transport.responseXML;

                this.options.success.call(this.scope, s, x);
            } else {
                this.options.error.call(this.scope, this.transport, this.options);
            }
            // Clean up
            this.transport.onreadystatechange = function () {
            };

            this.transport = null;
        },
        /**
         * Send request
         * @param {Object} url URL
         * @param {Object} options Request options
         * @param {Object} s Scope
         */
        send: function (url) {
            var t = this, extend = JCEMediaBox.extend;
            if (this.running) {
                return this;
            }
            this.running = true;
            // Set request transport method
            this.setTransport();
            // store request method as uppercase (GET|POST)
            var method = this.options.data ? 'POST' : 'GET';

            // set encoding
            var encoding = (this.options.encoding) ? '; charset=' + this.options.encoding.toUpperCase() : '';

            // Set standard GET header
            var contentType = {
                'Content-type': 'text/html' + encoding
            };

            // Set URL Encoded / POST header options
            if (this.options.data) {
                contentType = {
                    'Content-type': 'application/x-www-form-urlencoded' + encoding
                };
            }

            extend(this.options.headers, contentType);

            // Open transport
            this.transport.open(method, url, this.options.async);
            // Set readystatechange function
            this.transport.onreadystatechange = function () {
                return t.onStateChange();
            };

            /*if (method == 'POST' && this.transport.overrideMimeType) {
             extend(this.options.headers, {
             'Connection': 'close'
             });
             }*/
            // set headers
            for (var type in this.options.headers) {
                try {
                    this.transport.setRequestHeader(type, this.options.headers[type]);
                } catch (e) {
                }
            }
            // send request
            this.transport.send(this.options.data);
        }

    }, /**
     * Core Fx Functions
     * @param {Object} el Element to animate
     * @param {Object} props A set of styles to animate
     * @param {String} speed Speed of animation in milliseconds
     * @param {Object} cb Optional Callback when the animation finishes
     */
    JCEMediaBox.fx = function (el, options) {
        this.element = el;
        this.callback = options.callback;
        this.speed = options.speed;
        this.wait = true;
        this.fps = 50;
        this.now = {};
    };

    /**
     * Based on Moo.Fx.Base and Moo.Fx.Styles
     * @copyright (c) 2006 Valerio Proietti (http://mad4milk.net). MIT-style license.
     */
    JCEMediaBox.fx.prototype = {
        step: function () {
            var time = new Date().getTime();
            if (time < this.time + this.speed) {
                this.cTime = time - this.time;
                this.setNow();

            } else {
                var t = this;
                this.clearTimer();
                this.now = this.to;

                setTimeout(function () {
                    t.callback.call(t.element, t);
                }, 10);

            }
            this.increase();
        },
        setNow: function () {
            var p;

            for (p in this.from) {
                this.now[p] = this.compute(this.from[p], this.to[p]);
            }
        },
        compute: function (from, to) {
            var change = to - from;
            return this.transition(this.cTime, from, change, this.speed);
        },
        clearTimer: function () {
            clearInterval(this.timer);
            this.timer = null;
            return this;
        },
        start: function (from, to) {
            var t = this;
            if (!this.wait)
                this.clearTimer();

            if (this.timer)
                return;

            this.from = from;
            this.to = to;
            this.time = new Date().getTime();
            this.timer = setInterval(function () {
                return t.step();
            }, Math.round(1000 / this.fps));

            return this;
        },
        custom: function (o) {
            if (this.timer && this.wait)
                return;
            var from = {}, to = {}, property;

            for (property in o) {
                from[property] = o[property][0];
                to[property] = o[property][1];
            }
            return this.start(from, to);
        },
        increase: function () {
            for (var p in this.now) {
                this.setStyle(this.element, p, this.now[p]);
            }
        },
        transition: function (t, b, c, d) {
            return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
        },
        setStyle: function (e, p, v) {
            JCEMediaBox.DOM.style(e, p, v);
        }

    },
    /**
     * Core Tooltip Object
     * Create and display tooltips
     * Based on Mootools Tips Class
     * copyright (c) 2007 Valerio Proietti, <http://mad4milk.net>
     */
    JCEMediaBox.ToolTip = {
        /**
         * Initialise the tooltip
         * @param {Object} elements
         * @param {Object} options
         */
        init: function () {
            var t = this;

            // Load tooltip theme
            var theme = JCEMediaBox.options.theme == 'custom' ? JCEMediaBox.options.themecustom : JCEMediaBox.options.theme;

            this.tooltiptheme = '';

            new JCEMediaBox.XHR({
                success: function (text, xml) {
                    var re = /<!-- THEME START -->([\s\S]*?)<!-- THEME END -->/;
                    if (re.test(text)) {
                        text = re.exec(text)[1];
                    }
                    t.tooltiptheme = text;

                    t.create();
                }

            }).send(JCEMediaBox.site + JCEMediaBox.options.themepath + '/' + theme + '/tooltip.html');
        },
        /**
         * Create tooltips in the cuurent document or node
         * @param o Option parent node, defaults to document
         */
        create: function (o) {
            var t = this, each = JCEMediaBox.each, DOM = JCEMediaBox.DOM, Event = JCEMediaBox.Event;

            /**
             * Private internal function to exclude children of element in event
             * @param {Object} el 	Element with event
             * @param {Object} e 	Event object
             * @param {Object} fn 	Callback function
             */
            function _withinElement(el, e, fn) {
                // Get target
                var p = e.relatedTarget;
                // If element is not target and target not within element...
                while (p && p != el) {
                    try {
                        p = p.parentNode;
                    } catch (e) {
                        p = el;
                    }
                }

                if (p != el) {
                    return fn.call(this);
                }
                return false;
            }

            // Add events to each found tooltip element
            each(DOM.select('.jcetooltip, .jce_tooltip', o), function (el) {
                // store away title
                DOM.attribute(el, 'data-title', el.title);
                DOM.remove(el, 'title');

                var n = el;

                // set event element as parent if popup icon
                if (el.nodeName == 'IMG' && el.parentNode.className == 'jcemediabox-zoom-span') {
                    n = el.parentNode;
                }

                Event.add(n, 'mouseover', function (e) {
                    _withinElement(el, e, function () {
                        return t.start(el);
                    });

                });

                Event.add(n, 'mouseout', function (e) {
                    _withinElement(el, e, function () {
                        return t.end(el);
                    });

                });

                Event.add(n, 'mousemove', function (e) {
                    return t.locate(e);
                });

            });

        },
        /**
         * Create the tooltip div
         */
        build: function () {
            if (!this.toolTip) {
                var DOM = JCEMediaBox.DOM;
                this.toolTip = DOM.add(document.body, 'div', {
                    'style': {
                        'opacity': 0
                    },
                    'class': 'jcemediabox-tooltip'
                }, this.tooltiptheme);
                if (JCEMediaBox.isIE6) {
                    DOM.addClass(this.toolTip, 'ie6');
                }
            }
        },
        /**
         * Show the tooltip and build the tooltip text
         * @param {Object} e  Event
         * @param {Object} el Target Element
         */
        start: function (el) {
            var t = this, DOM = JCEMediaBox.DOM;
            if (!this.tooltiptheme)
                return false;
            // Create tooltip if it doesn't exist
            this.build();

            // Get tooltip text from title
            var text = DOM.attribute(el, 'data-title') || '', title = '';

            // Split tooltip text ie: title::text
            if (/::/.test(text)) {
                var parts = text.split('::');
                title = JCEMediaBox.trim(parts[0]);
                text = JCEMediaBox.trim(parts[1]);
            }

            var h = '';
            // Set tooltip title html
            if (title) {
                h += '<h4>' + title + '</h4>';
            }
            // Set tooltip text html
            if (text) {
                h += '<p>' + text + '</p>';
            }

            // Set tooltip html
            var tn = DOM.get('jcemediabox-tooltip-text');
            // Use simple tooltip
            if (typeof tn == 'undefined') {
                this.toolTip.className = 'jcemediabox-tooltip-simple';
                this.toolTip.innerHTML = h;
            } else {
                tn.innerHTML = h;
            }
            // Set visible
            DOM.style(t.toolTip, 'visibility', 'visible');
            // Fade in tooltip
            JCEMediaBox.FX.animate(t.toolTip, {
                'opacity': JCEMediaBox.options.tooltip.opacity
            }, JCEMediaBox.options.tooltip.speed);
        },
        /**
         * Fade Out and hide the tooltip
         * Restore the original element title
         * @param {Object} el Element
         */
        end: function (el) {
            if (!this.tooltiptheme)
                return false;

            // Fade out tooltip and hide

            JCEMediaBox.DOM.styles(this.toolTip, {
                'visibility': 'hidden',
                'opacity': 0
            });
        },
        /**
         * Position the tooltip
         * @param {Object} e Event trigger
         */
        locate: function (e) {
            if (!this.tooltiptheme)
                return false;

            this.build();

            var o = JCEMediaBox.options.tooltip.offsets;
            var page = {
                'x': e.pageX || e.clientX + document.documentElement.scrollLeft,
                'y': e.pageY || e.clientY + document.documentElement.scrollTop
            };
            var tip = {
                'x': this.toolTip.offsetWidth,
                'y': this.toolTip.offsetHeight
            };
            var pos = {
                'x': page.x + o.x,
                'y': page.y + o.y
            };

            var ah = 0;

            switch (JCEMediaBox.options.tooltip.position) {
                case 'tl':
                    pos.x = (page.x - tip.x) - o.x;
                    pos.y = (page.y - tip.y) - (ah + o.y);
                    break;
                case 'tr':
                    pos.x = page.x + o.x;
                    pos.y = (page.y - tip.y) - (ah + o.y);
                    break;
                case 'tc':
                    pos.x = (page.x - Math.round((tip.x / 2))) + o.x;
                    pos.y = (page.y - tip.y) - (ah + o.y);
                    break;
                case 'bl':
                    pos.x = (page.x - tip.x) - o.x;
                    pos.y = (page.y + Math.round((tip.y / 2))) - (ah + o.y);
                    break;
                case 'br':
                    pos.x = page.x + o.x;
                    pos.y = page.y + o.y;
                    break;
                case 'bc':
                    pos.x = (page.x - (tip.x / 2)) + o.x;
                    pos.y = page.y + ah + o.y;
                    break;
            }
            JCEMediaBox.DOM.styles(this.toolTip, {
                top: pos.y,
                left: pos.x
            });
        },
        /**
         * Position the tooltip
         * @param {Object} element
         */
        position: function (element) {
        }

    },
    /**
     * Core Popup Object
     * Creates and displays a media popup
     */
    JCEMediaBox.Popup = {
        /**
         * List of default addon media types
         */
        addons: {
            'flash': {},
            'image': {},
            'iframe': {},
            'html': {},
            'pdf': {}
        },
        /**
         * Extend the addons object with a new addon
         * @param {String} n Addon name
         * @param {Object} o Addon object
         */
        setAddons: function (n, o) {
            JCEMediaBox.extend(this.addons[n], o);
        },
        /**
         * Return an addon object by name or all addons
         * @param {String} n Addon name
         */
        getAddons: function (n) {
            if (n) {
                return this.addons[n];
            }
            return this.addons;
        },
        /**
         * Get / Test an addon object
         * @param {Object} v
         * @param {Object} n
         */
        getAddon: function (v, n) {
            var cp = false, r, each = JCEMediaBox.each;

            addons = this.getAddons(n);

            each(this.addons, function (o, s) {
                each(o, function (fn) {
                    r = fn.call(this, v);
                    if (typeof r != 'undefined') {
                        cp = r;
                    }
                });

            });

            return cp;
        },
        /**
         * Clean an event removing anonymous function etc.
         * @param {String} s Event content
         * Copyright 2009, Moxiecode Systems AB
         */
        cleanEvent: function (s) {
            return s.replace(/^function\s+anonymous\(\)\s+\{\s+(.*)\s+\}$/, '$1');
        },
        /**
         * Create an object from a well formed JSON string
         * @param {String} data JSON String
         * @return {Object}
         * Logic borrowed from JQuery
         * http://jquery.com/
         * Copyright 2010, John Resig
         */
        parseJSON: function (data) {
            if (typeof data !== "string" || !data) {
                return null;
            }

            if (/^[\],:{}\s]*$/
                    .test(data.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                            .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                            .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
                // Try to use the native JSON parser first
                return window.JSON && window.JSON.parse ?
                        window.JSON.parse(data) :
                        (new Function("return " + data))();
            }
        },
        /**
         * Get a popup parameter object
         * @param {String} s Parameter string
         */
        params: function (s) {
            var a = [], x = [], self = this, DOM = JCEMediaBox.DOM;

            function trim(s) {
                return s = s.replace(/^\s+/, '').replace(/\s+$/, '');
            }

            if (typeof s == 'string') {
                // if a JSON string return the object
                if (/^\{[\w\W]+\}$/.test(s)) {
                    return this.parseJSON(s);
                }

                // JCE MediaBox parameter format eg: title[title]
                if (/\w+\[[^\]]+\]/.test(s)) {
                    s = s.replace(/([\w]+)\[([^\]]+)\](;)?/g, function (a, b, c, d) {

                        return '"' + b + '":"' + DOM.encode(trim(c)) + '"' + (d ? ',' : '');
                    });

                    return this.parseJSON('{' + s + '}');
                }

                // if url
                if (s.indexOf('&') != -1) {
                    x = s.split(/&(amp;)?/g);
                } else {
                    x.push(s);
                }
            }

            // if array
            if (typeof s == 'object' && s instanceof Array) {
                x = s;
            }

            JCEMediaBox.each(x, function (n, i) {
                if (n) {
                    n = n.replace(/^([^\[]+)(\[|=|:)([^\]]*)(\]?)$/, function (a, b, c, d) {
                        if (d) {
                            if (!/[^0-9]/.test(d)) {
                                return '"' + b + '":' + parseInt(d);
                            }

                            return '"' + b + '":"' + DOM.encode(trim(d)) + '"';
                        }
                        return '';
                    });

                    if (n) {
                        a.push(n);
                    }
                }
            });

            return this.parseJSON('{' + a.join(',') + '}');
        },
        /**
         * Gets the raw data of a cookie by name.
         * Copyright 2009, Moxiecode Systems AB
         *
         * @method get
         * @param {String} n Name of cookie to retrive.
         * @return {String} Cookie data string.
         */
        getCookie: function (n) {
            var c = document.cookie, e, p = n + "=", b;

            // Strict mode
            if (!c)
                return;

            b = c.indexOf("; " + p);

            if (b == -1) {
                b = c.indexOf(p);

                if (b != 0)
                    return null;
            } else {
                b += 2;
            }

            e = c.indexOf(";", b);

            if (e == -1)
                e = c.length;

            return unescape(c.substring(b + p.length, e));
        },
        /**
         * Sets a raw cookie string.
         * Copyright 2009, Moxiecode Systems AB
         *
         * @method set
         * @param {String} n Name of the cookie.
         * @param {String} v Raw cookie data.
         * @param {Date} e Optional date object for the expiration of the cookie.
         * @param {String} p Optional path to restrict the cookie to.
         * @param {String} d Optional domain to restrict the cookie to.
         * @param {String} s Is the cookie secure or not.
         */
        setCookie: function (n, v, e, p, d, s) {
            document.cookie = n + "=" + escape(v) +
                    ((e) ? "; expires=" + e.toGMTString() : "") +
                    ((p) ? "; path=" + escape(p) : "") +
                    ((d) ? "; domain=" + d : "") +
                    ((s) ? "; secure" : "");
        },
        /**
         * Convert legacy popups to new format
         */
        convertLegacy: function () {
            var self = this, each = JCEMediaBox.each, DOM = JCEMediaBox.DOM;
            each(DOM.select('a[href]'), function (el) {

                // Only JCE Popup links
                if (/com_jce/.test(el.href)) {
                    var p, s, img;
                    var oc = DOM.attribute(el, 'onclick');
                    if (oc) {
                        s = oc.replace(/&#39;/g, "'").split("'");
                        p = self.params(s[1]);

                        var img = p.img || '';
                        var title = p.title || '';
                    }

                    if (img) {
                        if (!/http:\/\//.test(img)) {
                            if (img.charAt(0) == '/') {
                                img = img.substr(1);
                            }
                            img = JCEMediaBox.site.replace(/http:\/\/([^\/]+)/, '') + img;
                        }

                        DOM.attributes(el, {
                            'href': img,
                            'title': title.replace(/_/, ' '),
                            'onclick': ''
                        });

                        DOM.addClass(el, 'jcepopup');
                    }
                }
            });

        },
        /**
         * Convert lightbox popups to MediaBox
         */
        convertLightbox: function () {
            var each = JCEMediaBox.each, DOM = JCEMediaBox.DOM;
            each(DOM.select('a[rel*=lightbox]'), function (el) {
                DOM.addClass(el, 'jcepopup');
                r = el.rel.replace(/lightbox\[?([^\]]*)\]?/, function (a, b) {
                    if (b) {
                        return 'group[' + b + ']';
                    }
                    return '';
                });

                DOM.attribute(el, 'rel', r);
            });

        },
        /**
         * Convert shadowbox popups to MediaBox
         */
        convertShadowbox: function () {
            var each = JCEMediaBox.each, DOM = JCEMediaBox.DOM;
            each(DOM.select('a[rel*=shadowbox]'), function (el) {
                DOM.addClass(el, 'jcepopup');
                r = el.rel.replace(/shadowbox\[?([^\]]*)\]?/, function (a, b) {
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

                DOM.attribute(el, 'rel', r);
            });

        },
        /**
         * Translate popup labels
         * @param {String} s Theme HTML
         */
        translate: function (s) {
            if (!s) {
                s = this.popup.theme;
            }
            s = s.replace(/\{#(\w+?)\}/g, function (a, b) {
                return JCEMediaBox.options.popup.labels[b];
            });

            return s;
        },
        /**
         * Returns a styles object from a parameter
         * @param {Object} o
         */
        styles: function (o) {
            var x = [];
            if (!o)
                return {};

            JCEMediaBox.each(o.split(';'), function (s, i) {
                s = s.replace(/(.*):(.*)/, function (a, b, c) {
                    return '"' + b + '":"' + c + '"';
                });

                x.push(s);
            });

            return this.parseJSON('{' + x.join(',') + '}');
        },
        /**
         * Get the file type from the url, type attribute or className
         * @param {Object} el
         */
        getType: function (el) {
            var o = {}, type = '';

            // Media types
            if (/(director|windowsmedia|mplayer|quicktime|real|divx|flash|pdf)/.test(el.type)) {
                type = /(director|windowsmedia|mplayer|quicktime|real|divx|flash|pdf)/.exec(el.type)[1];
            }

            o = this.getAddon(el.src);

            if (o && o.type) {
                type = o.type;
            }

            return type || el.type || 'iframe';
        },
        /**
         * Determine media type and properties
         * @param {Object} c
         */
        mediatype: function (c) {
            var ci, cb, mt;

            c = /(director|windowsmedia|mplayer|quicktime|real|divx|flash|pdf)/.exec(c);

            switch (c[1]) {
                case 'director':
                case 'application/x-director':
                    ci = '166b1bca-3f9c-11cf-8075-444553540000';
                    cb = 'http://download.macromedia.com/pub/shockwave/cabs/director/sw.cab#version=8,5,1,0';
                    mt = 'application/x-director';
                    break;
                case 'windowsmedia':
                case 'mplayer':
                case 'application/x-mplayer2':
                    ci = '6bf52a52-394a-11d3-b153-00c04f79faa6';
                    cb = 'http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=5,1,52,701';
                    mt = 'application/x-mplayer2';
                    break;
                case 'quicktime':
                case 'video/quicktime':
                    ci = '02bf25d5-8c17-4b23-bc80-d3488abddc6b';
                    cb = 'http://www.apple.com/qtactivex/qtplugin.cab#version=6,0,2,0';
                    mt = 'video/quicktime';
                    break;
                case 'real':
                case 'realaudio':
                case 'audio/x-pn-realaudio-plugin':
                    ci = 'cfcdaa03-8be4-11cf-b84b-0020afbbccfa';
                    cb = '';
                    mt = 'audio/x-pn-realaudio-plugin';
                    break;
                case 'divx':
                case 'video/divx':
                    ci = '67dabfbf-d0ab-41fa-9c46-cc0f21721616';
                    cb = 'http://go.divx.com/plugin/DivXBrowserPlugin.cab';
                    mt = 'video/divx';
                    break;
                case 'pdf':
                case 'application/pdf':
                    ci = 'ca8a9780-280d-11cf-a24d-444553540000';
                    cb = '';
                    mt = 'application/pdf';
                    break;
                default:
                case 'flash':
                case 'application/x-shockwave-flash':
                    ci = 'd27cdb6e-ae6d-11cf-96b8-444553540000';
                    cb = 'http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,124,0';
                    mt = 'application/x-shockwave-flash';
                    break;
            }
            return {
                'classid': ci,
                'codebase': cb,
                'mediatype': mt
            };
        },
        /**
         * Determine whether the url is local
         * @param {Object} s
         */
        islocal: function (s) {
            if (/^(\w+:)?\/\//.test(s)) {
                return new RegExp('^(' + JCEMediaBox.site + ')').test(s);
            } else {
                return true;
            }
        },
        /**
         * Get the width of the container frame
         */
        frameWidth: function () {
            var w = 0, el = this.frame;

            JCEMediaBox.each(['left', 'right'], function (s) {
                w = w + parseFloat(JCEMediaBox.DOM.style(el, 'padding-' + s));
            });

            return parseFloat(this.frame.clientWidth - w);
        },
        /**
         * Get the height of the container frame
         */
        frameHeight: function () {
            var h = 0, el = this.frame, DIM = JCEMediaBox.Dimensions;

            JCEMediaBox.each(['top', 'bottom'], function (s) {
                h = h + parseFloat(JCEMediaBox.DOM.style(el, 'padding-' + s));
            });

            h = h + ((JCEMediaBox.isIE6 || JCEMediaBox.isIE7) ? DIM.getScrollbarWidth() : 0);

            return parseInt(DIM.getHeight()) - h;
        },
        /**
         * Get the width of the usable window
         */
        width: function () {
            return this.frameWidth() - JCEMediaBox.Dimensions.getScrollbarWidth();
        },
        /**
         * Get the height of the usable window less info divs
         */
        height: function () {
            var h = 0, t = this, each = JCEMediaBox.each, DIM = JCEMediaBox.Dimensions;
            each(['top', 'bottom'], function (s) {
                var el = t['info-' + s];
                if (el) {
                    h = h + parseInt(DIM.outerHeight(el));
                }
            });

            return this.frameHeight() - h;
        },
        /**
         * Print the page contents (TODO)
         */
        printPage: function () {
            return false;
        },
        /**
         * Create a popup zoom icon
         * @param {Object} el Popup link element
         */
        zoom: function (el) {
            var DOM = JCEMediaBox.DOM, extend = JCEMediaBox.extend, each = JCEMediaBox.each;
            var children = el.childNodes;

            // Create basic zoom element
            var zoom = DOM.create('span');

            // add IE6 identifier class
            if (JCEMediaBox.isIE6) {
                DOM.addClass(el, 'ie6');
            }

            var cls = DOM.attribute(el, 'class');
            // replace icon- with zoom- to avoid bootstrap etc. conflicts
            cls = cls.replace('icon-', 'zoom-', 'g');
            DOM.attribute(el, 'class', cls);

            var img = DOM.select('img', el);

            // If child is an image (thumbnail)
            if (img && img.length) {
                // get first img tag
                var child = img[0];

                var align = child.getAttribute('align');
                var vspace = child.getAttribute('vspace');
                var hspace = child.getAttribute('hspace');

                var styles = {};

                // Transfer margin, padding and border
                each(['top', 'right', 'bottom', 'left'], function (pos) {
                    // Set margin
                    styles['margin-' + pos] = DOM.style(child, 'margin-' + pos);
                    // Set padding
                    styles['padding-' + pos] = DOM.style(child, 'padding-' + pos);
                    // Set border
                    each(['width', 'style', 'color'], function (prop) {
                        styles['border-' + pos + '-' + prop] = DOM.style(child, 'border-' + pos + '-' + prop);
                    });
                });

                // Correct from deprecated align attribute
                if (/\w+/.test(align)) {
                    extend(styles, {
                        'float': /left|right/.test(align) ? align : '',
                        'text-align': /top|middle|bottom/.test(align) ? align : ''
                    });
                }
                // Correct from deprecated vspace attribute
                if (vspace > 0) {
                    extend(styles, {
                        'margin-top': parseInt(vspace),
                        'margin-bottom': parseInt(vspace)
                    });
                }
                // Correct from deprecated hspace attribute
                if (hspace > 0) {
                    extend(styles, {
                        'margin-left': parseInt(hspace),
                        'margin-right': parseInt(hspace)
                    });
                }

                var w = child.getAttribute('width');
                var h = child.getAttribute('height');
                var ws = child.style.width;

                // get 'real' width and height
                var rh = child.height, rw = child.width;

                // we can only render the zoom icon if we have a valid dimensions for the image
                if ((!w || !ws) && !rw) {
                    return false;
                }

                // height is set but not width, calculate width
                if (!w && h) {
                    w = h / rh * rw;
                }

                if (!w) {
                    // pixel value
                    if (/([0-9]+)(px)?$/.test(ws)) {
                        w = parseFloat(ws);
                        // other value
                    } else {
                        w = child.width;
                    }
                }

                // add width values if set
                if (w) {
                    child.setAttribute('width', w);
                    styles.width = w;
                }

                // Add style alignment
                extend(styles, {
                    'text-align': child.style.textAlign
                });

                var float = DOM.style(child, 'float');

                if (float === "left" || float === "right") {
                    styles.float = float;
                }

                /**
                 * Private Internal function
                 * Build and place the icon
                 * @param {Object} el The Parent Link Element
                 * @param {Object} zoom The Zoom Element
                 * @param {Object} zoom The Child Element (Image)
                 * @param {Object} styles Computed Styles object
                 */
                function _buildIcon(el, zoom, child, styles) {
                    // Clone image as span element
                    var span = DOM.add(el, 'span', {
                        'class': 'jcemediabox-zoom-span',
                        'style': child.style.cssText
                    });

                    // Set styles
                    DOM.styles(span, styles);

                    if (DOM.hasClass(el.parentNode, 'wf_caption')) {
                        span.style.width = null;
                        DOM.style(span, 'max-width', DOM.style(el.parentNode, 'max-width'));
                    }

                    if (span.style.width) {
                        DOM.style(span, 'max-width', span.style.width);
                        span.style.width = null;
                    }

                    // Move the image into the parent SPAN
                    DOM.add(span, child);
                    // Move the zoom icon into the parent SPAN
                    DOM.add(span, zoom);

                    // Remove attributes that may affect layout
                    each(['style', 'align', 'border', 'hspace', 'vspace'], function (v, i) {
                        child.removeAttribute(v);
                    });

                    // Add zoom-image class
                    DOM.addClass(zoom, 'jcemediabox-zoom-image');

                    // Set explicit positions for IE6 when zoom icon is png
                    if (JCEMediaBox.isIE6 && /\.png/i.test(DOM.style(zoom, 'background-image'))) {
                        DOM.png(zoom);
                    }

                    // Remove styles from image
                    DOM.styles(child, {
                        'margin': 0,
                        'padding': 0,
                        'float': 'none',
                        'border': 'none'
                    });
                }
                // build zoom icon
                _buildIcon(el, zoom, child, styles);
            } else {
                DOM.addClass(zoom, 'jcemediabox-zoom-link');
                if (DOM.hasClass(el, 'zoom-left')) {
                    DOM.addBefore(el, zoom);
                } else {
                    DOM.add(el, zoom);
                }
                // IE7 won't accept display:inherit
                if (JCEMediaBox.isIE7) {
                    DOM.style(zoom, 'display', 'inline-block');
                }
            }
            // Return zoom icon element
            return zoom;
        },
        /**
         * Process autopopups
         */
        auto: function () {
            var t = this, expires = JCEMediaBox.options.popup.cookie_expiry, dts, key;

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

            JCEMediaBox.each(this.popups, function (el, i) {
                if (el.auto) {
                    if (el.auto == 'single') {
                        // use element ID or base64 key
                        key = el.id || makeID(el.src);

                        // get cookie
                        var cookie = t.getCookie('jcemediabox_' + key + '_' + i);

                        // create cookie with base64 key and expiry
                        if (!cookie) {
                            // create data if expiry set
                            if (expires) {
                                dts = new Date();
                                dts.setHours(expires * 24);
                            }

                            t.setCookie('jcemediabox_' + key + '_' + i, 1, dts);
                            t.start(el);
                        }
                    } else if (el.auto == 'multiple') {
                        t.start(el);
                    }
                }
            });

        },
        /**
         * Initilise popup and create global jcepopup variable
         * @param {Object} elements Optional array of popup elements
         */
        init: function () {
            window.jcepopup = this;
            this.create();
        },
        /**
         * Get popup objects
         * @param {String} s Optional selector
         * @param {Object} p Optional parent element popups contained within
         */
        getPopups: function (s, p) {
            var selector = 'a.jcebox, a.jcelightbox, a.jcepopup, area.jcebox, area.jcelightbox, area.jcepopup';
            return JCEMediaBox.DOM.select(s || selector, p);
        },
        getData: function (n) {
            var DOM = JCEMediaBox.DOM, o = {}, data;
            var re = /\w+\[[^\]]+\]/;

            data = DOM.attribute(n, 'data-mediabox') || DOM.attribute(n, 'data-json');

            // try title or rel attributes
            if (!data) {
                var title = DOM.attribute(n, 'title');
                var rel = DOM.attribute(n, 'rel');

                if (title && re.test(title)) {
                    // convert to object
                    o = this.params(title);

                    // restore rel attribute
                    DOM.attribute(n, 'title', o.title || '');

                    return o;
                }

                if (rel && re.test(rel)) {
                    var args = [];

                    rel = rel.replace(/\b((\w+)\[(.*?)\])(;?)/g, function (a, b, c) {
                        args.push(b);
                        return '';
                    });

                    o = this.params(args) || {};

                    // restore rel attribute
                    DOM.attribute(n, 'rel', rel || o.rel || '');

                    return o;
                }
            } else {
                // remove data attributes
                n.removeAttribute('data-json');
                n.removeAttribute('data-mediabox');

                return this.params(data);
            }

            return o;
        },
        /**
         * Process a popup link and return properties object
         * @param {Object} el Popup link element
         */
        process: function (el) {
            var DOM = JCEMediaBox.DOM, data, o = {}, group = '', auto = false;

            // Fix title and rel and move parameters
            var title = el.title || '';
            var rel = el.rel || '';

            var src = el.href;

            // Legacy width/height values
            src = src.replace(/b(w|h)=([0-9]+)/g, function (s, k, v) {
                k = (k == 'w') ? 'width' : 'height';

                return k + '=' + v;
            });

            data = this.getData(el) || {};

            // Process rel attribute
            if (!/\w+\[[^\]]+\]/.test(rel)) {
                var rx = 'alternate|stylesheet|start|next|prev|contents|index|glossary|copyright|chapter|section|subsection|appendix|help|bookmark|nofollow|licence|tag|friend';
                var lb = '(lightbox(\[(.*?)\])?)';
                var lt = '(lyte(box|frame|show)(\[(.*?)\])?)';

                group = JCEMediaBox.trim(rel.replace(new RegExp('\s*(' + rx + '|' + lb + '|' + lt + ')\s*'), '', 'gi'));
            }

            // Get AREA parameters from URL if not set
            if (el.nodeName == 'AREA') {
                if (!data) {
                    data = this.params(src);
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

            // check for auto popup
            //if (el.id) {
            if (/autopopup-(single|multiple)/.test(el.className)) {
                auto = /(multiple)/.test(el.className) ? 'multiple' : 'single';
            }
            //}

            // get group from data object
            group = group || data.group || '';

            // Popup object
            JCEMediaBox.extend(o, {
                'src': src,
                'title': data.title || title,
                'group': DOM.hasClass(el, 'nogroup') ? '' : group,
                'type': data.type || el.type || '',
                'params': data,
                //'id'	: el.id || '',
                'auto': auto
            });

            // Remove type
            el.href = el.href.replace(/&type=(ajax|text\/html|text\/xml)/, '');

            return o;
        },
        /**
         * Create a popup from identifiable link or area elements
         * Load the popup theme
         * @param {Object} elements Optional array of popup elements
         */
        create: function (elements) {
            var t = this, each = JCEMediaBox.each, Event = JCEMediaBox.Event, DOM = JCEMediaBox.DOM, pageload = false, auto = false;

            // set pageload marker
            if (!elements) {
                pageload = true;
                this.popups = [];

                // Converts a legacy (window) popup into an inline popup
                if (JCEMediaBox.options.popup.legacy == 1) {
                    t.convertLegacy();
                }

                // Converts a lightbox popup into mediabox popup
                if (JCEMediaBox.options.popup.lightbox == 1) {
                    t.convertLightbox();
                }

                // Converts a shadowbox popup into mediabox popup
                if (JCEMediaBox.options.popup.shadowbox == 1) {
                    t.convertShadowbox();
                }
            }

            // get supplied elements or from jcepopup class
            this.elements = elements || this.getPopups();

            // Iterate through all found or specified popup links
            each(this.elements, function (el, i) {
                
                if (el.childNodes.length === 1 && el.firstChild.nodeName === "IMG") {
                    DOM.addClass(el, 'jcemediabox-image');
                }
                
                // Create zoom icon
                if (JCEMediaBox.options.popup.icons == 1 && el.nodeName == 'A' && !/(noicon|icon-none|noshow)/.test(el.className) && el.style.display != 'none') {
                    t.zoom(el);
                }
                // Hide popup link if specified in class
                if (DOM.hasClass(el, 'noshow')) {
                    DOM.hide(el);
                }

                // Simplify class identifier for css
                if (/(jcelightbox|jcebox)/.test(el.className)) {
                    DOM.removeClass(el, 'jcelightbox');
                    DOM.removeClass(el, 'jcebox');
                    DOM.addClass(el, 'jcepopup');
                }

                var o = t.process(el);

                t.popups.push(o);

                // new index if not a pageload
                if (!pageload) {
                    i = t.popups.length - 1;
                }

                // Add click event to link
                Event.add(el, 'click', function (e) {
                    Event.cancel(e);
                    return t.start(o, i);
                });

            });

            // if no elements are specified, must be a pageload
            if (pageload) {
                // set theme
                this.popuptheme = '';

                // Load the popup theme
                var theme = JCEMediaBox.options.theme;

                new JCEMediaBox.XHR({
                    success: function (text, xml) {
                        var re = /<!-- THEME START -->([\s\S]*?)<!-- THEME END -->/;
                        if (re.test(text)) {
                            text = re.exec(text)[1];
                        }
                        t.popuptheme = text;
                        // Process auto popups
                        if (!auto) {
                            t.auto();
                            auto = true;
                        }
                    }

                }).send(JCEMediaBox.site + 'plugins/system/jcemediabox/themes/' + theme + '/popup.html');
            }
        },
        /**
         * Public popup method
         * @param {String / Object} data Popup URL string or data object or element
         * @param {String} title Popup Title
         * @param {String} group Popup Group
         * @param {String} type Popup Type, eg: image, flash, ajax
         * @param {Object} params Popup Parameters Object
         */
        open: function (data, title, group, type, params) {
            var i, o = {};

            if (typeof data == 'string') {
                data = {
                    'src': data,
                    'title': title,
                    'group': group,
                    'type': type,
                    'params': params
                };
            }

            // process as an element
            if (typeof (data == 'object') && data.nodeName && (data.nodeName == 'A' || data.nodeName == 'AREA')) {
                i = JCEMediaBox.inArray(this.elements, data);

                if (i >= 0) {
                    return this.start(this.popups[i], i);
                }

                // process element
                var o = this.process(data);

                // add to array
                var x = this.popups.push(o);

                // start
                return this.start(o, x - 1);
            }

            return this.start(data);
        },
        /**
         * Start a popup
         * @param {Object} o The popup link object
         * @param {Object} i The popup index
         */
        start: function (p, i) {
            var n = 0, items = [], each = JCEMediaBox.each, len;

            // build popup window
            if (this.build()) {
                if (p.group) {
                    each(this.popups, function (o, x) {
                        if (o.group == p.group) {
                            len = items.push(o);
                            if (i && x == i) {
                                n = len - 1;
                            }
                        }
                    });

                    // Triggered popup
                    if (!p.auto && typeof i == 'undefined') {
                        items.push(p);
                        n = items.length - 1;
                    }
                } else {
                    items.push(p);
                }
                return this.show(items, n);
            }
        },
        /**
         * Build Popup structure
         */
        build: function () {
            var t = this, each = JCEMediaBox.each, DOM = JCEMediaBox.DOM, Event = JCEMediaBox.Event;

            if (!this.page) {
                // Create main page object
                this.page = DOM.add(document.body, 'div', {
                    id: 'jcemediabox-popup-page'
                });

                if (JCEMediaBox.isIE6) {
                    DOM.addClass(this.page, 'ie6');
                }

                if (JCEMediaBox.isIE7) {
                    DOM.addClass(this.page, 'ie7');
                }

                if (JCEMediaBox.isiOS) {
                    DOM.addClass(this.page, 'ios');
                }

                if (JCEMediaBox.isAndroid) {
                    DOM.addClass(this.page, 'android');
                }

                if (JCEMediaBox.options.popup.overlay == 1) {
                    // Create overlay
                    this.overlay = DOM.add(this.page, 'div', {
                        id: 'jcemediabox-popup-overlay',
                        style: {
                            'opacity': 0,
                            'background-color': JCEMediaBox.options.popup.overlaycolor
                        }
                    });
                }

                // Cancel if no theme
                if (!this.popuptheme) {
                    return false;
                }
                // Remove comments
                this.popuptheme = this.popuptheme.replace(/<!--(.*?)-->/g, '');
                // Translate
                this.popuptheme = this.translate(this.popuptheme);
                // Create Frame
                this.frame = DOM.add(this.page, 'div', {
                    id: 'jcemediabox-popup-frame'
                }, '<div id="jcemediabox-popup-body">' + this.popuptheme + '</div>');

                // Create all Popup structure objects
                each(DOM.select('*[id]', this.frame), function (el) {
                    var s = el.id.replace('jcemediabox-popup-', '');
                    t[s] = el;
                    DOM.hide(el);
                });

                if ((JCEMediaBox.isiOS || JCEMediaBox.isAndroid) && JCEMediaBox.isWebKit) {
                    // add iPad scroll fix
                    DOM.style(this.content, 'webkitOverflowScrolling', 'touch');
                }

                // Add close function to frame on click
                if (JCEMediaBox.options.popup.close == 2) {
                    Event.add(this.frame, 'click', function (e) {
                        if (e.target && e.target == t.frame) {
                            t.close();
                        }
                    });
                }

                // Setup Close link event
                if (this.closelink) {
                    Event.add(this.closelink, 'click', function () {
                        return t.close();
                    });

                }
                // Setup Cancel link event
                if (this.cancellink) {
                    Event.add(this.cancellink, 'click', function () {
                        return t.close();
                    });

                }
                // Setup Next link event
                if (this.next) {
                    Event.add(this.next, 'click', function () {
                        return t.nextItem();
                    });

                }
                // Setup Previous link event
                if (this.prev) {
                    Event.add(this.prev, 'click', function () {
                        return t.previousItem();
                    });

                }
                if (this.numbers) {
                    this.numbers.tmpHTML = this.numbers.innerHTML;
                }

                if (this.print) {
                    Event.add(this.print, 'click', function () {
                        return t.printPage();
                    });

                }
                // PNG Fix
                if (JCEMediaBox.isIE6) {
                    DOM.png(this.body);
                    each(DOM.select('*', this.body), function (el) {
                        // Exclude loaded content
                        if (DOM.attribute(el, 'id') == 'jcemediabox-popup-content') {
                            return;
                        }
                        DOM.png(el);
                    });

                }
            }
            return true;
        },
        /**
         * Show the popup window
         * @param {Array} items Array of popup objects
         * @param {Int} n Index of current popup
         */
        show: function (items, n) {
            var DOM = JCEMediaBox.DOM, DIM = JCEMediaBox.Dimensions, top = 0;
            this.items = items;
            this.bind(true);

            // Show popup
            DOM.show(this.body);

            // Get top position
            if (!/\d/.test(this.body.style.top)) {
                top = (DIM.getHeight() - DIM.outerHeight(this.body)) / 2;
            }

            // Set top position
            DOM.style(this.body, 'top', top);
            // Changes if IE6 or scrollpopup
            if (JCEMediaBox.isIE6 || JCEMediaBox.isiOS || JCEMediaBox.options.popup.scrolling == 'scroll') {
                DOM.style(this.page, 'position', 'absolute');
                DOM.style(this.overlay, 'height', DIM.getScrollHeight());
                DOM.style(this.body, 'top', DIM.getScrollTop() + top);
            }
            // Fade in overlay
            if (JCEMediaBox.options.popup.overlay == 1 && this.overlay) {
                DOM.show(this.overlay);
                JCEMediaBox.FX.animate(this.overlay, {
                    'opacity': JCEMediaBox.options.popup.overlayopacity
                }, JCEMediaBox.options.popup.fadespeed);
            }

            return this.change(n);
        },
        /**
         * Create event / key bindings
         * @param {Boolean} open Whether popup is opened or closed
         */

        // TODO - Resize popup when browser window resizes
        bind: function (open) {
            var t = this, isIE6 = JCEMediaBox.isIE6, each = JCEMediaBox.each, DOM = JCEMediaBox.DOM, Event = JCEMediaBox.Event;

            if (isIE6) {
                each(DOM.select('select'), function (el) {
                    if (open) {
                        el.tmpStyle = el.style.visibility || '';
                    }
                    el.style.visibility = open ? 'hidden' : el.tmpStyle;
                });

            }
            if (JCEMediaBox.options.popup.hideobjects) {
                each(DOM.select('object, embed'), function (el) {
                    if (el.id == 'jcemediabox-popup-object')
                        return;
                    if (open) {
                        el.tmpStyle = el.style.visibility || '';
                    }
                    el.style.visibility = open ? 'hidden' : el.tmpStyle;
                });

            }
            var scroll = JCEMediaBox.options.popup.scrollpopup;
            if (open) {
                Event.add(document, 'keydown', function (e) {
                    t.listener(e);
                });

                if (isIE6) {
                    Event.add(window, 'scroll', function (e) {
                        DOM.style(t.overlay, 'height', JCEMediaBox.Dimensions.getScrollHeight());
                    });

                    Event.add(window, 'scroll', function (e) {
                        DOM.style(t.overlay, 'width', JCEMediaBox.Dimensions.getScrollWidth());
                    });

                }
            } else {
                if (isIE6 || !scroll) {
                    Event.remove(window, 'scroll');
                    Event.remove(window, 'resize');
                }
                Event.remove(document, 'keydown');
            }
        },
        /**
         * Keyboard listener
         * @param {Object} e Event
         */
        listener: function (e) {
            switch (e.keyCode) {
                case 27:
                    this.close();
                    break;
                case 37:
                    this.previousItem();
                    break;
                case 39:
                    this.nextItem();
                    break;
            }
        },
        /**
         * Process a popup in the group queue
         * @param {Object} n Queue position
         */
        queue: function (n) {
            var t = this;
            // Optional element
            var changed = false;

            JCEMediaBox.each(['top', 'bottom'], function (s) {
                var el = t['info-' + s];
                if (el) {
                    var v = JCEMediaBox.Dimensions.outerHeight(el);
                    var style = {};
                    style['top'] = (s == 'top') ? v : -v;
                    JCEMediaBox.FX.animate(el, style, JCEMediaBox.options.popup.scalespeed, function () {
                        if (!changed) {
                            changed = true;
                            JCEMediaBox.FX.animate(t.content, {
                                'opacity': 0
                            }, JCEMediaBox.options.popup.fadespeed, function () {
                                return t.change(n);
                            });

                        }
                    });

                }
            });

        },
        /**
         * Process the next popup in the group
         */
        nextItem: function () {
            if (this.items.length == 1)
                return false;
            var n = this.index + 1;

            if (n < 0 || n >= this.items.length) {
                return false;
            }
            return this.queue(n);
        },
        /**
         * Process the previous popup in the group
         */
        previousItem: function () {
            if (this.items.length == 1)
                return false;
            var n = this.index - 1;

            if (n < 0 || n >= this.items.length) {
                return false;
            }
            return this.queue(n);
        },
        /**
         * Set the popup information (caption, title, numbers)
         */
        info: function () {
            var each = JCEMediaBox.each, DOM = JCEMediaBox.DOM, Event = JCEMediaBox.Event;
            // Optional Element Caption/Title

            if (this.caption) {
                var title = this.active.title || '', text = this.active.caption || '', h = '';

                var ex = '([-!#$%&\'\*\+\\./0-9=?A-Z^_`a-z{|}~]+@[-!#$%&\'\*\+\\/0-9=?A-Z^_`a-z{|}~]+\.[-!#$%&\'*+\\./0-9=?A-Z^_`a-z{|}~]+)';
                var ux = '((news|telnet|nttp|file|http|ftp|https)://[-!#$%&\'\*\+\\/0-9=?A-Z^_`a-z{|}~]+\.[-!#$%&\'\*\+\\./0-9=?A-Z^_`a-z{|}~]+)';

                function processRe(h) {
                    h = h.replace(new RegExp(ex, 'g'), '<a href="mailto:$1" target="_blank" title="$1">$1</a>');
                    h = h.replace(new RegExp(ux, 'g'), '<a href="$1" target="_blank" title="$1">$1</a>');

                    return h;
                }

                if (title) {
                    h += '<h4>' + DOM.decode(title) + '</h4>';
                }

                if (text) {
                    h += '<p>' + DOM.decode(text) + '</p>';
                }
                // set caption html (may be empty)
                this.caption.innerHTML = h;

                // hide caption container if empty
                if (h != '') {
                    // Process e-mail and urls
                    each(DOM.select('*', this.caption), function (el) {
                        if (el.nodeName != 'A') {
                            each(el.childNodes, function (n, i) {
                                if (n.nodeType == 3) {
                                    var s = n.innerText || n.textContent || n.data || null;
                                    if (s && /(@|:\/\/)/.test(s)) {
                                        if (s = processRe(s)) {
                                            n.parentNode.innerHTML = s;
                                        }
                                    }
                                }
                            });

                        }
                    });
                }
            }
            // Optional Element
            var t = this, len = this.items.length;

            if (this.numbers && len > 1) {
                var html = this.numbers.tmpHTML || '{$numbers}';

                if (/\{\$numbers\}/.test(html)) {
                    this.numbers.innerHTML = '';
                    for (var i = 0; i < len; i++) {
                        var n = i + 1;
                        
                        var title = decodeURIComponent(this.items[i].title || n);
                        
                        // Craete Numbers link
                        var link = DOM.add(this.numbers, 'a', {
                            'href'  : 'javascript:;',
                            'title' : title,
                            'class' : (this.index == i) ? 'active' : ''
                        }, n);
                        // add click event
                        Event.add(link, 'click', function (e) {
                            var x = parseInt(e.target.innerHTML) - 1;
                            if (t.index == x) {
                                return false;
                            }
                            return t.queue(x);
                        });

                    }
                }

                if (/\{\$(current|total)\}/.test(html)) {
                    this.numbers.innerHTML = html.replace('{$current}', this.index + 1).replace('{$total}', len);
                }
            } else {
                if (this.numbers) {
                    this.numbers.innerHTML = '';
                }
            }

            each(['top', 'bottom'], function (v, i) {
                var el = t['info-' + v];
                if (el) {
                    DOM.show(el);
                    each(DOM.select('*[id]', el), function (s) {
                        DOM.show(s);
                    });
                    DOM.style(el, 'visibility', 'hidden');
                }
            });

            // Show / Hide Previous and Next buttons
            DOM.hide(this.next);
            DOM.hide(this.prev);

            if (len > 1) {
                if (this.prev) {
                    if (this.index > 0) {
                        DOM.show(this.prev);
                    } else {
                        DOM.hide(this.prev);
                    }
                }
                if (this.next) {
                    if (this.index < len - 1) {
                        DOM.show(this.next);
                    } else {
                        DOM.hide(this.next);
                    }
                }
            }
        },
        /**
         * Change the popup
         * @param {Integer} n Popup number
         */
        change: function (n) {
            var t = this, extend = JCEMediaBox.extend, each = JCEMediaBox.each, DOM = JCEMediaBox.DOM, Event = JCEMediaBox.Event, isIE = JCEMediaBox.isIE, DIM = JCEMediaBox.Dimensions;

            var p = {}, o, w, h;
            if (n < 0 || n >= this.items.length) {
                return false;
            }
            this.index = n;
            this.active = {};

            // Show Container
            DOM.show(this.container);
            // Show Loader
            if (this.loader) {
                DOM.show(this.loader);
            }
            // Show Cancel
            if (this.cancellink) {
                DOM.show(this.cancellink);
            }
            // Remove object
            if (this.object) {
                this.object = null;
            }

            this.content.innerHTML = '';

            o = this.items[n];

            // Get parameters from addon
            extend(p, this.getAddon(o.src, o.type));

            // delete alternate src
            delete o.params.src;

            // Get set parameters
            extend(p, o.params);

            var width = p.width || JCEMediaBox.options.popup.width || 0;
            var height = p.height || JCEMediaBox.options.popup.height || 0;

            if (/%/.test(width)) {
                width = DIM.getWidth() * parseInt(width) / 100;
            }

            if (/%/.test(height)) {
                height = DIM.getHeight() * parseInt(height) / 100;
            }

            var title = o.title || p.title || '';
            var caption = p.caption || '';

            if (/::/.test(title)) {
                var parts = title.split('::');
                title   = JCEMediaBox.trim(parts[0]);
                caption = JCEMediaBox.trim(parts[1]);
            }
            
            // decode title
            title = decodeURIComponent(title);
            // decode caption
            caption = decodeURIComponent(caption);
            
            extend(this.active, {
                'src': p.src || o.src,
                'title': title,
                'caption': caption,
                'type': p.type || this.getType(o),
                'params': p || {},
                'width': width,
                'height': height
            });

            switch (this.active.type) {
                case 'image':
                case 'image/jpeg':
                case 'image/png':
                case 'image/gif':
                case 'image/bmp':
                    if (this.print && this.options.print) {
                        this.print.style.visibility = 'visible';
                    }

                    this.img = new Image();
                    this.img.onload = function () {
                        return t.setup();
                    };

                    this.img.onerror = function () {
                        t.img.error = true;
                        return t.setup();
                    };

                    this.img.src = this.active.src;

                    // fix for resize / transparency issues in IE
                    if (isIE) {
                        DOM.style(this.content, 'background-color', DOM.style(this.content, 'background-color'));
                    }

                    // allow image to be resized
                    if (p.width && !p.height) {
                        this.active.height = 0;
                    } else if (p.height && !p.width) {
                        this.active.width = 0;
                    }

                    break;
                case 'flash':
                case 'director':
                case 'shockwave':
                case 'mplayer':
                case 'windowsmedia':
                case 'quicktime':
                case 'realaudio':
                case 'real':
                case 'divx':
                    if (this.print) {
                        this.print.style.visibility = 'hidden';
                    }

                    p.src = this.active.src;
                    var base = /:\/\//.test(p.src) ? '' : this.site;
                    this.object = '';

                    w = this.width();
                    h = this.height();

                    var mt = this.mediatype(this.active.type);

                    if (this.active.type == 'flash') {
                        p.wmode = 'transparent';
                        p.base = base;
                    }
                    if (/(mplayer|windowsmedia)/i.test(this.active.type)) {
                        p.baseurl = base;
                        if (isIE) {
                            p.url = p.src;
                            delete p.src;
                        }
                    }
                    // delete some parameters
                    delete p.title;
                    delete p.group;

                    // Set width/height
                    p.width = this.active.width || this.width();
                    p.height = this.active.height || this.height();

                    var flash = /flash/i.test(this.active.type);
                    var pdf = /pdf/i.test(this.active.type);
                    // Create single object for IE / Flash / PDF

                    if (flash || isIE) {
                        this.object = '<object id="jcemediabox-popup-object"';
                        // Add type and data attribute
                        if (flash && !isIE) {
                            this.object += ' type="' + mt.mediatype + '" data="' + p.src + '"';
                        } else {
                            this.object += ' classid="clsid:' + mt.classid + '"';
                            if (mt.codebase) {
                                this.object += ' codebase="' + mt.codebase + '"';
                            }
                        }

                        for (n in p) {
                            if (p[n] !== '') {
                                if (/(id|name|width|height|style)$/.test(n)) {
                                    var v = decodeURIComponent(p[n]);

                                    if (pdf && (n == 'width' || n == 'height')) {
                                        v = '100%';
                                    }

                                    t.object += ' ' + n + '="' + v + '"';
                                }
                            }
                        }
                        // Close object
                        this.object += '>';
                        // Create param elements
                        for (n in p) {
                            if (p[n] !== '' && !/(id|name|width|height|style|type)/.test(n)) {
                                t.object += '<param name="' + n + '" value="' + decodeURIComponent(p[n]) + '" />';
                            }
                        }
                        // Add closing object element
                        this.object += '</object>';
                        // Use embed for non-IE browsers
                    } else {
                        this.object = '<embed id="jcemediabox-popup-object" type="' + mt.mediatype + '"';
                        for (n in p) {
                            var v = decodeURIComponent(p[n]);

                            if (pdf && (n == 'width' || n == 'height')) {
                                v = '100%';
                            }

                            if (v !== '') {
                                t.object += ' ' + n + '="' + v + '"';
                            }
                        }
                        this.object += '></embed>';
                    }

                    // set global media type
                    this.active.type = 'media';
                    this.active.width = p.width;
                    this.active.height = p.height;

                    this.setup();
                    break;
                case 'video/x-flv':
                    this.object = '<object type="application/x-shockwave-flash" data="' + JCEMediaBox.site + 'plugins/system/jcemediabox/mediaplayer/mediaplayer.swf"';

                    var src = this.active.src;

                    if (!/:\/\//.test(src)) {
                        src = JCEMediaBox.site + src;
                    }

                    var map = {
                        'loop': 'loop',
                        'autoplay': 'autoPlay',
                        'controls': 'controlBarAutoHide'
                    };

                    var v, flashvars = ['src=' + src], params = {
                        wmode: 'opaque',
                        allowfullscreen: true
                    };

                    for (n in p) {
                        if (p[n] !== '') {
                            if (/(id|width|height|style)$/.test(n)) {
                                t.object += ' ' + n + '="' + decodeURIComponent(p[n]) + '"';
                            } else if (/^(wmode|allowfullscreen|play|menu|quality|scale|salign|wmode|bgcolor|base|fullScreenAspectRatio)$/i.test(n)) {
                                params[n] = p[n];
                            } else {
                                if (/(loop|autoplay|controls)$/.test(n)) {
                                    if (map[n]) {
                                        v = (n == 'controls') ? !p[n] : !!p[n];
                                        n = map[n];
                                    }
                                } else {
                                    v = p[n];
                                }

                                flashvars.push(n + '=' + v);
                            }
                        }
                    }

                    this.object += '>';

                    this.object += '<param name="movie" value="' + JCEMediaBox.site + 'plugins/system/jcemediabox/mediaplayer/mediaplayer.swf" />';
                    this.object += '<param name="flashvars" value="' + flashvars.join('&') + '" />';
                    for (n in params) {
                        this.object += '<param name="' + n + '" value="' + params[n] + '" />';
                    }

                    this.object += '<p>Flash is required to play this video. <a href="http://get.adobe.com/flashplayer/" target="_blank">Get Adobe® Flash Player</a></p>';

                    this.object += '</object>';

                    // set global media type
                    this.active.type = 'media';

                    this.setup();
                    break;
                case 'video/mp4':
                case 'audio/mp3':
                case 'video/webm':
                case 'audio/webm':
                    var type = this.active.type;
                    var hasSupport = (type == 'video/mp4' && support.video.mp4) || (type == 'video/webm' && support.video.webm) || (type == 'audio/mp3' && support.audio.mp3) || (type == 'audio/webm' && support.audio.webm);
                    var tag = /video/.test(type) ? 'video' : 'audio';

                    if (hasSupport) {
                        p.width = p.width || this.active.width;
                        p.height = p.height || this.active.height;

                        this.object = '<' + tag + ' type="' + type + '"';

                        for (n in p) {
                            if (p[n] !== '') {
                                if (/(loop|autoplay|controls|preload)$/.test(n)) {
                                    t.object += ' ' + n + '="' + n + '"';
                                }

                                if (/(id|width|height|style|poster|audio)$/.test(n)) {
                                    t.object += ' ' + n + '="' + decodeURIComponent(p[n]) + '"';
                                }
                            }
                        }

                        this.object += '>';

                        this.object += '<source src="' + this.active.src + '" type="' + type + '" />';

                        this.object += '</' + tag + '>';

                    } else {
                        if (type == 'video/mp4' || type == 'audio/mp3') {
                            this.object = '<object type="application/x-shockwave-flash" data="' + JCEMediaBox.site + 'plugins/system/jcemediabox/mediaplayer/mediaplayer.swf"';

                            p.width = p.width || this.active.width;
                            p.height = p.height || this.active.height;

                            var src = this.active.src;

                            if (!/:\/\//.test(src)) {
                                src = JCEMediaBox.site + src;
                            }

                            var map = {
                                'loop': 'loop',
                                'autoplay': 'autoPlay',
                                'controls': 'controlBarMode'
                            };

                            var flashvars = ['src=' + src];

                            for (n in p) {
                                if (p[n] !== '') {
                                    if (/(loop|autoplay|preload|controls)$/.test(n)) {
                                        if (map[n]) {
                                            var v = !!p[n];

                                            if (n == 'controls') {
                                                if (!v) {
                                                    flashvars.push('controlBarMode=none');
                                                }
                                            } else {
                                                flashvars.push(map[n] + '=' + v);
                                            }
                                        }
                                    }

                                    if (/(id|width|height|style)$/.test(n)) {
                                        t.object += ' ' + n + '="' + decodeURIComponent(p[n]) + '"';
                                    }
                                }
                            }

                            this.object += '>';

                            this.object += '<param name="movie" value="' + JCEMediaBox.site + 'plugins/system/jcemediabox/mediaplayer/mediaplayer.swf" />';
                            this.object += '<param name="flashvars" value="' + flashvars.join('&') + '" />';
                            this.object += '<param name="allowfullscreen" value="true" />';
                            this.object += '<param name="wmode" value="transparent" />';
                            this.object += '<p>Flash is required to play this video. <a href="http://get.adobe.com/flashplayer/" target="_blank">Get Adobe® Flash Player</a></p>';
                            this.object += '</object>';
                        } else {
                            DOM.addClass(this.content, 'broken-media');
                        }
                    }

                    // set global media type
                    this.active.type = 'media';

                    this.setup();
                    break;
                case 'ajax':
                case 'text/html':
                case 'text/xml':
                    if (this.print && this.options.print) {
                        this.print.style.visibility = 'visible';
                    }

                    this.active.width = this.active.width || this.width();
                    this.active.height = this.active.height || this.height();

                    if (this.islocal(this.active.src)) {
                        if (!/tmpl=component/i.test(this.active.src)) {
                            this.active.src += /\?/.test(this.active.src) ? '&tmpl=component' : '?tmpl=component';
                        }
                        this.active.type = 'ajax';
                    } else {
                        this.active.type = 'iframe';
                        this.setup();
                    }

                    styles = extend(this.styles(p.styles), {
                        display: 'none'
                    });

                    this.active.src = this.active.src.replace(/\&type=(ajax|text\/html|text\/xml)/, '');

                    // show loader
                    if (this.loader) {
                        DOM.show(this.loader);
                    }

                    // create an iframe to load internal content in rather than using ajax so that javascript in the article is processed
                    var iframe = DOM.add(document.body, 'iframe', {
                        src: this.active.src,
                        style: 'display:none;'
                    });

                    // transfer data and delete iframe when loaded
                    Event.add(iframe, 'load', function () {

                        // Create ajax container
                        t.ajax = DOM.add(t.content, 'div', {
                            id: 'jcemediabox-popup-ajax',
                            'style': styles
                        });

                        // transfer data
                        t.ajax.innerHTML = iframe.contentWindow.document.body.innerHTML;

                        // Corrective stuff for IE6 and IE7
                        if (JCEMediaBox.isIE6) {
                            DOM.style(t.ajax, 'margin-right', JCEMediaBox.Dimensions.getScrollbarWidth());
                        }

                        if (JCEMediaBox.isIE7) {
                            DOM.style(t.ajax, 'padding-right', JCEMediaBox.Dimensions.getScrollbarWidth());
                        }

                        window.setTimeout(function () {
                            // remove iframe
                            DOM.remove(iframe);
                        }, 10);

                        // process any popups in loaded content
                        t.create(t.getPopups('', t.content));

                        // process any tooltips in loaded content
                        JCEMediaBox.ToolTip.create(t.content);

                        // setup
                        return t.setup();
                    });

                    iframe.onerror = function () {
                        DOM.addClass(this.content, 'broken-page');
                        return t.setup();
                    };

                    break;
                case 'iframe':
                case 'pdf':
                case 'video/youtube':
                case 'video/vimeo':
                default:
                    if (this.print) {
                        this.print.style.visibility = 'hidden';
                    }

                    if (this.islocal(this.active.src)) {
                        // add tmpl=component to internal links, skip pdf
                        if (!/tmpl=component/i.test(this.active.src) && !/\.pdf\b/i.test(this.active.src)) {
                            this.active.src += /\?/.test(this.active.src) ? '&tmpl=component' : '?tmpl=component';
                        }
                    }

                    this.active.width = this.active.width || this.width();
                    this.active.height = this.active.height || this.height();

                    this.active.type = 'iframe';
                    this.setup();

                    break;
            }
            return false;
        },
        /**
         * Proportional resizing method
         * @param {Object} w
         * @param {Object} h
         * @param {Object} x
         * @param {Object} y
         */
        resize: function (w, h, x, y) {
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
        },
        /**
         * Pre-animation setup. Resize images, set width / height
         */
        setup: function () {
            var t = this, DOM = JCEMediaBox.DOM, w, h, o = JCEMediaBox.options.popup;

            w = this.active.width;
            h = this.active.height;

            // Setup info
            this.info();

            // Get image dimensions and resize if necessary
            if (this.active.type == 'image') {
                if (t.img.error) {
                    w = 300;
                    h = 300;
                }

                var x = this.img.width;
                var y = this.img.height;

                if (w && !h) {
                    h = y * (w / x);
                } else if (!w && h) {
                    w = x * (h / y);
                }

                w = w || x;
                h = h || y;
            }

            // Resize to fit screen
            if (parseInt(o.resize) === 1 || (parseInt(o.resize) === 0 && o.scrolling == 'fixed')) {
                var x = this.width();
                var y = this.height();

                var dim = this.resize(w, h, x, y);

                w = dim.width;
                h = dim.height;
            }

            DOM.styles(this.content, {
                width: w,
                height: h
            });

            DOM.hide(this.content);

            if (this.active.type == 'image') {
                if (this.img.error) {
                    DOM.addClass(this.content, 'broken-image');
                } else {
                    this.content.innerHTML = '<img id="jcemediabox-popup-img" src="' + this.active.src + '" title="' + this.active.title + '" width="' + w + '" height="' + h + '" />';
                }

                // fix resized images in IE
                if (JCEMediaBox.isIE) {
                    var img = DOM.get('jcemediabox-popup-img');
                    if (img) {
                        DOM.style(img, '-ms-interpolation-mode', 'bicubic');
                    }
                }
            }

            // Animate box
            return this.animate();
        },
        showInfo: function () {
            var t = this, each = JCEMediaBox.each, DOM = JCEMediaBox.DOM, FX = JCEMediaBox.FX, DIM = JCEMediaBox.Dimensions, Event = JCEMediaBox.Event;
            var ss = JCEMediaBox.options.popup.scalespeed, fs = JCEMediaBox.options.popup.fadespeed;

            // Set Information
            var itop = t['info-top'];
            if (itop) {
                each(DOM.select('*[id]', itop), function (el) {
                    if (/jcemediabox-popup-(next|prev)/.test(DOM.attribute(el, 'id'))) {
                        return;
                    }
                    DOM.show(el);
                });

                var h = DIM.outerHeight(itop);
                DOM.styles(itop, {
                    'z-index': -1,
                    'top': h,
                    'visibility': 'visible'
                });

                FX.animate(itop, {
                    'top': 0
                }, ss);
            }

            if (t.closelink) {
                DOM.show(t.closelink);
            }

            var ibottom = t['info-bottom'];
            if (ibottom) {
                each(DOM.select('*[id]', ibottom), function (el) {
                    if (/jcemediabox-popup-(next|prev)/.test(DOM.attribute(el, 'id'))) {
                        return;
                    }
                    DOM.show(el);
                });

                var h = DIM.outerHeight(ibottom);

                DOM.styles(ibottom, {
                    'z-index': -1,
                    'top': -h,
                    'visibility': 'visible'
                });

                FX.animate(ibottom, {
                    'top': 0
                }, ss);
            }
        },
        /**
         * Animate the Popup
         */
        animate: function () {
            var t = this, each = JCEMediaBox.each, DOM = JCEMediaBox.DOM, FX = JCEMediaBox.FX, DIM = JCEMediaBox.Dimensions, Event = JCEMediaBox.Event;
            var ss = JCEMediaBox.options.popup.scalespeed, fs = JCEMediaBox.options.popup.fadespeed;

            var cw = DIM.outerWidth(this.content);
            var ch = DIM.outerHeight(this.content);

            var ih = 0;
            each(['top', 'bottom'], function (v, i) {
                var el = t['info-' + v];
                if (el) {
                    ih = ih + DIM.outerHeight(el);
                }
            });

            var st = DOM.style(this.page, 'position') == 'fixed' ? 0 : DIM.getScrollTop();
            var top = st + (this.frameHeight() / 2) - ((ch + ih) / 2);

            if (top < 0) {
                top = 0;
            }

            DOM.style(this.content, 'opacity', 0);

            // Animate width
            FX.animate(this.body, {
                'height': ch,
                'top': top,
                'width': cw
            }, ss, function () {
                // Iframe
                if (t.active.type == 'iframe') {
                    // Create IFrame
                    var iframe = DOM.add(t.content, 'iframe', {
                        id: 'jcemediabox-popup-iframe',
                        frameborder: 0,
                        allowTransparency: true,
                        scrolling: t.active.params.scrolling || 'auto',
                        width: '100%',
                        height: '100%'
                    });

                    // use pdf loader
                    if (/\.pdf\b/.test(t.active.src)) {
                        // Hide loader
                        if (t.loader) {
                            DOM.hide(t.loader);
                        }
                    } else {
                        var doc = iframe.contentWindow.document;

                        if (JCEMediaBox.isiOS && JCEMediaBox.isWebKit) {
                            var _timer = setInterval(function () {
                                if (doc.readyState === 'complete') {
                                    clearInterval(_timer);
                                    if (t.loader) {
                                        DOM.hide(t.loader);
                                    }
                                }
                            }, 1000);
                        } else {
                            Event.add(iframe, 'load', function () {
                                // Hide loader
                                if (t.loader) {
                                    DOM.hide(t.loader);
                                }
                            });
                        }
                    }

                    /*if (/\.pdf\b/.test(t.active.src) && JCEMediaBox.options.popup.pdfjs) {
                     iframe.setAttribute('src', 'javascript:;');
                     
                     var doc     = iframe.contentWindow.document;
                     var html    = '<!doctype html><html><head>';
                     
                     html += '<script type="text/javascript" src="' + JCEMediaBox.site + 'plugins/system/jcemediabox/js/pdfjs/pdf.js"></script>';
                     html += '<script type="text/javascript" src="' + JCEMediaBox.site + 'plugins/system/jcemediabox/js/pdfjs/pdf.compatibility.js"></script>';
                     html += '<script type="text/javascript">var pdffile = "' + t.active.src + '";</script>';
                     html += '<script type="text/javascript" src="' + JCEMediaBox.site + 'plugins/system/jcemediabox/js/pdfjs/pdf.loader.js"></script>';
                     html += '</head>';
                     html += '<body><canvas id="pdf-canvas" width="100%" height="100%" /></body>';
                     html += '</html>';
                     
                     doc.open();
                     doc.write(html);
                     doc.close();
                     
                     } else {
                     // Set src
                     iframe.setAttribute('src', t.active.src);
                     }*/
                    iframe.setAttribute('src', t.active.src);

                    t.iframe = iframe;

                } else {
                    // Hide loader
                    if (t.loader) {
                        DOM.hide(t.loader);
                    }

                    // If media
                    if (t.active.type == 'media' && t.object) {
                        t.content.innerHTML = t.object;

                        if (/\.pdf\b/.test(t.active.src) && JCEMediaBox.isiOS) {
                            DOM.styles(DOM.get('jcemediabox-popup-object'), {'height': '1000%', 'width': '150%'});
                        }
                    }

                    if (t.active.type == 'ajax') {
                        DOM.show(t.ajax);
                    }
                }

                DOM.show(t.content);
                t.content.focus();

                // Animate fade in for images only and not on IE6!
                if (t.active.type == 'image' && !JCEMediaBox.isIE6) {
                    FX.animate(t.content, {
                        'opacity': 1
                    }, fs, function () {
                        t.showInfo();
                    });

                } else {
                    DOM.style(t.content, 'opacity', 1);
                    t.showInfo();
                }
            });

        },
        /**
         * Close the popup window. Destroy all objects
         */
        close: function (keepopen) {
            var t = this, each = JCEMediaBox.each, DOM = JCEMediaBox.DOM, DIM = JCEMediaBox.Dimensions, FX = JCEMediaBox.FX;

            var ss = JCEMediaBox.options.popup.scalespeed;

            if (this.iframe) {
                DOM.attribute(this.iframe, 'src', '');
            }

            // Destroy objects
            each(['img', 'object', 'iframe', 'ajax'], function (i, v) {
                //t[v] = null;

                if (t[v]) {
                    DOM.remove(t[v]);
                }

                t[v] = null;
            });

            // Hide closelink
            if (this.closelink) {
                DOM.hide(this.closelink);
            }

            // Empty content div
            this.content.innerHTML = '';

            if (!keepopen) {
                // Hide info div
                each(['top', 'bottom'], function (v, i) {
                    var el = t['info-' + v];
                    if (el) {
                        DOM.hide(el);
                    }
                });

                // reset popups
                var popups = this.getPopups();
                while (this.popups.length > popups.length) {
                    this.popups.pop();
                }

                // remove frame
                DOM.remove(this.frame);
                // Fade out overlay
                if (this.overlay) {
                    if (JCEMediaBox.isIE6) {
                        // Remove event bindings
                        this.bind();
                        // Remove body, ie: popup
                        DOM.remove(this.page);
                        this.page = null;
                    } else {
                        JCEMediaBox.FX.animate(this.overlay, {
                            'opacity': 0
                        }, JCEMediaBox.options.popup.fadespeed, function () {
                            t.bind();
                            // destroy page
                            DOM.remove(t.page);
                            t.page = null;
                        });

                    }
                } else {
                    // destroy page
                    DOM.remove(this.page);
                    this.page = null;
                }
            }
            return false;
        }

    };
})(window);
// Cleanup events
JCEMediaBox.Event.addUnload(function () {
    JCEMediaBox.Event.destroy();
});
