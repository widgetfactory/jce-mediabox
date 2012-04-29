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
jQuery.noConflict();

(function($) {    
    /*
     * From Modernizr v2.0.6
 	 * http://www.modernizr.com
     * Copyright (c) 2009-2011 Faruk Ates, Paul Irish, Alex Sexton
     */
    $.support.video = (function() {
        var el = document.createElement('video');
        var bool = false;
        // IE9 Running on Windows Server SKU can cause an exception to be thrown, bug #224
        try {
            if (bool = !!el.canPlayType ) {
                bool      = new Boolean(bool);
                bool.ogg  = el.canPlayType('video/ogg; codecs="theora"');

                // Workaround required for IE9, which doesn't report video support without audio codec specified.
                //   bug 599718 @ msft connect
                var h264 = 'video/mp4; codecs="avc1.42E01E';
                bool.mp4 = el.canPlayType(h264 + '"') || el.canPlayType(h264 + ', mp4a.40.2"');

                bool.webm = el.canPlayType('video/webm; codecs="vp8, vorbis"');
            }
            
        } catch(e) { }
    	
        return bool;
    })();
    
    /*
     * From Modernizr v2.0.6
 	 * http://www.modernizr.com
     * Copyright (c) 2009-2011 Faruk Ates, Paul Irish, Alex Sexton
     */
    $.support.audio = (function() {
        var el = document.createElement('audio');
    	
        try { 
            if (bool = !!el.canPlayType ) {
                bool      = new Boolean(bool);
                bool.ogg  = el.canPlayType('audio/ogg; codecs="vorbis"');
                bool.mp3  = el.canPlayType('audio/mpeg;');

                // Mimetypes accepted:
                //   https://developer.mozilla.org/En/Media_formats_supported_by_the_audio_and_video_elements
                //   http://bit.ly/iphoneoscodecs
                bool.wav  = el.canPlayType('audio/wav; codecs="1"');
                bool.m4a  = el.canPlayType('audio/x-m4a;') || el.canPlayType('audio/aac;');
                bool.webm = el.canPlayType('audio/webm; codecs="vp8, vorbis"');
            }
        } catch(e) { }
    	
        return bool;
    })();
    
    // create Mediabox namespace
    $.fn.mediabox = {};
    
    /**
     * IE6 PNG Fix
     * @param {Object} el Element to fix
     */
    $.fn.mediabox.png = function() {
            
        var s;
        // Image Elements
        if (this.nodeName == 'IMG') {
            s = this.src;
            if (/\.png$/i.test(s)) {
                $(this).attr('src', JCEMediaBox.site + 'plugins/system/jcemediabox/img/blank.gif').css('filter', "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + s + "')");
            }
        // Background-image styles
        } else {
            s = $(this).css('background-image');
            
            if (/\.png/i.test(s)) {
                var bg = /url\("(.*)"\)/.exec(s)[1];
                $(this).css({
                    'background-image': 'none',
                    'filter': "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + bg + "', sizingMethod='image')"
                });
            }
        }
    };
    
    var MediaBox = {
        /**
         * Global Options Object
         */
        options: {
            popup: {
                width: '',
                height: '',
                legacy: 0,
                lightbox : 0,
                shadowbox : 0,
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
                close : 2,
                labels: {
                    'close': 'Close',
                    'next': 'Next',
                    'previous': 'Previous',
                    'numbers': '{$current} of {$total}',
                    'cancel': 'Cancel'
                }
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
        init: function(options) {
            this.extend(this.options, options);
            // Clear IE6 background cache
            if (this.isIE6)
                try {
                    document.execCommand("BackgroundImageCache", false, true);
                } catch (e) {
                };
            // start...
            $(document).ready(this._init());
        },

        /**
         * Get the Site Base URL
         * @method getSite
         * @return {String} Site Base URL
         */
        getSite: function() {
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
        _init: function() {
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
             * @property isIDevice
             * @type Boolean
             * @final
             */
            t.isIDevice = /(iPad|iPhone)/.test(ua);

            /**
             * Get the Site URL
             * @property site
             * @type String
             */
            this.site = this.getSite();
            // Can't get reliable site URL
            if (!this.site)
                return false;

            // Initialize Popup / Tooltip creation
            this.Popup.init();
            this.ToolTip.init();
        }
    };
    /**
     * Core Tooltip Object
     * Create and display tooltips
     * Based on Mootools Tips Class
     * copyright (c) 2007 Valerio Proietti, <http://mad4milk.net>
     */
    MediaBox.ToolTip = {
        /**
         * Initialise the tooltip
         * @param {Object} elements
         * @param {Object} options
         */
        init: function() {
            var self = this;

            // Load tooltip theme
            var theme = JCEMediaBox.options.theme == 'custom' ? JCEMediaBox.options.themecustom : JCEMediaBox.options.theme;

            this.tooltiptheme = '';
            
            $.post(JCEMediaBox.site + JCEMediaBox.options.themepath + '/' + theme + '/tooltip.html', function(text) {
                var re = /<!-- THEME START -->([\s\S]*?)<!-- THEME END -->/;
                if (re.test(text)) {
                    text = re.exec(text)[1];
                }
                self.tooltiptheme = text;

                self.create();
            });
        },

        /**
         * Create tooltips in the cuurent document or node
         * @param o Option parent node, defaults to document
         */
        create : function(o) {
            var self = this;

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
            $('.jcetooltip, .jce_tooltip', o).each(function() {
                // store away title
                this.tmpTitle = this.title;
                $(this).removeAttr('title');

                var n = this;

                // set event element as parent if popup icon
                if (this.nodeName == 'IMG' && this.parentNode.className == 'jcemediabox-zoom-span') {
                    n = this.parentNode;
                }
                
                $(n).hover(function(e) {
                    _withinElement(n, e, function() {
                        return self.start(n);
                    });
                }, function(e) {
                    _withinElement(n, e, function() {
                        return self.end(n);
                    });
                });

                $(n).mousemove(function(e) {
                    return self.locate(e);
                });

            });

        },

        /**
         * Create the tooltip div
         */
        build: function() {
            if (!this.toolTip) {

                this.toolTip = $('<div />').css('opacity', 0).addClass('jcemediabox-tooltip').html(this.tooltiptheme).appendTo(document.body);
                
                if (JCEMediaBox.isIE6) {
                    $(this.toolTip).addClass('ie6');
                }
            }
        },

        /**
         * Show the tooltip and build the tooltip text
         * @param {Object} e  Event
         * @param {Object} el Target Element
         */
        start: function(el) {            
            if (!this.tooltiptheme)
                return false;
            // Create tooltip if it doesn't exist
            this.build();

            // Get tooltip text from title
            var text = el.tmpTitle || '', title = '';

            // Split tooltip text ie: title::text
            if (/::/.test(text)) {
                var parts = text.split('::');
                title   = $.trim(parts[0]);
                text    = $.trim(parts[1]);
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
            var tn = $('#jcemediabox-tooltip-text').get(0);
            // Use simple tooltip
            if (typeof tn == 'undefined') {
                this.toolTip.className = 'jcemediabox-tooltip-simple';
                this.toolTip.innerHTML = h;
            } else {
                tn.innerHTML = h;
            }
            // Set visible
            $(this.toolTip).css('visibility', 'visible');
            // Fade in tooltip
            $(this.toolTip).fadeIn(JCEMediaBox.options.tooltip.speed);
        },

        /**
         * Fade Out and hide the tooltip
         * Restore the original element title
         * @param {Object} el Element
         */
        end: function(el) {
            if (!this.tooltiptheme)
                return false;

            // Fade out tooltip and hide

            $(this.toolTip).css({
                'visibility': 'hidden',
                'opacity': 0
            });
        },

        /**
         * Position the tooltip
         * @param {Object} e Event trigger
         */
        locate: function(e) {
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
            $(this.toolTip).css({
                top : pos.y,
                left: pos.x
            });
        },

        /**
         * Position the tooltip
         * @param {Object} element
         */
        position: function(element) {
        }

    },
    /**
     * Core Popup Object
     * Creates and displays a media popup
     */
    MediaBox.Popup = {
        /**
         * List of default addon media types
         */
        addons: {
            'flash'	: {},
            'image'	: {},
            'iframe'    : {},
            'html'	: {}
        },
        /**
         * Extend the addons object with a new addon
         * @param {String} n Addon name
         * @param {Object} o Addon object
         */
        setAddons: function(n, o) {
            $.extend(this.addons[n], o);
        },

        /**
         * Return an addon object by name or all addons
         * @param {String} n Addon name
         */
        getAddons: function(n) {
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
        getAddon: function(v, n) {
            var cp = false, r;

            var addons = this.getAddons(n);

            $.each(this.addons, function(i, o) {
                o.each(function(fn) {
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
        cleanEvent: function(s) {
            return s.replace(/^function\s+anonymous\(\)\s+\{\s+(.*)\s+\}$/, '$1');
        },

        /**
         * Get a popup parameter object
         * @param {String} s Parameter string
         */
        params: function(s) {
            var a = [], x = [];

            if (typeof s == 'string') {
                // if a JSON string return the object
                if (new RegExp('^{[\w\W]+}$').test(s)) {
                    return $.parseJSON(s);
                }
                
                // JCE MediaBox parameter format eg: title[title]
                if (/\w\[[^\]]+\]/.test(s)) {                	                	
                    s = s.replace(/([\w]+)\[([^\]]+)\](;)?/g, function(a, b, c, d) {
                        return '"' + b + '":"' + c + '"' + (d ? ',' : '');
                    });

                    return $.parseJSON('{' + s + '}');
                }
                
                // if url
                if (s.indexOf('&') != -1) {
                    x = s.split(/&(amp;)?/g);
                }
            }

            // if array
            if ($.type(s) == 'array') {
                x = s;
            }

            $.each(x, function(i, n) {
                if (n) {
                    n = n.replace(/^([^\[]+)(\[|=|:)([^\]]*)(\]?)$/, function(a, b, c, d) {
                        if (d) {
                            if (!/[^0-9]/.test(d)) {
                                return '"' + b + '":' + parseInt(d);
                            }
                            return '"' + b + '":"' + d + '"';
                        }
                        return '';
                    });

                    if (n) {
                        a.push(n);
                    }
                }
            });

            return $.parseJSON('{' + a.join(',') + '}');
        },

        /**
         * Gets the raw data of a cookie by name.
         * Copyright 2009, Moxiecode Systems AB
         *
         * @method get
         * @param {String} n Name of cookie to retrive.
         * @return {String} Cookie data string.
         */
        getCookie: function(n) {
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
        setCookie: function(n, v, e, p, d, s) {
            document.cookie = n + "=" + escape(v) +
            ((e) ? "; expires=" + e.toGMTString() : "") +
            ((p) ? "; path=" + escape(p) : "") +
            ((d) ? "; domain=" + d : "") +
            ((s) ? "; secure" : "");
        },

        /**
         * Convert legacy popups to new format
         */
        convertLegacy: function() {
            var self = this;
            
            $('a[href]').each(function() {

                // Only JCE Popup links
                if (/com_jce/.test(this.href)) {
                    var p, s;
                    var oc = $(this).attr('onclick');
                    s = oc.replace(/&#39;/g, "'").split("'");                    
                    p = self.params(s[1]);

                    var img 	= p.img 	|| '';
                    var title 	= p.title 	|| '';

                    if (img) {
                        if (!/http:\/\//.test(img)) {
                            if (img.charAt(0) == '/') {
                                img = img.substr(1);
                            }
                            img = JCEMediaBox.site.replace(/http:\/\/([^\/]+)/, '') + img;
                        }
                        
                        $(this).attr({
                            'href'	: img,
                            'title'	: title.replace(/_/, ' '),
                            'onclick'	: ''
                        });

                        $(this).addClass('jcepopup');
                    }
                }
            });

        },

        /**
         * Convert lightbox popups to MediaBox
         */
        convertLightbox: function() {
            $('a[rel*=lightbox]').attr('rel', function(i, v) {
                return v.replace(/lightbox\[?([^\]]*)\]?/, function(a, b) {
                    if (b) {
                        return 'group['+ b +']';
                    }
                    return '';
                });
            }).addClass('jcepopup');
        },

        /**
         * Convert shadowbox popups to MediaBox
         */
        convertShadowbox: function() {
            $('a[rel*=shadowbox]').attr('rel', function(i, v) {
                return v.replace(/shadowbox\[?([^\]]*)\]?/, function(a, b) {
                    var attribs = '', group = '';
                    // group
                    if (b) {
                        group = 'group['+ b +']';
                    }
                    // attributes
                    if (/;=/.test(a)) {
                        attribs = a.replace(/=([^;"]+)/g, function(x, z) {
                            return '[' + z + ']';
                        });

                    }
                    if (group && attribs) {
                        return group + ';' + attribs;
                    }
                    return group || attribs || '';
                });
            }).addClass('jcepopup');

        },

        /**
         * Translate popup labels
         * @param {String} s Theme HTML
         */
        translate: function(s) {
            if (!s) {
                s = this.popup.theme;
            }
            s = s.replace(/\{#(\w+?)\}/g, function(a, b) {
                return JCEMediaBox.options.popup.labels[b];
            });

            return s;
        },

        /**
         * Returns a styles object from a parameter
         * @param {Object} o
         */
        styles: function(o) {
            var x = [];
            if (!o)
                return {};

            $.each(o.split(';'), function(i, s) {
                s = s.replace(/(.*):(.*)/, function(a, b, c) {
                    return '"' + b + '":"' + c + '"';
                });

                x.push(s);
            });

            return $.parseJSON('{' + x.join(',') + '}');
        },

        /**
         * Get the file type from the url, type attribute or className
         * @param {Object} el
         */
        getType: function(el) {
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
        mediatype: function(c) {
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
        islocal: function(s) {
            if (/^(\w+):\/\//.test(s)) {
                return new RegExp('^(' + JCEMediaBox.site + ')').test(s);
            } else {
                return true;
            }
        },

        /**
         * Get the width of the container frame
         */
        frameWidth: function() {
            var w = 0, el = this.frame;

            $.each(['left', 'right'], function(i, s) {
                w = w + parseFloat($(el).css('padding-' + s));
            });

            return parseFloat(this.frame.clientWidth - w);
        },

        /**
         * Get the height of the container frame
         */
        frameHeight: function() {
            var h = 0, el = this.frame;

            $.each(['top', 'bottom'], function(i, s) {
                h = h + parseFloat($(el).css('padding-' + s));
            });

            h = h + ((JCEMediaBox.isIE6 || JCEMediaBox.isIE7) ? DIM.getScrollbarWidth() : 0);

            return parseInt($(window).height()) - h;
        },

        /**
         * Get the width of the usable window
         */
        width: function() {
            return this.frameWidth() - JCEMediaBox.Dimensions.getScrollbarWidth();
        },

        /**
         * Get the height of the usable window less info divs
         */
        height: function() {
            var h = 0, t = this;
            each(['top', 'bottom'], function(s) {
                var el = t['info-' + s];
                
                if (el) {
                    h = h + parseInt($(el).outerHeight());
                }
            });

            return this.frameHeight() - h;
        },

        /**
         * Print the page contents (TODO)
         */
        printPage: function() {
            return false;
        },

        /**
         * Create a popup zoom icon
         * @param {Object} el Popup link element
         */
        zoom: function(el) {
            var child = el.firstChild;
            // Create basic zoom element
            var zoom = $('<span/>');

            // add IE6 identifier class
            if (JCEMediaBox.isIE6) {
                $(el).addClass('ie6');
            }

            // If child is an image (thumbnail)
            if (child && child.nodeName == 'IMG') {
                var align   = child.getAttribute('align');
                var vspace  = child.getAttribute('vspace');
                var hspace  = child.getAttribute('hspace');

                var styles = {};

                // Transfer margin, padding and border
                $.each(['top', 'right', 'bottom', 'left'], function(i, pos) {
                    // Set margin
                    styles['margin-' + pos]     = $(child).css('margin-' + pos);
                    // Set padding
                    styles['padding-' + pos]    = $(child).css('padding-' + pos);
                    // Set border
                    each(['width', 'style', 'color'], function(prop) {
                        styles['border-' + pos + '-' + prop] = $(child).css('border-' + pos + '-' + prop);
                    });

                });

                // Correct from deprecated align attribute
                if (/\w+/.test(align)) {
                    $.extend(styles, {
                        'float': /left|right/.test(align) ? align : '',
                        'text-align': /top|middle|bottom/.test(align) ? align : ''
                    });
                }
                // Correct from deprecated vspace attribute
                if (vspace > 0) {
                    $.extend(styles, {
                        'margin-top': parseInt(vspace),
                        'margin-bottom': parseInt(vspace)
                    });
                }
                // Correct from deprecated hspace attribute
                if (hspace > 0) {
                    $.extend(styles, {
                        'margin-left': parseInt(hspace),
                        'margin-right': parseInt(hspace)
                    });
                }

                var w 	= child.getAttribute('width');
                var h 	= child.getAttribute('height');
                var ws 	= $(child).css('width');

                // get 'real' width and height
                var rh = child.height, rw = child.width;

                // height is set but not width, calculate width
                if (!w && h) {
                    w = h / rh * rw;
                }

                if (!w && ws) {
                    // pixel value
                    if (/([0-9]+)(px)?$/.test(ws)) {
                        w = parseFloat(ws);
                    // other value
                    } else {
                        w = child.width;
                    }
                    $(child).attr('width', w);
                }

                // Add style alignment
                $.extend(styles, {
                    'float'	: $(child).css('float'),
                    'text-align': child.style.textAlign,
                    'width' 	: w
                });

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
                    var span = $('<span/>').attr({
                        'class'	: 'jcemediabox-zoom-span',
                        'style'	: child.style.cssText,
                        'title' : child.title || child.alt || ''	 
                    }).appendTo(el).css(styles).append(child).append(zoom);

                    // Remove attributes and css that may affect layout
                    $(child).removeAttr('style align border hspace vspace').css({
                        'margin'    : 0,
                        'padding'   : 0,
                        'float'     : 'none',
                        'border'    : 'none'
                    });

                    // Add zoom-image class
                    $(zoom).addClass('jcemediabox-zoom-image');

                    // Set explicit positions for IE6 when zoom icon is png
                    if (JCEMediaBox.isIE6 && /\.png/i.test($(zoom).css('background-image'))) {
                        $(zoom).png();
                    }
                }

                // build zoom icon
                _buildIcon(el, zoom, child, styles);

            } else {
                $(zoom).addClass('jcemediabox-zoom-link');
                if ($(el).hasClass('icon-left')) {
                    $(el).before(zoom);
                } else {
                    $(el).append(zoom);
                }
                // IE7 won't accept display:inherit
                if (JCEMediaBox.isIE7) {
                    $(zoom).css('display', 'inline-block');
                }
            }
            // Return zoom icon element
            return zoom;
        },

        /**
         * Process autopopups
         */
        auto: function() {
            var self = this;
            $.each(this.popups, function(i, el) {
                if (el.auto) {
                    if (el.auto == 'single') {
                        var cookie = self.getCookie('jcemediabox_autopopup_' + el.id);
                        if (!cookie) {
                            self.setCookie('jcemediabox_autopopup_' + el.id, 1);
                            self.start(el);
                        }
                    } else if (el.auto == 'multiple') {
                        self.start(el);
                    }
                }
            });

        },

        /**
         * Initilise popup and create global jcepopup variable
         * @param {Object} elements Optional array of popup elements
         */
        init: function() {
            window.jcepopup = window.mediabox = this;
            this.create();
        },

        /**
         * Get popup objects
         * @param {String} s Optional selector
         * @param {Object} p Optional parent element popups contained within
         */
        getPopups : function(s, p) {
            var selector = 'a.jcebox, a.jcelightbox, a.jcepopup, area.jcebox, area.jcelightbox, area.jcepopup';
            return $(s || selector, p);
        },

        getData : function(n) {
            var o = {}, data;
            var re = /\w+\[[^\]]+\]/;
			
            data = $(n).data('mediabox') || $(n).data('json');

            // try title or rel attributes
            if (!data) {
                var title 	= $(n).attr('title');
                var rel 	= $(n).attr('rel');

                if (re.test(title)) {
                    // convert to object
                    o = this.params(title);

                    // restore rel attribute
                    $(n).attr('title', o.title || '');

                    return o;
                }

                if (re.test(rel)) {
                    var args = [];

                    rel = rel.replace(/\b((\w+)\[(.*?)\])(;?)/g, function(a, b, c) {
                        args.push(b);
                        return '';
                    });
                    
                    o = this.params(args);

                    // restore rel attribute
                    $(n).attr('rel', rel || o.rel || '');

                    return o;
                }
            } else {
                // remove data attributes
                $(n).removeAttr('data-json data-mediabox');

                return this.params(data);
            }
            
            return o;
        },

        /**
         * Process a popup link and return properties object
         * @param {Object} el Popup link element
         */
        process : function(el) {
            var data, o = {}, group = '', auto = false, match;

            // Simplify class identifier for css
            if (/(jcelightbox|jcebox)/.test(el.className)) {
                $(el).removeClass('jcelightbox jcebox').addClass('jcepopup');
            }
            // Create zoom icon
            if (JCEMediaBox.options.popup.icons == 1 && el.nodeName == 'A' && !/(noicon|icon-none|noshow)/.test(el.className) && el.style.display != 'none') {
                var zoom = this.zoom(el);
            }

            // Fix title and rel and move parameters
            var title 	= el.title 	|| '';
            var rel 	= el.rel 	|| '';

            var src = el.href;

            // Legacy width/height values
            src = src.replace(/b(w|h)=([0-9]+)/g, function(s, k, v) {
                k = (k == 'w') ? 'width' : 'height';

                return k + '=' + v;
            });

            data = this.getData(el) || {};
            
            // Process rel attribute
            if (!/\w+\[[^\]]+\]/.test(rel)) {
                var rx 	= 'alternate|stylesheet|start|next|prev|contents|index|glossary|copyright|chapter|section|subsection|appendix|help|bookmark|nofollow|licence|tag|friend';
                var lb 	= '(lightbox(\[(.*?)\])?)';
                var lt 	= '(lyte(box|frame|show)(\[(.*?)\])?)';

                group 	= $.trim(rel.replace(new RegExp('\s*(' + rx + '|' + lb + '|' + lt + ')\s*'), '', 'gi'));
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
            if (el.id) {
                if (/autopopup-(single|multiple)/.test(el.className)) {
                    auto = /(multiple)/.test(el.className) ? 'multiple' : 'single';
                }
            }
            
            // get group from data object
            group = group || data.group || '';

            // Popup object
            $.extend(o, {
                'src'	: src,
                'title'	: data.title || title,
                'group'	: $(el).hasClass('nogroup') ? '' : group,
                'type'	: data.type || el.type || '',
                'params': data,
                'id'	: el.id || '',
                'auto'	: auto
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
        create: function(elements) {
            var self = this, pageload = false, auto = false;

            // set pageload marker
            if (!elements) {
                pageload 	= true;
                this.popups = [];

                // Converts a legacy (window) popup into an inline popup
                if (JCEMediaBox.options.popup.legacy == 1) {
                    self.convertLegacy();
                }

                // Converts a lightbox popup into mediabox popup
                if (JCEMediaBox.options.popup.lightbox == 1) {
                    self.convertLightbox();
                }

                // Converts a shadowbox popup into mediabox popup
                if (JCEMediaBox.options.popup.shadowbox == 1) {
                    self.convertShadowbox();
                }
            }

            // get supplied elements or from jcepopup class
            elements = elements || this.getPopups();

            // Iterate through all found or specified popup links
            $(elements).each(function(i) {
                var o = self.process(this);

                self.popups.push(o);

                // new index if not a pageload
                if (!pageload) {
                    i = self.popups.length - 1;
                }

                // Add click event to link
                $(this).click(function(e) {
                    e.preventDefault();
                    return self.start(o, i);
                });

            });

            // if no elements are specified, must be a pageload
            if (pageload) {
                // set theme
                this.popuptheme = '';

                // Load the popup theme
                var theme = JCEMediaBox.options.theme;

                $.post(JCEMediaBox.site + 'plugins/system/jcemediabox/themes/' + theme + '/popup.html', function(text, xml) {
                    var re = /<!-- THEME START -->([\s\S]*?)<!-- THEME END -->/;
                    if (re.test(text)) {
                        text = re.exec(text)[1];
                    }
                    self.popuptheme = text;
                    // Process auto popups
                    if (!auto) {
                        self.auto();
                        auto = true;
                    }
                });
            }
        },

        /**
         * Public popup method
         * @param {String / Object} data Popup URL string or data object
         * @param {String} title Popup Title
         * @param {String} group Popup Group
         * @param {String} type Popup Type, eg: image, flash, ajax
         * @param {Object} params Popup Parameters Object
         */
        open: function(data, title, group, type, params) {
            if ($.type(data) == 'string') {
                data = {
                    'src'	: data,
                    'title'	: title,
                    'group'	: group,
                    'type'	: type,
                    'params'    : params
                };
            }

            return this.start(data);
        },

        /**
         * Start a popup
         * @param {Object} o The popup link object
         * @param {Object} i The popup index
         */
        start: function(p, i) {
            var n = 0, items = [];

            // build popup window
            if (this.build()) {
                if (p.group) {
                    $.each(this.popups, function(x, o) {
                        if (o.group == p.group) {
                            var len = items.push(o);
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
        build: function() {
            var self = this;

            if (!$('#jcemediabox-popup-page').get(0)) {
                // Create main page object
                var $page = $('<div/>').attr('id', 'jcemediabox-popup-page').addClass(function() {
                    if (JCEMediaBox.isIE6) {
                        return 'ie6';
                    }
                    
                    if (JCEMediaBox.isIE7) {
                        return 'ie7';
                    }
                    
                    if (JCEMediaBox.isIDevice) {
                        return 'idevice';
                    }
                }).appendTo(document.body);

                if (JCEMediaBox.options.popup.overlay == 1) {
                    // Create overlay
                    $('<div/>').attr('id', 'jcemediabox-popup-overlay').css({
                        'opacity': 0,
                        'background-color': JCEMediaBox.options.popup.overlaycolor
                    }).appendTo($page);
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
                var $frame = $('<div/>').attr('id', 'jcemediabox-popup-frame').html('<div id="jcemediabox-popup-body">' + this.popuptheme + '</div>').appendTo($page);

                // Hide all
                $('[id]', $frame).hide();

                // Add close function to frame on click
                if (JCEMediaBox.options.popup.close == 2) {
                    $frame.click(function(e) {
                        if (e.target && e.target == this) {
                            self.close();
                        }
                    });
                }

                // Setup Close and Cancel link event
                $('#jcemediabox-popup-closelink, #jcemediabox-popup-cancellink').click(function() {
                    return self.close();
                });

                // Setup Next link event
                $('#jcemediabox-popup-next').click(function() {
                    return self.nextItem();
                });

                // Setup Previous link event
                $('#jcemediabox-popup-prev').click(function() {
                    return self.previousItem();
                });

                if ('#jcemediabox-popup-numbers') {
                    this.numbers.tmpHTML = this.numbers.innerHTML;
                }

                // PNG Fix
                if (JCEMediaBox.isIE6) {
                    $('#jcemediabox-popup-body').png();
                    $('*', '#jcemediabox-popup-body').not('#jcemediabox-popup-content').png();

                }
            }
            return true;
        },

        /**
         * Show the popup window
         * @param {Array} items Array of popup objects
         * @param {Int} n Index of current popup
         */
        show: function(items, n) {
            this.items = items;
            this.bind(true);

            // Show popup
            $('#jcemediabox-popup-body').show();
            // Get top position
            var top = ($(document).height() - $('#jcemediabox-popup-body').outerHeight()) / 2;

            // Set top position
            $('#jcemediabox-popup-body').css('top', top);
            // Changes if IE6 or scrollpopup
            if (JCEMediaBox.isIE6 || JCEMediaBox.isIDevice || JCEMediaBox.options.popup.scrolling == 'scroll') {
                $('#jcemediabox-popup-page').css('position', 'absolute');
                $('#jcemediabox-popup-overlay').css('height', $(document).height());
                $('#jcemediabox-popup-body').css('top', $(document).scrollTop() + top);
            }
            // Fade in overlay
            if (JCEMediaBox.options.popup.overlay == 1) {
                $('#jcemediabox-popup-overlay').show().animate({
                    'opacity' : JCEMediaBox.options.popup.overlayopacity
                }, JCEMediaBox.options.popup.fadespeed);
            }

            return this.change(n);
        },

        /**
         * Create event / key bindings
         * @param {Boolean} open Whether popup is opened or closed
         */

        // TODO - Resize popup when browser window resizes
        bind: function(open) {
            var self = this, isIE6 = JCEMediaBox.isIE6;

            if (isIE6) {
                $('select').each(function() {
                    if (open) {
                        this.tmpStyle = this.style.visibility || '';
                    }
                    this.style.visibility = open ? 'hidden' : this.tmpStyle;
                });

            }
            if (JCEMediaBox.options.popup.hideobjects) {
                $('object, embed').not('#jcemediabox-popup-object').each(function() {
                    if (open) {
                        this.tmpStyle = this.style.visibility || '';
                    }
                    this.style.visibility = open ? 'hidden' : this.tmpStyle;
                });

            }
            var scroll = JCEMediaBox.options.popup.scrollpopup;
            if (open) {
                $(document).bind('mediabox.keydown', function(e) {
                    self.listener(e);
                });

                if (isIE6) {
                    $(window).bind('mediabox.scroll', function(e) {
                        $(self.overlay).height($(document).scrollTop()).width($(document).scrollLeft());
                    });
                }
            } else {
                if (isIE6 || !scroll) {
                    $(window).unbind('mediabox.scroll').unbind('mediabox.resize');
                }
                $(document).unbind('mediabox.keydown');
            }
        },

        /**
         * Keyboard listener
         * @param {Object} e Event
         */
        listener: function(e) {
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
        queue: function(n) {
            var self = this;
            // Optional element
            var changed = false;

            $('#jcemediabox-popup-info-top, #jcemediabox-popup-info-bottom').each(function() {

                var v = $(this).outerHeight();
                
                var style = {
                    top : $(this).is('#jcemediabox-popup-info-top') ? v : -v
                };
                
                $(this).animate(style, JCEMediaBox.options.popup.scalespeed, function() {
                    if (!changed) {
                        changed = true;
                        $('#jcemediabox-popup-content').animate({
                            'opacity': 0
                        }, JCEMediaBox.options.popup.fadespeed, function() {
                            return self.change(n);
                        });

                    }
                });
            });

        },

        /**
         * Process the next popup in the group
         */
        nextItem: function() {
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
        previousItem: function() {
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
        info: function() {
            // Optional Element Caption/Title

            if ($('#jcemediabox-popup-caption').get(0)) {
                var title = this.active.caption || this.active.title || '', text = '';

                var ex = '([-!#$%&\'\*\+\\./0-9=?A-Z^_`a-z{|}~]+@[-!#$%&\'\*\+\\/0-9=?A-Z^_`a-z{|}~]+\.[-!#$%&\'*+\\./0-9=?A-Z^_`a-z{|}~]+)';
                var ux = '((news|telnet|nttp|file|http|ftp|https)://[-!#$%&\'\*\+\\/0-9=?A-Z^_`a-z{|}~]+\.[-!#$%&\'\*\+\\./0-9=?A-Z^_`a-z{|}~]+)';

                function processRe(h) {
                    h = h.replace(new RegExp(ex, 'g'), '<a href="mailto:$1" target="_blank" title="$1">$1</a>');
                    h = h.replace(new RegExp(ux, 'g'), '<a href="$1" target="_blank" title="$1">$1</a>');

                    return h;
                }

                if (/::/.test(title)) {
                    var parts = title.split('::');
                    title = JCEMediaBox.trim(parts[0]);
                    text = JCEMediaBox.trim(parts[1]);
                }
                var h = '';
                if (title) {
                    h += '<h4>' + title + '</h4>';
                }
                if (text) {
                    h += '<p>' + text + '</p>';
                }
                $('#jcemediabox-popup-caption').html(h || '&nbsp;');

                // Process e-mail and urls
                $('*', '#jcemediabox-popup-caption').not('a').children().each(function() {
                    if (this.nodeType == 3) {
                        var s = $(this).text();
                        if (s && /(@|:\/\/)/.test(s)) {
                            if (s = processRe(s)) {
                                $(this).parent().html(s);
                            }
                        }
                    }
                });

            }
            // Optional Element
            var t = this, len = this.items.length;

            if (this.numbers && len > 1) {
                var html = this.numbers.tmpHTML || '{$numbers}';

                if (/\{\$numbers\}/.test(html)) {
                    this.numbers.innerHTML = '';
                    for (var i = 0; i < len; i++) {
                        var n = i + 1;
                        // Craete Numbers link
                        var link = DOM.add(this.numbers, 'a', {
                            'href': 'javascript:;',
                            'title': this.items[i].title || n,
                            'class': (this.index == i) ? 'active' : ''
                        }, n);
                        // add click event
                        Event.add(link, 'click', function(e) {
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

            each(['top', 'bottom'], function(v, i) {
                var el = t['info-' + v];
                if (el) {
                    DOM.show(el);
                    each(DOM.select('*[id]', el), function(s) {
                        DOM.show(s);
                    });

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
        change: function(n) {
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
            
            var width 	= p.width 	|| JCEMediaBox.options.popup.width 	|| 0;
            var height	= p.height 	|| JCEMediaBox.options.popup.height || 0;
            
            if (/%/.test(width)) {
                width = DIM.getWidth() * parseInt(width) / 100;
            }
            
            if (/%/.test(height)) {
                height = DIM.getHeight() * parseInt(height) / 100;
            }

            extend(this.active, {
                'src'		: p.src || o.src,
                'title'		: o.title,
                'caption'	: p.caption || '',
                'type'		: p.type || this.getType(o),
                'params'	: p || {},
                'width'		: width,
                'height'	: height
            });

            // Setup info
            this.info();

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
                    this.img.onload = function() {
                        return t.setup();
                    };
                    
                    this.img.onerror = function() {
                        t.img.error = true;
                        return t.setup();
                    };

                    this.img.src = this.active.src;

                    // fix for resize / transparency issues in IE
                    if (isIE) {
                        DOM.style(this.content, 'background-color', DOM.style(this.content, 'background-color'));
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
                case 'pdf':
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

                    // Create single object for IE / Flash

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
                                    t.object += ' ' + n + '="' + decodeURIComponent(p[n]) + '"';
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
                        this.object = '<embed type="' + mt.mediatype + '"';
                        for (n in p) {
                            if (p[n] !== '') {
                                t.object += ' ' + n + '="' + decodeURIComponent(p[n]) + '"';
                            }
                        }
                        this.object += '></embed>';
                    }

                    // set global media type
                    this.active.type = 'media';

                    this.setup();
                    break;
                case 'video/x-flv':
                    this.object = '<object type="application/x-shockwave-flash" data="' + JCEMediaBox.site + 'plugins/system/jcemediabox/mediaplayer/mediaplayer.swf"';
            		
                    var src = this.active.src;
                    
                    if (!/:\/\//.test(src)) {
                        src = JCEMediaBox.site + src;
                    }
                    
                    var map = {
                        'loop' 		: 'loop',
                        'autoplay' 	: 'autoPlay',
                        'controls' 	: 'controlBarAutoHide'
                    };
                    
                    var v, flashvars = ['src=' + src], params = {
                        wmode : 'opaque', 
                        allowfullscreen : true
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
                        this.object = '<' + tag;
                		
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
                		
                            var src = this.active.src;
	                        
                            if (!/:\/\//.test(src)) {
                                src = JCEMediaBox.site + src;
                            }
	                        
                            var map = {
                                'loop' 		: 'loop',
                                'autoplay' 	: 'autoPlay',
                                'controls' 	: 'controlBarAutoHide'
                            };
	                        
                            var flashvars = ['src=' + src];
	                		
                            for (n in p) {
                                if (p[n] !== '') {                                
                                    if (/(loop|autoplay|controls|preload)$/.test(n)) {
                                        if (map[n]) {
                                            var v = (n == 'controls') ? !p[n] : !!p[n];
                                            flashvars.push(map[n] + '=' + v);
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

                    this.active.width 	= this.active.width 	|| this.width();
                    this.active.height 	= this.active.height 	|| this.height();

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

                    // Create ajax container
                    this.ajax = DOM.add(this.content, 'div', {
                        id: 'jcemediabox-popup-ajax',
                        'style': styles
                    });

                    // Corrective stuff for IE6 and IE7
                    if (JCEMediaBox.isIE6) {
                        DOM.style(this.ajax, 'margin-right', JCEMediaBox.Dimensions.getScrollbarWidth());
                    }

                    if (JCEMediaBox.isIE7) {
                        DOM.style(this.ajax, 'padding-right', JCEMediaBox.Dimensions.getScrollbarWidth());
                    }
                    this.active.src = this.active.src.replace(/\&type=(ajax|text\/html|text\/xml)/, '');

                    // show loader
                    if (this.loader) {
                        DOM.show(this.loader);
                    }
                    
                    // create an iframe to load internal content in rather than using ajax so that javascript in the article is processed
                    var iframe = DOM.add(document.body, 'iframe', {
                        src 	: this.active.src,
                        style 	: 'display:none;'
                    });
                    
                    // transfer data and delete iframe when loaded
                    Event.add(iframe, 'load', function() {
                        //iframe.onload = function() {
                        // transfer data
                        t.ajax.innerHTML = iframe.contentWindow.document.body.innerHTML;
                    	
                        window.setTimeout(function() {
                            // remove iframe
                            DOM.remove(iframe);
                        }, 10);

                        // process any popups in loaded content
                        t.create(t.getPopups('', t.content));

                        // process any tooltips in loaded content
                        JCEMediaBox.ToolTip.create(t.content);

                        each(DOM.select('a, area', t.content), function(el) {
                            JCEMediaBox.Event.add(el, 'click', function(e) {
                                if (el.href && el.href.indexOf('#') == -1) {
                                    if (/jce(popup|box|lightbox)/.test(el.className)) {
                                        Event.cancel(e);
                                        t.close(true);
                                    } else {
                                        t.close();
                                        if (isIE) {
                                            if (/http(s)?:\/\//.test(el.href)) {
                                                document.location.href = el.href;
                                            }
                                        }
                                    }
                                }
                            });

                        });

                        // setup
                        return t.setup();
                    });
                    
                    iframe.onerror = function() {
                        DOM.addClass(this.content, 'broken-page');
                        return t.setup();
                    };

                    break;
                case 'iframe':
                default:
                    if (this.print) {
                        this.print.style.visibility = 'hidden';
                    }

                    if (this.islocal(this.active.src)) {
                        if (!/tmpl=component/i.test(this.active.src)) {
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
        resize: function(w, h, x, y) {
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
        setup: function() {
            var t = this, DOM = JCEMediaBox.DOM, w, h;

            w = this.active.width;
            h = this.active.height;

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
            if (JCEMediaBox.options.popup.resize == 1 || JCEMediaBox.options.popup.scrolling == 'fixed') {
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

        /**
         * Animate the Popup
         */
        animate: function() {
            var t = this, each = JCEMediaBox.each, DOM = JCEMediaBox.DOM, FX = JCEMediaBox.FX, DIM = JCEMediaBox.Dimensions, Event = JCEMediaBox.Event;
            var ss = JCEMediaBox.options.popup.scalespeed, fs = JCEMediaBox.options.popup.fadespeed;

            var cw = DIM.outerWidth(this.content);
            var ch = DIM.outerHeight(this.content);
            var ih = 0;

            each(['top', 'bottom'], function(v, i) {
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
            }, ss, function() {
                // Iframe
                if (t.active.type == 'iframe') {
                    // Create IFrame
                    var iframe = DOM.add(t.content, 'iframe', {
                        id					: 'jcemediabox-popup-iframe',
                        frameborder			: 0,
                        allowTransparency	: true,
                        scrolling			: t.active.params.scrolling || 'auto',
                        'style'				: {
                            width	: '100%',
                            height	: '100%'
                        }/*,
                        seamless 			: "seamless"*/
                    });
                    
                    Event.add(iframe, 'load', function() {
                        //iframe.onload = function() {
                        // Hide loader
                        if (t.loader) {
                            DOM.hide(t.loader);
                        }
                    });
                    
                    // Set src
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
                    }
                    
                    if (t.active.type == 'ajax') {
                        DOM.show(t.ajax);
                    }
                }
 
                DOM.show(t.content);
                t.content.focus();
                
                /**
                 * Private internal function
                 * Show info areas of popup
                 */
                function showInfo() {
                    // Set Information
                    var itop = t['info-top'];
                    if (itop) {
                        each(DOM.select('*[id]', itop), function(el) {
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
                        each(DOM.select('*[id]', ibottom), function(el) {
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
                }

                // Animate fade in for images only and not on IE6!
                if (t.active.type == 'image' && !JCEMediaBox.isIE6) {
                    FX.animate(t.content, {
                        'opacity': 1
                    }, fs, function() {
                        showInfo();
                    });

                } else {
                    DOM.style(t.content, 'opacity', 1);
                    showInfo();
                }
            });

        },

        /**
         * Close the popup window. Destroy all objects
         */
        close: function(keepopen) {
            var t = this, each = JCEMediaBox.each, DOM = JCEMediaBox.DOM;

            // Destroy objects
            each(['img', 'object', 'iframe', 'ajax'], function(i, v) {
                t[v] = null;
            });

            // Hide closelink
            if (this.closelink) {
                DOM.hide(this.closelink);
            }
            // Empty content div
            this.content.innerHTML = '';
            // Hide info div
            each(['top', 'bottom'], function(i, v) {
                if (t['info-' + v]) {
                    DOM.hide(t['info-' + v]);
                }
            });

            if (!keepopen) {
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
                        }, JCEMediaBox.options.popup.fadespeed, function() {
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
})(jQuery);
// Cleanup events
JCEMediaBox.Event.addUnload( function() {
    JCEMediaBox.Event.destroy();
});
