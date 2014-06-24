/**
 * MediaBox
 * @param {type} $
 * @param {type} AddOns
 * @param {type} Theme
 * @returns {WFMediaBox.MediaBox}
 */

if (window.jQuery === undefined) {
    throw new Error('JQuery is required to run this script!');
}

define("mediabox/MediaBox", [
    "jQuery",
    "mediabox/util/Entities",
    "mediabox/util/Storage",
    "mediabox/Parameter",
    "mediabox/Env",
    "mediabox/Addons",
    "mediabox/Convert"
], function($, Entities, Storage, Parameter, Env, Addons, Convert) {

    var MediaBox = {
        // default settings object
        settings: {selector: 'a.jcepopup, area.jcepopup, [data-mediabox]'},
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
        init: function(settings) {
            var self = this;
            
            // extend settings with passed in object
            $.extend(this.settings, settings);

            // init on ready
            $(document).on('ready', function() {
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
        getPopups: function(s, p) {
            var selector = s || this.settings.selector;

            return $(selector, p);
        },
        /**
         * Translate popup labels
         * @param {String} s Theme HTML
         */
        translate: function(s) {
            var o = this.settings;

            if (s) {
                s = s.replace(/\{#(\w+?)\}/g, function(a, b) {
                    return o.popup.labels[b];
                });
            }
            return s;
        },
        /**
         * Returns a styles object from a parameter
         * @param {Object} o
         */
        getStyles: function(o) {
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
         * Determine whether the url is local
         * @param {Object} s
         */
        islocal: function(s) {
            if (/^(\w+):\/\//.test(s)) {
                return new RegExp('^(' + Env.url + ')').test(s);
            } else {
                return true;
            }
        },
        /**
         * Get the width of the container frame
         */
        frameWidth: function() {
            var w = 0, s, el = $('#jcemediabox-popup-frame');

            $('#jcemediabox-popup-info-top, #jcemediabox-popup-info-bottom').each(function() {
                s = this.id.replace('jcemediabox-popup-info-', '');
                w = w + parseFloat($(this).css('padding-' + s));
            });

            return parseFloat(el.clientWidth - w);
        },
        /**
         * Get the height of the container frame
         */
        frameHeight: function() {
            var h = 0, el = $('#jcemediabox-popup-frame');

            $('#jcemediabox-popup-info-top, #jcemediabox-popup-info-bottom').each(function() {
                var s = this.id.replace('jcemediabox-popup-info-', '');
                h = h + parseFloat($(el).css('padding-' + s));
            });

            return $(window).height() - h;
        },
        /**
         * Get the width of the usable window
         */
        width: function() {
            return this.frameWidth();
        },
        /**
         * Get the height of the usable window less info divs
         */
        height: function() {
            var h = 0, self = this;

            $('#jcemediabox-popup-info-top, #jcemediabox-popup-info-bottom').each(function() {
                h = h + parseInt($(this).outerHeight());
            });

            return this.frameHeight() - h;
        },
        /**
         * Process autopopups
         */
        auto: function() {
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

            $(this.popups).each(function(i, el) {
                if (el.auto) {
                    if (el.auto == 'single') {
                        // use element ID or base64 key
                        key = el.id || makeID(el.src);

                        // get cookie
                        var cookie = Storage.get('jcemediabox_' + key + '_' + i);

                        // create cookie with base64 key
                        if (!cookie) {
                            Storage.set('jcemediabox_' + key + '_' + i, 1);
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
        getData: function(n) {
            var o = {}, data, re = /\w+\[[^\]]+\]/;

            data = $(n).attr('data-mediabox') || $(n).attr('data-json');

            // try rel attribute
            if (!data) {
                var rel = $(n).attr('rel');

                if (rel && re.test(rel)) {
                    var args = [];

                    rel = rel.replace(/\b((\w+)\[(.*?)\])(;?)/g, function(a, b, c) {
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
                return Parameter.parse(data);
            }

            return o;
        },
        /**
         * Process a popup link and return properties object
         * @param {Object} el Popup link element
         */
        process: function(el) {
            var data, o = {}, group = '', auto = false;

            // Fix title and rel and move parameters
            var title = el.title || '', rel = el.rel || '';

            var src = el.href;

            // Legacy width/height values
            src = src.replace(/b(w|h)=([0-9]+)/g, function(s, k, v) {
                k = (k == 'w') ? 'width' : 'height';

                return k + '=' + v;
            });

            data = this.getData(el) || {};

            // Process rel attribute
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

            // get group from data object
            group = group || data.group || '';

            // Popup object
            $.extend(o, {
                'src': src,
                'title': data.title || title,
                'group': $(el).hasClass('nogroup') ? '' : group,
                'params': data,
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
        create: function(elements) {
            var self = this, s = this.settings, pageload = false, auto = false, i = 0;

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
            $(this.elements).removeClass('jcelightbox jcebox jcepopup').addClass('wfpopup').each(function() {
                var o = self.process(this);

                // add to popups array
                self.popups.push(o);

                // new index if not a pageload
                if (!pageload) {
                    i = self.popups.length - 1;
                }

                // Add click event to link
                $(this).on('click', function(e) {
                    e.preventDefault();
                    return self.start(o, i);
                });

                if (s.popup.icons === 1) {
                    if ($(this).find('img').length) {
                        $(this).addClass('wf-icon-zoom-image');
                    } else {
                        $(this).addClass('wf-icon-zoom-link');
                    }
                }

                i++;
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
        open: function(data, title, group, type, params) {
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
                i = $.inArray(this.elements, data);

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
         * @param {Object} p The popup link object
         * @param {Object} i The popup index
         */
        start: function(p, i) {
            var n = 0, items = [], len;

            // build popup window
            if (this.build()) {
                if (p.group) {
                    $.each(this.popups, function(x, o) {
                        if (o.group === p.group) {
                            len = items.push(o);
                            if (i && x === i) {
                                n = len - 1;
                            }
                        }
                    });

                    // Triggered popup
                    if (!p.auto && typeof i === undefined) {
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
            var self = this, s = this.settings;

            if ($('#jcemediabox-popup-page').length === 0) {
                // Create main page object
                $('body').append('<div id="jcemediabox-popup-page" />');

                // add ie6 identifier
                if (Env.ie6) {
                    $('#jcemediabox-popup-page').addClass('ie6');
                }
                // add ios identifier
                if (Env.iOS) {
                    $('#jcemediabox-popup-page').addClass('ios');
                }

                // Create overlay
                if (s.popup.overlay === 1) {
                    $('<div id="jcemediabox-popup-overlay" />').appendTo('#jcemediabox-popup-page');
                }

                // Create Frame and body with theme content
                $('#jcemediabox-popup-page').append('<div id="jcemediabox-popup-frame"><div id="jcemediabox-popup-body" /></div>');

                var translate = function(s) {
                    return self.translate(s);
                };

                // add theme data
                Addons.Theme.parse(s.theme, translate, '#jcemediabox-popup-body');

                // hide all objects
                $('[id]', '#jcemediabox-popup-frame').hide();

                // add iPad scroll fix
                if (Env.iOS) {
                    $('#jcemediabox-popup-content').css('webkitOverflowScrolling', 'touch');
                }

                // Add close function to frame on click
                if (s.popup.close === 2) {
                    $('#jcemediabox-popup-frame').on('click', function(e) {
                        if (e.target && e.target === this) {
                            self.close();
                        }
                    });
                }
                // Setup Close link and Cancel link event
                $('#jcemediabox-popup-closelink, #jcemediabox-popup-cancellink').on('click', function() {
                    self.close();
                });

                // Setup Next link event
                $('#jcemediabox-popup-next').on('click', function() {
                    self.nextItem();
                });

                // Setup Previous link event
                $('#jcemediabox-popup-prev').on('click', function() {
                    self.previousItem();
                });

                // store html
                $('#jcemediabox-popup-numbers').tmpHTML = $('#jcemediabox-popup-numbers').html();
            }
            return true;
        },
        /**
         * Show the popup window
         * @param {Array} items Array of popup objects
         * @param {Int} n Index of current popup
         */
        show: function(items, n) {
            var top = 0, s = this.settings;

            this.items = items;
            this.bind(true);

            // Show popup
            $('#jcemediabox-popup-body').show();

            // Changes if IE6 or scrollpopup
            if (Env.ie6 || Env.iOS || s.popup.scrolling == 'scroll') {
                // Get top position
                if (!/\d/.test($('#jcemediabox-popup-body').css('top'))) {
                    top = ($(window).height() - $('#jcemediabox-popup-body').outerHeight()) / 2;
                }

                $('#jcemediabox-popup-page').css('position', 'absolute');
                $('#jcemediabox-popup-overlay').css('height', DIM.getScrollHeight());
                $('#jcemediabox-popup-body').css('top', DIM.getScrollTop() + top);
            }

            // Fade in overlay
            if (s.popup.overlay == 1 && $('#jcemediabox-popup-overlay').length) {
                $('#jcemediabox-popup-overlay').css('opacity', 0).animate({
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
        bind: function(open) {
            var self = this, s = this.settings;

            if (Env.ie6) {
                $('select').each(function(el) {
                    if (open) {
                        el.tmpStyle = el.style.visibility || '';
                    }
                    el.style.visibility = open ? 'hidden' : el.tmpStyle;
                });
            }
            if (s.popup.hideobjects) {
                $('object:not(#jcemediabox-popup-object), embed:not(#jcemediabox-popup-object)').each(function(el) {
                    if (open) {
                        el.tmpStyle = el.style.visibility || '';
                    }
                    el.style.visibility = open ? 'hidden' : el.tmpStyle;
                });

            }
            var scroll = s.popup.scrollpopup;

            if (open) {
                $(document).on('keydown', function(e) {
                    self.addListener(e);
                });

                if (Env.ie6) {
                    $(window).on('scroll', function(e) {
                        $('#jcemediabox-popup-overlay').height('height', DIM.getScrollHeight());
                    });

                    $(window).on('scroll', function(e) {
                        $('#jcemediabox-popup-overlay').width(DIM.getScrollWidth());
                    });

                }
            } else {
                if (Env.ie6 || !scroll) {
                    $(window).off('scroll');
                    $(window).off('resize');
                }
                $(document).off('keydown');
            }
        },
        /**
         * Keyboard listener
         * @param {Object} e Event
         */
        addListener: function(e) {
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
            var self = this, s = this.settings;
            // Optional element
            var changed = false;

            $('#jcemediabox-popup-info-top, #jcemediabox-popup-info-bottom').each(function() {
                var v = $(this).outerHeight();
                var style = {'top': v};

                if (this.id.indexOf('-top') === -1) {
                    style.top = -v;
                }

                $(this).animate(style, s.popup.scalespeed, function() {
                    if (!changed) {
                        changed = true;
                        $('#jcemediabox-popup-content').animate({'opacity': 0}, s.popup.fadespeed, function() {
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
            var popup = this.items[this.index];

            // Optional Element Caption/Title

            if ($('#jcemediabox-popup-caption').length) {
                var title = popup.title || '', text = popup.caption || '', h = '';

                var ex = '([-!#$%&\'\*\+\\./0-9=?A-Z^_`a-z{|}~]+@[-!#$%&\'\*\+\\/0-9=?A-Z^_`a-z{|}~]+\.[-!#$%&\'*+\\./0-9=?A-Z^_`a-z{|}~]+)';
                var ux = '((news|telnet|nttp|file|http|ftp|https)://[-!#$%&\'\*\+\\/0-9=?A-Z^_`a-z{|}~]+\.[-!#$%&\'\*\+\\./0-9=?A-Z^_`a-z{|}~]+)';

                function processRe(h) {
                    h = h.replace(new RegExp(ex, 'g'), '<a href="mailto:$1" target="_blank" title="$1">$1</a>');
                    h = h.replace(new RegExp(ux, 'g'), '<a href="$1" target="_blank" title="$1">$1</a>');

                    return h;
                }
                // get title / caption from popup title
                if (/::/.test(title)) {
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
                $('#jcemediabox-popup-caption').html(h);

                // hide caption container if empty
                if (h != '') {
                    // Process e-mail and urls
                    $('#jcemediabox-popup-caption').find(':not(a)').each(function() {
                        var s = $(this).text();
                        if (s && /(@|:\/\/)/.test(s)) {
                            if (s = processRe(s)) {
                                $(this).parent().html(s);
                            }
                        }
                    });
                }
            }

            // Optional Element
            var self = this, len = this.items.length;

            if ($('#jcemediabox-popup-numbers').length && len > 1) {
                var html = $('#jcemediabox-popup-numbers').tmpHTML || '{$numbers}';

                if (/\{\$numbers\}/.test(html)) {
                    $('#jcemediabox-popup-numbers').empty();

                    for (var i = 0; i < len; i++) {
                        var n = i + 1;

                        var title = this.items[i].title || n;

                        // Craete Numbers link
                        var link = $('<a href="#" title="' + title + '" />').addClass((this.index == i) ? 'active' : '').html(n).appendTo('#jcemediabox-popup-numbers');

                        // add click event
                        $(link).on('click', function(e) {
                            var x = parseInt(e.target.innerHTML) - 1;
                            if (self.index == x) {
                                return false;
                            }
                            return self.queue(x);
                        });

                    }
                }

                if (/\{\$(current|total)\}/.test(html)) {
                    $('#jcemediabox-popup-numbers').html(html.replace('{$current}', this.index + 1).replace('{$total}', len));
                }
            } else {
                $('#jcemediabox-popup-numbers').empty();
            }
            // show info
            $('#jcemediabox-popup-info-top, #jcemediabox-popup-info-bottom').show().css('visibility', 'hidden').find('[id]').show();

            // Show / Hide Previous and Next buttons
            $('#jcemediabox-popup-next, #jcemediabox-popup-prev').hide();

            if (len > 1) {
                if (this.index > 0) {
                    $('#jcemediabox-popup-prev').show();
                } else {
                    $('#jcemediabox-popup-prev').hide();
                }
                if (this.index < len - 1) {
                    $('#jcemediabox-popup-next').show();
                } else {
                    $('#jcemediabox-popup-next').hide();
                }
            }
        },
        /**
         * Change the popup
         * @param {Integer} n Popup number
         */
        change: function(n) {
            var self = this, s = this.settings;

            var p = {}, popup, w, h;
            if (n < 0 || n >= this.items.length) {
                return false;
            }
            // set current popup index
            this.index = n;

            // Show Container, Loader, Cancel
            $('#jcemediabox-popup-container, #jcemediabox-popup-loader, #jcemediabox-popup-cancel-link').show();
            // Remove object
            $('#jcemediabox-popup-object').remove();

            //$('#jcemediabox-popup-content').empty();

            // get popup item
            popup = this.items[n];

            // get plugin for this media type
            var plugin = Addons.Plugin.getPlugin(popup.src, popup.type);

            // Get parameters from addon
            if (plugin) {
                $.extend(popup, plugin.attributes || {});
            }

            // delete alternate src
            delete popup.params.src;

            // shortcut
            var params = popup.params;

            // set width and height
            var width = params.width || s.popup.width;
            var height = params.height || s.popup.height;

            // calculate width if percentage
            if (/%/.test(width)) {
                width = $(window).width() * parseInt(width) / 100;
            }

            // calculate height if percentage
            if (/%/.test(height)) {
                height = $(window).height() * parseInt(height) / 100;
            }

            $.extend(popup, {
                'title': popup.title,
                'caption': params.caption,
                'width': width,
                'height': height
            });

            // re-set with updated parameters
            this.items[n] = popup;

            switch (popup.type) {
                case 'image':
                case 'image/jpeg':
                case 'image/png':
                case 'image/gif':
                case 'image/bmp':
                    var img = new Image();
                    // setup when loaded
                    img.onload = function() {
                        return self.setup();
                    };
                    // trigger error
                    img.onerror = function() {
                        img.error = true;
                        return self.setup();
                    };

                    // fix for resize / transparency issues in IE
                    if (Env.ie) {
                        $('#jcemediabox-popup-content').css('background-color', $('#jcemediabox-popup-content').css('background-color'));
                    }

                    // empty content
                    $('#jcemediabox-popup-content').find('img, iframe, object, embed, #jcemediabox-popup-ajax').remove();

                    var title = popup.title || '';

                    // create img tag and hide
                    $(img).appendTo('#jcemediabox-popup-content').attr({'id': 'jcemediabox-popup-img', 'title': title});

                    // set src and begin onload
                    img.src = popup.src;
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

                    p.src = this.active.src;
                    var base = /:\/\//.test(p.src) ? '' : this.site;
                    this.object = '';

                    w = this.width();
                    h = this.height();

                    var mt = this.mediatype(this.active.type);

                    if (this.active.type == 'flash') {
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
                case 'video/mp4':
                case 'audio/mp3':
                case 'video/webm':
                case 'audio/webm':
                case 'video/x-flv':
                    var type = this.active.type;
                    var tag = /video/.test(type) ? 'video' : 'audio';

                    p.width = p.width || this.active.width;
                    p.height = p.height || this.active.height;

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
                        src: this.active.src,
                        style: 'display:none;'
                    });

                    // transfer data and delete iframe when loaded
                    Event.add(iframe, 'load', function() {

                        // Create ajax container
                        t.ajax = DOM.add(t.content, 'div', {
                            id: 'jcemediabox-popup-ajax',
                            'style': styles
                        });

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

                        // setup
                        return t.setup();
                    });

                    iframe.onerror = function() {
                        $(this.content).addClass('broken-page');
                        return t.setup();
                    };

                    break;
                case 'iframe':
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
            var self = this, w, h, s = this.settings;

            //w = this.active.width;
            //h = this.active.height;

            // Setup info
            this.info();

            // Get image dimensions and resize if necessary
            /*if (this.active.type == 'image') {
             if (this.img.error) {
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
             if (s.popup.resize == 1 || s.popup.scrolling == 'fixed') {
             var x = this.width();
             var y = this.height();
             
             var dim = this.resize(w, h, x, y);
             
             w = dim.width;
             h = dim.height;
             }
             // set dimensions and hide
             $('#jcemediabox-popup-content').css({
             width: w,
             height: h
             }).hide();
             
             if (this.active.type == 'image') {
             if (this.img.error) {
             $('#jcemediabox-popup-content').addClass('wf-broken-image');
             } else {
             
             }
             
             // fix resized images in IE
             if (Env.ie) {
             $('#jcemediabox-popup-img').css('-ms-interpolation-mode', 'bicubic');
             }
             }*/

            // Animate box
            return this.animate();
        },
        showInfo: function() {
            var self = this, s = this.settings, ss = s.popup.scalespeed, fs = s.popup.fadespeed;

            // Set Information
            $('#jcemediabox-popup-info-top, #jcemediabox-popup-info-bottom').each(function() {
                var top = /info-top/.test(this.id);

                $('[id]', this).each(function() {
                    if (/jcemediabox-popup-(next|prev)/.test($(this).attr('id'))) {
                        return;
                    }
                    $(this).show();
                });

                //var h = DIM.outerHeight(this);

                /*$('#jcemediabox-popup-info-top').css({
                 'z-index': -1,
                 'top': top ? h : -h,
                 'visibility': 'visible'
                 });*/

                $(this).css('visibility', 'visible');

                if (top) {
                    $('#jcemediabox-popup-content').prepend(this);
                } else {
                    $('#jcemediabox-popup-content').append(this);
                }
            });
        },
        /**
         * Animate the Popup
         */
        animate: function() {
            var self = this, s = this.settings, ss = s.popup.scalespeed, fs = s.popup.fadespeed;

            // current popup
            var popup = this.items[this.index];

            var cw = popup.width;//DIM.outerWidth('#jcemediabox-popup-content');
            var ch = popup.height;//DIM.outerHeight('#jcemediabox-popup-content');
            var ih = 0;

            $('#jcemediabox-popup-info-top', '#jcemediabox-popup-info-top').each(function() {
                ih = ih + $(this).outerHeight();
            });

            var st = $('#jcemediabox-popup-page').css('position') == 'fixed' ? 0 : $(document).scrollTop();
            var top = st + (this.frameHeight() / 2) - ((ch + ih) / 2);

            if (top < 0) {
                top = 0;
            }

            // make content transparent
            $('#jcemediabox-popup-content').css('opacity', 0);

            // Animate width
            $('#jcemediabox-popup-content').animate({
                'max-height': ch,
                //'top': top,
                'max-width': cw
            }, ss, function() {

                // Iframe
                if (popup.type == 'iframe') {
                    // Create IFrame
                    var iframe = $('<iframe id="" allowtransparency="true" scrolling="' + popup.params.scrolling || 'auto' + '" />').appendTo('#jcemediabox-popup-content');
                    // use pdf loader
                    if (/\.pdf\b/.test(popup.src)) {
                        // Hide loader
                        $('#jcemediabox-popup-loader').hide();
                    } else {
                        $(iframe).on('load', function() {
                            $('#jcemediabox-popup-loader').hide();
                        });
                    }

                    // Set src
                    $(iframe).attr('src', popup.src);
                } else {
                    // Hide loader
                    $('#jcemediabox-popup-loader').hide();

                    // If media
                    if (popup.type == 'media' && $('#jcemediabox-popup-object').length) {
                        $('#jcemediabox-popup-object').show();
                    }

                    if (popup.type == 'ajax') {
                        $('#jcemediabox-popup-ajax').show();
                    }
                }

                $('#jcemediabox-popup-content').show();

                // Animate fade in for images only and not on IE6!
                if (popup.type == 'image' && !Env.ie6) {
                    $('#jcemediabox-popup-content').animate({
                        'opacity': 1
                    }, fs);

                    self.showInfo();

                } else {
                    $('#jcemediabox-popup-content').css('opacity', 1);
                    self.showInfo();
                }
            });

        },
        /**
         * Close the popup window. Destroy all objects
         */
        close: function(keepopen) {
            var self = this, s = this.settings;

            var ss = s.popup.scalespeed, fs = s.popup.fadespeed;

            // remove iframe src
            $('iframe', '#jcemediabox-popup-content').attr('src', '');

            // Destroy objects
            $('iframe, img, object, div', '#jcemediabox-popup-content').remove();

            // Hide closelink
            $('#jcemediabox-popup-closelink').hide();

            // Empty content div
            $('#jcemediabox-popup-content').empty();

            if (!keepopen) {
                // hide info divs
                $('#jcemediabox-popup-info-bottom, #jcemediabox-popup-info-top').hide();

                // reset popups
                var popups = this.getPopups();

                /*while (this.popups.length > popups.length) {
                 // this.popups.pop();
                 }*/

                $('#jcemediabox-popup-frame').remove();

                // Fade out overlay
                if ($('#jcemediabox-popup-overlay').length) {
                    if (Env.ie6) {
                        // Remove event bindings
                        this.bind();

                        $('##jcemediabox-popup-page').remove();
                    } else {
                        $('#jcemediabox-popup-overlay').animate({'opacity': 0}, fs, function() {
                            // remove frame and page
                            $('#jcemediabox-popup-page').remove();
                        });
                    }
                }
            }
            return false;
        }
    };

    MediaBox.Plugin = Addons.Plugin;
    MediaBox.Theme = Addons.Theme;

    // Export MediaBox as WFMediaBox/jcepopup in global namespace
    window.WFMediaBox = window.jcepopup = MediaBox;

    return MediaBox;
});