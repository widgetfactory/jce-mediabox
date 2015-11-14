/**
 * MediaBox
 * @param {type} $
 * @param {type} AddOns
 * @param {type} Theme
 * @returns {WFMediaBox.MediaBox}
 */

if (window.jQuery === "undefined") {
    throw new Error('JQuery is required to run Mediabox!');
}

define("mediabox/MediaBox", [
    "jQuery",
    "mediabox/util/Entities",
    "mediabox/util/Storage",
    "mediabox/Parameter",
    "mediabox/Env",
    "mediabox/Addons",
    "mediabox/Convert",
    "mediabox/util/Tools"
], function ($, Entities, Storage, Parameter, Env, Addons, Convert, Tools) {

    var MediaBox = {
        // default settings object
        settings: {selector: '.jcepopup, .wfpopup, [data-mediabox]', popup : {labels: {"close" : "Close", "next" : "Next", "previous" : "Previous"}}},
        // array of popup links / objects
        popups: [],
        // array of popup items
        items: [],
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
        init: function (settings) {
            var self = this;

            // extend settings with passed in object
            $.extend(this.settings, settings);

            // init on ready
            $(document).on('ready', function () {
                self.create();

                // activate mediaelement
                if (settings.mediaelement === 1) {
                    $('video,audio').mediaelementplayer();
                }
            });
        },
        /**
         * Get popup objects
         * @param {String} s Optional selector
         * @param {Object} p Optional parent element popups contained within
         */
        getPopups: function (s, p) {
            var selector = s || this.settings.selector;

            return $(selector, p);
        },
        /**
         * Translate popup labels
         * @param {String} s Theme HTML
         */
        translate: function (s) {
            var o = this.settings, labels = o.popup.labels;

            if (s) {
                s = s.replace(/\{\{(\w+?)\}\}/g, function (a, b) {
                    return labels[b] || a;
                });
            }
            return s;
        },
        /**
         * Returns a styles object from a parameter
         * @param {Object} o
         */
        getStyles: function (o) {
            var x = [];
            if (!o)
                return {};

            $.each(o.split(';'), function (i, s) {
                s = s.replace(/(.*):(.*)/, function (a, b, c) {
                    return '"' + b + '":"' + c + '"';
                });

                x.push(s);
            });

            return $.parseJSON('{' + x.join(',') + '}');
        },
        /**
         * Determine whether the url is local
         * @param {Object} s
         */
        islocal: function (s) {
            if (/^(\w+):\/\//.test(s)) {
                return new RegExp('^(' + Env.url + ')').test(s);
            } else {
                return true;
            }
        },
        /**
         * Get the width of the container frame
         */
        frameWidth: function () {
            var w = 0, s;

            $('.wf-mediabox-info-top, .wf-mediabox-info-bottom').each(function () {
                s = $(this).hasClass('wf-mediabox-info-top') ? 'top' : 'bottom';
                w = w + parseFloat($(this).css('padding-' + s));
            });

            return parseFloat($('.wf-mediabox-frame').width() - w);
        },
        /**
         * Get the height of the container frame
         */
        frameHeight: function () {
            var h = 0, el = $('.wf-mediabox-frame');

            $('.wf-mediabox-info-top, .wf-mediabox-info-bottom').each(function () {
                var s = this.id.replace('jcemediabox-popup-info-', '');
                h = h + parseFloat($(el).css('padding-' + s));
            });

            return $(window).height() - h;
        },
        /**
         * Get the width of the usable window
         */
        width: function () {
            return this.frameWidth();
        },
        /**
         * Get the height of the usable window less info divs
         */
        height: function () {
            var h = 0, self = this;

            $('.wf-mediabox-info-top, .wf-mediabox-info-bottom').each(function () {
                h = h + parseInt($(this).outerHeight());
            });

            return this.frameHeight() - h;
        },
        /**
         * Process autopopups
         */
        auto: function () {
            var self = this, key;

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

            $(this.popups).each(function (i, el) {
                if (el.auto) {
                    if (el.auto == 'single') {
                        // use element ID or base64 key
                        key = el.id || makeID(el.src);

                        // get cookie
                        var cookie = Storage.get('wf_mediabox_' + key + '_' + i);

                        // create cookie with base64 key
                        if (!cookie) {
                            Storage.set('wf_mediabox_' + key + '_' + i, 1);
                            self.start(el);
                        }
                    } else if (el.auto == 'multiple') {
                        self.start(el);
                    }
                }
            });

        },
        /**
         * Get popup data from the data attribute or rel attribute
         * @param {object} n Element
         * @returns {object} Data object
         */
        getData: function (n) {
            var o = {}, data, re = /\w+\[[^\]]+\]/;

            data = $(n).attr('data-mediabox') || $(n).attr('data-json');

            // try rel attribute
            if (!data) {
                var rel = $(n).attr('rel');

                if (rel && re.test(rel)) {
                    var args = [];

                    rel = rel.replace(/\b((\w+)\[(.*?)\])(;?)/g, function (a, b, c) {
                        args.push(b);
                        return '';
                    });
                    // parse paramter string to object
                    o = Parameter.parse(args) || {};

                    // restore rel attribute
                    $(n).attr('rel', rel || o.rel || '');

                    return o;
                }
            } else {
                // remove data attributes
                n.removeAttribute('data-json');
                n.removeAttribute('data-mediabox');

                // parse paramter string to object
                o = Parameter.parse(data);
            }

            // try data-mediabox attributes
            var i, attrs = n.attributes;

            for (i = attrs.length - 1; i >= 0; i--) {
                var attrName = attrs[i].name;

                if (attrName && attrName.indexOf('data-mediabox-') !== -1) {
                    var attr = attrName.replace('data-mediabox-', '');
                    o[attr] = decodeURIComponent(attrs[i].value);

                    n.removeAttribute('data-mediabox-' + attr);
                }
            }

            return o;
        },
        /**
         * Process a popup link and return properties object
         * @param {Object} el Popup link element
         */
        process: function (el) {
            var data, s = this.settings, o = {}, group = '', auto = false, match;

            // get src value from href attribute
            var src = el.href;

            // Legacy width/height values
            src = src.replace(/b(w|h)=([0-9]+)/g, function (s, k, v) {
                k = (k === 'w') ? 'width' : 'height';

                return k + '=' + v;
            });

            // process data
            data = this.getData(el) || {};

            // set title
            var title = el.title || data.title || '';
            // set caption
            var caption = data.caption || '';
            // set type
            var type = el.type || data.type || 'iframe';

            // get rel attribute value
            var rel = el.rel || '';

            // Process and cleanup rel attribute (legacy)
            if (!/\w+\[[^\]]+\]/.test(rel)) {
                var rx = 'alternate|stylesheet|start|next|prev|contents|index|glossary|copyright|chapter|section|subsection|appendix|help|bookmark|nofollow|licence|tag|friend';
                var lb = '(lightbox(\[(.*?)\])?)';
                var lt = '(lyte(box|frame|show)(\[(.*?)\])?)';

                group = $.trim(rel.replace(new RegExp('\s*(' + rx + '|' + lb + '|' + lt + ')\s*'), '', 'gi'));
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

            // check for auto popup
            if (/autopopup-(single|multiple)/.test(el.className)) {
                auto = /(multiple)/.test(el.className) ? 'multiple' : 'single';
            }

            // get group
            if ($(el).hasClass('nogroup')) {
                group = "";
            } else {
                // get group from data object
                group = group || data.group || '';
            }

            // set width and height
            var width = data.width || s.popup.width;
            var height = data.height || s.popup.height;

            // cleanup data
            $.each(['src', 'title', 'caption', 'group', 'width', 'height'], function (i, k) {
                delete data[k];
            });

            // convert to integer
            if (/\d/.test(width)) {
                width = parseInt(width);
            }

            // convert to integer
            if (/\d/.test(height)) {
                height = parseInt(height);
            }

            // Popup object
            $.extend(o, {
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
            var self = this, s = this.settings, pageload = false, auto = false;

            // set pageload marker
            if (!elements) {
                pageload = true;
                this.popups = [];

                // Converts a legacy (window) popup into an inline popup
                if (s.popup.legacy === 1) {
                    Convert.legacy();
                }

                // Converts a lightbox popup into mediabox popup
                if (s.popup.lightbox === 1) {
                    Convert.lightbox();
                }

                // Converts a shadowbox popup into mediabox popup
                if (s.popup.shadowbox === 1) {
                    Convert.shadowbox();
                }
            }

            // get supplied elements or from jcepopup class
            this.elements = elements || this.getPopups();

            // Iterate through all found or specified popup links
            $(this.elements).removeClass('jcelightbox jcebox jcepopup').addClass('wfpopup').each(function (i) {
                var o = self.process(this);

                // add to popups array
                self.popups.push(o);

                // new index if not a pageload
                if (!pageload) {
                    i = self.popups.length - 1;
                }

                if (s.popup.icons === 1) {
                    var $img = $('img:first', this).wrap('<span class="wf-icon-zoom-image" />');

                    if ($img.length) {
                        var flt = $img.css('float');
                        // transfer float
                        if (flt && flt !== "none") {
                            $img.parent().css('float', flt);
                        }

                        $(this).addClass('wf-zoom-image');
                    } else {
                        $(this).addClass('wf-icon-zoom-link');
                    }
                }

                // Add click event to link
                $(this).on('click', function (e) {
                    e.preventDefault();
                    return self.start(o, i);
                });
            });
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
            var i, x = 0, o = {};

            if (typeof data === "string") {
                $.extend(o, {
                    'src': data,
                    'title': title,
                    'group': group,
                    'type': type,
                    'params': params
                });
            }

            // process as an element
            if (typeof (data === 'object') && data.nodeName && (data.nodeName === 'A' || data.nodeName === 'AREA')) {
                i = $.inArray(this.elements, data);

                if (i >= 0) {
                    o = this.popups[i];
                    x = i;
                } else {
                    // process element
                    var o = this.process(data);

                    // add to array
                    x = this.popups.push(o);
                    // reduce by 1
                    x--;
                }
            }

            return this.start(o, x);
        },
        /**
         * Start a popup
         * @param {Object} p The popup link object
         * @param {Object} i The popup index
         */
        start: function (p, i) {
            var n = 0, items = [], len;

            // build popup window
            if (this.build()) {
                if (p.group) {
                    $.each(this.popups, function (x, o) {
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

                return this.show(items, n);
            }
        },
        /**
         * Build Popup structure
         */
        build: function () {
            var self = this, s = this.settings;

            if ($('.wf-mediabox').length === 0) {
                // Create main page object
                var $page = $('<div class="wf-mediabox" />').appendTo('body');

                // add ie6 identifier
                if (Env.ie6) {
                    $page.addClass('ie6');
                }
                // add ios identifier
                if (Env.iOS) {
                    $page.addClass('ios');
                }

                // Create overlay
                if (s.popup.overlay === 1) {
                    $('<div class="wf-mediabox-overlay" />').appendTo($page);
                }

                // Create Frame and body with theme content
                $page.append('<div class="wf-mediabox-frame"><div class="wf-mediabox-body" /></div>');

                // add theme data
                Addons.Theme.parse(s.theme, function(s) {
                    return self.translate(s);
                }, '.wf-mediabox-body');

                // hide all objects
                $('.wf-mediabox-frame').children().hide();

                // add iPad scroll fix
                if (Env.iOS) {
                    $('.wf-mediabox-content').css('webkitOverflowScrolling', 'touch');
                }

                // Add close function to frame on click
                $('.wf-mediabox-frame').on('click', function (e) {
                    if (e.target && e.target === this) {
                        self.close();
                    }
                });

                // Setup Close link and Cancel link event
                $('.wf-mediabox-close, .wf-mediabox-cancel').on('click', function () {
                    self.close();
                });

                // Setup Next link event
                $('.wf-mediabox-next').on('click', function () {
                    self.nextItem();
                });

                // Setup Previous link event
                $('.wf-mediabox-prev').on('click', function () {
                    self.previousItem();
                });

                // store html
                $('.wf-mediabox-numbers').data('html', $('.wf-mediabox-numbers').html());
            }

            return true;
        },
        /**
         * Show the popup window
         * @param {Array} items Array of popup objects
         * @param {Int} n Index of current popup
         */
        show: function (items, n) {
            var top = 0, s = this.settings;

            this.items = items;
            this.bind(true);

            // Show popup
            $('.wf-mediabox-body').show();

            // Changes if IE6 or scrollpopup
            if (Env.ie6 || Env.iOS || s.popup.scrolling === 'scroll') {
                // Get top position
                if (!/\d/.test($('.wf-mediabox-body').css('top'))) {
                    top = ($(window).height() - $('.wf-mediabox-body').outerHeight()) / 2;
                }

                $('.wf-mediabox-page').css('position', 'absolute');
                $('.wf-mediabox-overlay').css('height', $(document).height());
                $('.wf-mediabox-body').css('top', $(document).scrollTop() + top);
            }

            // Fade in overlay
            if (s.popup.overlay === 1 && $('.wf-mediabox-overlay').length) {
                $('.wf-mediabox-overlay').css('opacity', 0).animate({
                    'opacity': parseFloat(s.popup.overlayopacity)
                }, s.popup.fadespeed);
            }

            return this.change(n);
        },
        /**
         * Create event / key bindings
         * @param {Boolean} open Whether popup is opened or closed
         */

        // TODO - Resize popup when browser window resizes
        bind: function (open) {
            var self = this, s = this.settings;

            if (Env.ie6) {
                $('select').each(function (el) {
                    if (open) {
                        el.tmpStyle = el.style.visibility || '';
                    }
                    el.style.visibility = open ? 'hidden' : el.tmpStyle;
                });
            }
            if (s.popup.hideobjects) {
                $('object, embed').not('.wf-mediabox-object').each(function (el) {
                    if (open) {
                        el.tmpStyle = el.style.visibility || '';
                    }
                    el.style.visibility = open ? 'hidden' : el.tmpStyle;
                });

            }
            var scroll = s.popup.scrollpopup;

            if (open) {
                $(document).on('keydown.wf-mediabox', function (e) {
                    self.addListener(e);
                });

                if (Env.ie6) {
                    $(window).on('scroll.wf-mediabox', function (e) {
                        $('.wf-mediabox-overlay').height('height', $(document).height());
                    });

                    $(window).on('scroll.wf-mediabox', function (e) {
                        $('.wf-mediabox-overlay').width($(document).width());
                    });

                }
            } else {
                if (Env.ie6 || !scroll) {
                    $(window).off('scroll.wf-mediabox');
                    $(window).off('resize.wf-mediabox');
                }
                $(document).off('keydown.wf-mediabox');
            }

            var resize = Tools.debounce(function () {
                var w = Math.floor($('.wf-mediabox-content').width() * ($('.wf-mediabox-frame').height() - 20) / $('.wf-mediabox-body').height());
                
                // reduce width to content max-width
                w = Math.min(w, parseInt($('.wf-mediabox-content').css('max-width')));
                
                // set body maax-width
                $('.wf-mediabox-body').css('max-width', w);

                $('.wf-mediabox-content > div').css('height', function (i, v) {

                    if (this.style.height) {
                        return $('.wf-mediabox-frame').height();
                    }

                    return "";
                });

            }, 100);

            $(window).on('resize.wf-mediabox', resize);
        },
        calculateWidth: function (cw, ch) {
            var ph = $('.wf-mediabox-body').outerHeight(), wh = $('.wf-mediabox-frame').height();

            // content width
            cw = cw || $('.wf-mediabox-content').width();

            // content height
            ch = ch || $('.wf-mediabox-content').height();

            // calculate height of popup container without content
            var mh = ph - $('.wf-mediabox-content').height();

            // get popup height with content included
            ph = mh + ch;

            return Math.min(cw, Math.floor(cw * Math.min(wh / ph, 1)));
        },
        /**
         * Keyboard listener
         * @param {Object} e Event
         */
        addListener: function (e) {
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
            var self = this, s = this.settings;
            // Optional element
            var changed = false;

            var callback = function () {
                if (!changed) {
                    changed = true;
                    $('.wf-mediabox-content').removeClass('fade-in').animate({'opacity': 0}, s.popup.fadespeed, function () {
                        return self.change(n);
                    });
                }
            };

            callback();
        },
        /**
         * Process the next popup in the group
         */
        nextItem: function () {
            if (this.items.length === 1)
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
            if (this.items.length === 1)
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
            var popup = this.items[this.index];

            // Optional Element Caption/Title

            if ($('.wf-mediabox-caption').length) {
                var title = popup.title || '', text = popup.caption || '', h = '';

                var ex = '([-!#$%&\'\*\+\\./0-9=?A-Z^_`a-z{|}~]+@[-!#$%&\'\*\+\\/0-9=?A-Z^_`a-z{|}~]+\.[-!#$%&\'*+\\./0-9=?A-Z^_`a-z{|}~]+)';
                var ux = '((news|telnet|nttp|file|http|ftp|https)://[-!#$%&\'\*\+\\/0-9=?A-Z^_`a-z{|}~]+\.[-!#$%&\'\*\+\\./0-9=?A-Z^_`a-z{|}~]+)';

                function processRe(h) {
                    h = h.replace(new RegExp(ex, 'g'), '<a href="mailto:$1" target="_blank" title="$1">$1</a>');
                    h = h.replace(new RegExp(ux, 'g'), '<a href="$1" target="_blank" title="$1">$1</a>');

                    return h;
                }
                // decode title
                title = decodeURIComponent(title);
                // decode text
                text = decodeURIComponent(text);

                // get title / caption from popup title
                if (title.indexOf('::') !== -1) {
                    var parts = title.split('::');
                    title = $.trim(parts[0]);
                    text = $.trim(parts[1]);
                }

                if (title) {
                    h += '<h4>' + Entities.decode(title) + '</h4>';
                }

                if (text) {
                    h += '<p>' + Entities.decode(text) + '</p>';
                }

                // set caption html (may be empty)
                $('.wf-mediabox-caption').html(h);

                if (!h) {
                    $('.wf-mediabox-caption').hide();
                } else {
                    // Process e-mail and urls
                    $('.wf-mediabox-caption').find(':not(a)').each(function () {
                        var s = $(this).text();
                        if (s && /(@|:\/\/)/.test(s)) {
                            if (s = processRe(s)) {
                                $(this).parent().html(s);
                            }
                        }
                    });

                    $('.wf-mediabox-caption').show();
                }
            }

            // Optional Element
            var self = this, len = this.items.length;

            if ($('.wf-mediabox-numbers').length && len > 1) {
                var html = $('.wf-mediabox-numbers').data('html') || '{{numbers}}';

                if (html.indexOf('{{numbers}') !== -1) {
                    $('.wf-mediabox-numbers').empty().append('<ul />');

                    for (var i = 0; i < len; i++) {
                        var n = i + 1;

                        if (len > 5 && i > 1 && i < len - 1 && this.index !== i) {
                            continue;
                        }

                        var title = this.items[i].title || n;

                        // Craete Numbers link
                        var link = $('<a href="#" title="' + title + '" />').addClass((this.index == i) ? 'active' : '').html(n);

                        $('<li />').append(link).appendTo($('ul', '.wf-mediabox-numbers'));

                        // add click event
                        $(link).on('click', function (e) {
                            var x = parseInt(e.target.innerHTML) - 1;
                            if (self.index == x) {
                                return false;
                            }
                            return self.queue(x);
                        });

                        if (len > 5 && i === 1) {
                            $('.wf-mediabox-numbers').append('<span>...</span>');
                        }
                    }
                }

                if (/\{\{\$(current|total)\}\}/.test(html)) {
                    $('.wf-mediabox-numbers').html(html.replace('{{current}}', this.index + 1).replace('{{total}}', len));
                }
            } else {
                $('.wf-mediabox-numbers').empty();
            }
            // show info
            $('.wf-mediabox-info-top, .wf-mediabox-info-bottom').show();//.children().show();

            // Show / Hide Previous and Next buttons
            $('.wf-mediabox-next, .wf-mediabox-prev').hide();

            if (len > 1) {
                if (this.index > 0) {
                    $('.wf-mediabox-prev').show();
                } else {
                    $('.wf-mediabox-prev').hide();
                }
                if (this.index < len - 1) {
                    $('.wf-mediabox-next').show();
                } else {
                    $('.wf-mediabox-next').hide();
                }
            }
        },
        /**
         * Change the popup
         * @param {Integer} n Popup number
         */
        change: function (n) {
            var self = this, s = this.settings;

            var p = {}, popup, w, h;
            if (n < 0 || n >= this.items.length) {
                return false;
            }
            // set current popup index
            this.index = n;

            // Show Container, Loader, Cancel
            $('.wf-mediabox-container, .wf-mediabox-cancel').show();

            // set loader
            $('.wf-mediabox-container').addClass('wf-mediabox-loading');

            // get current popup item
            popup = this.items[n];

            var type = "error";
            var html = "";

            // get plugin for this media type
            var plugin = Addons.Plugin.getPlugin(popup);

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
            }

            // empty content
            $('[class*="wf-mediabox-content-"]', '.wf-mediabox-content').remove();

            $('<div class="wf-mediabox-content-' + type + '" />').append(html).prependTo('.wf-mediabox-content');

            // re-set with updated parameters
            this.items[n] = popup;

            self.setup();

            return false;
        },
        /**
         * Pre-animation setup. Resize images, set width / height
         */
        setup: function () {
            // Setup info
            this.info();

            if (Env.ie) {
                $('.wf-mediabox-content img').css('-ms-interpolation-mode', 'bicubic');
            }

            // Animate box
            return this.animate();
        },
        showInfo: function () {
            var self = this;

            // Set Information
            $('.wf-mediabox-info-top, .wf-mediabox-info-bottom').addClass('wf-info-show');
        },
        /**
         * Animate the Popup
         */
        animate: function () {
            var self = this, s = this.settings, ss = s.popup.scalespeed, fs = s.popup.fadespeed;

            // current popup
            var popup = this.items[this.index];

            var cw = popup.width || $('.wf-mediabox-body').width();
            var ch = popup.height || '';

            cw = Tools.parseWidth(cw);
            ch = Tools.parseHeight(ch);

            // set body width
            $('.wf-mediabox-body, .wf-mediabox-content').css('max-width', cw);

            $('img, iframe, object, embed, audio, video', '.wf-mediabox-content').load(function () {
                if (this.nodeName === "IMG") {
                    var img = new Image();
                    // trigger onload to get dimensions
                    img.onload = function () {
                        cw = popup.width || img.width;
                        ch = popup.height || img.height;
                        
                        $('.wf-mediabox-content').css('max-width', cw);

                        var w = self.calculateWidth(cw, ch);

                        $('.wf-mediabox-body').animate({'max-width': w}, ss);
                    };
                    // set img src
                    img.src = popup.src;
                }

                // set height
                if (ch) {
                    $('.wf-mediabox-content > div').css('height', ch);
                }

                $('.wf-mediabox-container').removeClass('wf-mediabox-loading');

                // add fade in
                $('.wf-mediabox-content').animate({'opacity': 1}, fs).addClass('fade-in');

                // show info
                self.showInfo();
            }).error(function () {
                var n = this;
                $('.wf-mediabox-content').addClass(function () {
                    return $(n).is('img') ? "wf-broken-image" : "wf-broken-media";
                });
            });

            // set img src
            $('img', '.wf-mediabox-content').attr('src', popup.src);

        },
        /**
         * Close the popup window. Destroy all objects
         */
        close: function (keepopen) {
            var self = this, s = this.settings;

            var ss = s.popup.scalespeed, fs = s.popup.fadespeed;

            // remove iframe src
            $('iframe, video', '.wf-mediabox-content').attr('src', '');

            // Destroy objects
            $('.wf-mediabox-content').empty();

            // Hide closelink
            $('.wf-mediabox-close').hide();

            if (!keepopen) {
                // hide info divs
                $('.wf-mediabox-info-bottom, .wf-mediabox-info-top').hide();

                // reset popups
                var popups = this.getPopups();

                /*while (this.popups.length > popups.length) {
                 // this.popups.pop();
                 }*/

                $('.wf-mediabox-frame').remove();

                // Fade out overlay
                $('.wf-mediabox-overlay').animate({'opacity': 0}, fs, function () {
                    // remove frame and page
                    $('.wf-mediabox').remove();
                });
            }
            return false;
        }
    };

    MediaBox.Plugin = Addons.Plugin;
    MediaBox.Theme = Addons.Theme;
    MediaBox.Parameter = Parameter;

    // Export MediaBox as WFMediaBox/jcepopup in global namespace
    window.WFMediaBox = window.jcepopup = MediaBox;

    return MediaBox;
});