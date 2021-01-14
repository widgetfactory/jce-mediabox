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

(function ($) {
    var autoplayInterval;


    function scrollIntoView(el, pos) {
        var supported = 'scrollBehavior' in document.documentElement.style;

        if (supported) {
            try {
                $(el).get(0).scrollIntoView({
                    block: "center"
                });

                return;
            } catch (e) { }
        }

        // fallback to manual calculation
        var boxCenter = $(el).offset().top + $(el).outerHeight(true) / 2;
        var windowCenter = window.innerHeight / 2;

        window.scrollTo(0, boxCenter - windowCenter);

    }

    var MediaBox = {
        util: {},
        // default settings object
        settings: {
            selector: '.jcepopup, .wfpopup, [data-mediabox]',
            labels: {
                "close": "Close",
                "next": "Next",
                "previous": "Previous"
            },
            convert_local_url: true,
            autoplay: 0
        },
        // array of popup links / objects
        popups: [],
        // array of popup items
        items: [],

        // the link that opened the popup
        activator: null,

        /**
         * Get the Site Base URL
         * @method getSite
         * @return {String} Site Base URL
         */
        getSite: function () {
            var base = this.settings.base || "";

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
        },

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

            // get site url
            this.site = this.getSite();

            self.create();

            // convert legacy tooltips
            $('.jcetooltip, .jce_tooltip').each(function () {
                var text = $(this).attr('title') || '', title = '', cls = $(this).attr('class');

                // Split tooltip text ie: title::text
                if (text.indexOf('::') !== -1) {
                    var parts = text.split('::');
                    title = $.trim(parts[0]);
                    text = $.trim(parts[1]);
                }

                // reset title
                $(this).attr('title', text);

                // extact position if any
                var pos = /tooltip-(top|bottom|left|right)/.exec(cls);
                pos = pos ? pos[1] : 'top';

                if (window.UIkit && UIkit.tooltip) {
                    UIkit.tooltip(this, { title: text, position: pos });
                } else if (typeof $.fn.tooltip !== 'undefined') {
                    $('.jcetooltip, .jce_tooltip').tooltip({ 'title': text, placement: pos });
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
            var o = this.settings,
                labels = o.labels;

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
         * Process autopopups
         */
        auto: function () {
            var self = this,
                key;

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
                        var cookie = MediaBox.Storage.get('wf_mediabox_' + key + '_' + i);

                        // create cookie with base64 key
                        if (!cookie) {
                            MediaBox.Storage.set('wf_mediabox_' + key + '_' + i, 1);
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
            var o = {},
                data, re = /\w+\[[^\]]+\]/;

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
                    o = MediaBox.Parameter.parse(args) || {};

                    // restore rel attribute
                    $(n).attr('rel', rel || o.rel || '');

                    return o;
                }
            } else {
                // remove data attributes
                n.removeAttribute('data-json');
                n.removeAttribute('data-mediabox');

                // parse paramter string to object
                if (re.test(data)) {
                    o = MediaBox.Parameter.parse(data);
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
        },

        preloadMedia: function () { },

        /**
         * Process a popup link and return properties object
         * @param {Object} el Popup link element
         */
        process: function (el) {
            var data, s = this.settings,
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
            data = this.getData(el) || {};

            // set title
            var title = data.title || el.title || '';

            // set caption
            var caption = data.caption || '';

            // set type
            var type = data.type || el.type || '';

            // get rel attribute value
            var rel = el.rel || '';

            // skip pdf files on iOS
            if (MediaBox.Env.mobile && (/\.pdf$/i.test(src) || type === 'pdf')) {
                return;
            }

            // Process and cleanup rel attribute (legacy)
            if (!/\w+\[[^\]]+\]/.test(rel)) {
                var rx = 'alternate|stylesheet|start|next|prev|contents|index|glossary|copyright|chapter|section|subsection|appendix|help|bookmark|nofollow|noopener|noreferrer|licence|tag|friend';
                var lb = '(lightbox(\[(.*?)\])?)';
                var lt = '(lyte(box|frame|show)(\[(.*?)\])?)';

                group = $.trim(rel.replace(new RegExp("(^|\\s+)" + rx + "|" + lb + "|" + lt + "(\\s+|$)", "g"), '', 'gi'));
            }

            // Get AREA parameters from URL if not set
            if (el.nodeName == 'AREA') {
                if (!data) {
                    data = MediaBox.Parameter.parse(src);
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
            if ($(el).hasClass('nogroup')) {
                group = "";
            } else {
                // get group from data object
                group = group || data.group || '';
            }

            // set width and height
            var width = data.width || s.width;
            var height = data.height || s.height;

            // cleanup data
            $.each(['src', 'title', 'caption', 'group', 'width', 'height'], function (i, k) {
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
            $.extend(o, {
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
        },
        /**
         * Create a popup from identifiable link or area elements
         * Load the popup theme
         * @param {Object} elements Optional array of popup elements
         */
        create: function (elements) {
            var self = this,
                s = this.settings,
                pageload = false,
                auto = false;

            // set pageload marker
            if (!elements) {
                pageload = true;
                this.popups = [];

                // Converts a legacy (window) popup into an inline popup
                if (s.legacy === 1) {
                    MediaBox.Convert.legacy();
                }

                // Converts a lightbox popup into mediabox popup
                if (s.lightbox === 1) {
                    MediaBox.Convert.lightbox();
                }

                // Converts a shadowbox popup into mediabox popup
                if (s.shadowbox === 1) {
                    MediaBox.Convert.shadowbox();
                }
            }

            // get supplied elements or from jcepopup class
            this.elements = elements || this.getPopups();

            // Iterate through all found or specified popup links
            $(this.elements).removeClass('jcelightbox jcebox jcepopup').addClass('wfpopup').each(function (i) {
                var o = self.process(this);

                if (!o) {
                    return true;
                }

                // add to popups array
                self.popups.push(o);

                // new index if not a pageload
                if (!pageload) {
                    i = self.popups.length - 1;
                }

                // add noopener noreferrer if target="_blank"
                if ($(this).attr('target') === "_blank") {
                    var rel = $(this).attr('rel') || '';

                    if (rel.indexOf('noopener') === -1) {
                        rel += " noopener";
                    }

                    if (rel.indexOf('noreferrer') === -1) {
                        rel += " noreferrer";
                    }

                    $(this).attr('rel', $.trim(rel));
                }

                $(this).attr('class', function (i, v) {
                    return v.replace(/(zoom|icon)-(top|right|bottom|left|center)(-(top|right|bottom|left|center))?/, function (match, prefix, pos1, pos2) {
                        var str = 'wf-icon-zoom-' + pos1;

                        if (pos2) {
                            str += pos2;
                        }

                        return str;
                    });
                });

                if (s.icons === 1 && !$(this).hasClass('noicon')) {
                    var $img = $('img:first', this);

                    if ($img.length) {
                        var styles = {};

                        // add zoom image icon
                        $('<span class="wf-icon-zoom-image" />').html(function () {
                            return MediaBox.getSVGIcon('search');
                        }).insertAfter($img);

                        var flt = $img.css('float');
                        // transfer float
                        if (flt && flt !== "none") {
                            $img.parent().css('float', flt);
                            // reset float
                            $img.css('float', '');

                            $(this).addClass('wf-mediabox-has-float');
                        }

                        // Transfer margin, padding and border
                        $.each(['top', 'right', 'bottom', 'left'], function (i, pos) {
                            var m = $img.css('margin-' + pos),
                                p = $img.css('padding-' + pos);

                            if (m && /\d/.test(m) && parseInt(m) > 0) {
                                // Set margin
                                $img.parent().css('margin-' + pos, m);
                            }

                            if (p && /\d/.test(p) && parseInt(p) > 0) {
                                // Set padding
                                $img.parent().css('padding-' + pos, p);
                            }
                        });

                        // reset image margin, padding and border
                        $img.css({
                            'margin': 0,
                            'padding': 0,
                            'float': 'none'
                        });

                        // set applied styles to span
                        $img.parent().css(styles);
                        // add zoom class
                        $(this).addClass('wf-zoom-image');
                    } else {
                        $('<span class="wf-icon-zoom-link" />').html(function () {
                            return MediaBox.getSVGIcon('link');
                        }).appendTo(this).find('svg').css('fill', $(this).css('color'));
                    }
                }

                // Add click event to link
                $(this).on('click', function (e) {
                    e.preventDefault();

                    // update the src attribute value, this allows it to be changed dynamically by javsacript
                    o.src = this.getAttribute('href');

                    // set as lightbox activator
                    self.activator = this;

                    return self.start(o, i);
                });
            });

            self.auto();
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
            var i, x = 0,
                o = {};

            if (typeof data === "string") {
                $.extend(o, {
                    'src': data,
                    'title': title,
                    'group': group,
                    'type': type,
                    'params': params || {}
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
            var self = this,
                n = 0,
                items = [],
                len;

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

                var overlayDuration = $('.wf-mediabox-overlay').css('transition-duration');
                overlayDuration = (parseFloat(overlayDuration) * 1000) || 300;

                window.setTimeout(function () {
                    return self.show(items, n);
                }, overlayDuration);

                return true;
            }
        },
        /**
         * Build Popup structure
         */
        build: function () {
            var self = this,
                s = this.settings;

            if ($('.wf-mediabox').length === 0) {
                // Create main page object
                var $page = $('<div class="wf-mediabox" role="dialog" aria-modal="true" aria-labelledby="" aria-describedby="" tabindex="-1" />').appendTo('body');

                // add the tranistion class
                $page.addClass('wf-mediabox-overlay-transition');

                // add ie6 identifier
                if (MediaBox.Env.ie6) {
                    $page.addClass('ie6');
                }

                // add ios identifier
                if (MediaBox.Env.iOS) {
                    $page.addClass('ios');
                }

                // Create overlay
                if (s.overlay === 1) {
                    $('<div class="wf-mediabox-overlay" tabindex="-1" />').appendTo($page).css('background-color', s.overlay_color);
                }

                // Create Frame and body with theme content
                $page.append('<div class="wf-mediabox-frame" role="document" tabindex="-1"><div class="wf-mediabox-loader" role="status" aria-label="' + this.translate('loading') + '" tabindex="-1"></div><div class="wf-mediabox-body" aria-hidden="true" tabindex="-1" /></div>');

                // add theme class to page
                $page.addClass('wf-mediabox-theme-' + s.theme);

                // add theme data
                MediaBox.Addons.Theme.parse(s.theme, function (s) {
                    return self.translate(s);
                }, '.wf-mediabox-body');

                // hide all objects
                $('.wf-mediabox-frame').children().hide();

                // add iPad scroll fix
                if (MediaBox.Env.iOS) {
                    $('.wf-mediabox-content').css({ 'webkitOverflowScrolling': 'touch', 'overflow': 'auto' });
                }

                // Add close function to frame on click
                if (s.close === 2) {
                    $('.wf-mediabox-frame').on('click', function (e) {
                        if (e.target && e.target === this) {
                            self.close();
                        }
                    });
                }

                // Setup Close link and Cancel link event
                $('.wf-mediabox-close, .wf-mediabox-cancel').on('click', function (e) {
                    e.preventDefault();
                    self.close();
                }).attr('tabindex', 0).attr('svg-icon', function (i, val) {
                    if (val) {
                        $(this).append(MediaBox.getSVGIcon(val));
                    }
                });

                // Setup Next link event
                $('.wf-mediabox-next').on('click', function (e) {
                    e.preventDefault();
                    self.nextItem();
                }).attr('tabindex', 0).attr('svg-icon', function (i, val) {
                    if (val) {
                        $(this).append(MediaBox.getSVGIcon(val));
                    }
                });

                // Setup Previous link event
                $('.wf-mediabox-prev').on('click', function (e) {
                    e.preventDefault();
                    self.previousItem();
                }).attr('tabindex', 0).attr('svg-icon', function (i, val) {
                    if (val) {
                        $(this).append(MediaBox.getSVGIcon(val));
                    }
                });

                // store html
                $('.wf-mediabox-numbers').data('html', $('.wf-mediabox-numbers').html()).attr('aria-hidden', true);

                // add transition class
                $page.addClass('wf-mediabox-open');

                // update opacity
                $('.wf-mediabox-overlay').css('opacity', s.overlayopacity || 0.8);
            }

            return true;
        },
        /**
         * Show the popup window
         * @param {Array} items Array of popup objects
         * @param {Int} n Index of current popup
         */
        show: function (items, n) {
            var top = 0,
                s = this.settings;

            this.items = items;
            this.bind(true);

            // Show popup
            $('.wf-mediabox-body').show();

            // Fade in overlay
            if (s.overlay === 1 && $('.wf-mediabox-overlay').length && s.overlay_opacity) {
                $('.wf-mediabox-overlay').css('opacity', 0).animate({
                    'opacity': parseFloat(s.overlay_opacity)
                }, s.transition_speed);
            }

            $('.wf-mediabox').addClass('wf-mediabox-transition-scale');

            return this.change(n);
        },
        /**
         * Create event / key bindings
         * @param {Boolean} open Whether popup is opened or closed
         */

        bind: function (open) {
            var self = this,
                s = this.settings;

            if (open) {
                $(document).on('keydown.wf-mediabox', function (e) {
                    self.addListener(e);
                });

                var xDown, yDown;

                // touch events
                $('.wf-mediabox-body').on('touchstart', function (e) {
                    // single finger swipe only
                    if (e.originalEvent.touches.length !== 1 || self.items.length === 1) {
                        return;
                    }

                    xDown = e.originalEvent.touches[0].clientX;
                    yDown = e.originalEvent.touches[0].clientY;

                }).on('touchmove', function (e) {
                    if (!xDown || !yDown) {
                        return;
                    }
                    // single finger swipe only
                    if (e.originalEvent.touches.length !== 1 || self.items.length === 1) {
                        return;
                    }

                    var xUp = e.originalEvent.touches[0].clientX;
                    var yUp = e.originalEvent.touches[0].clientY;

                    var xDiff = xDown - xUp;
                    var yDiff = yDown - yUp;

                    if (Math.abs(xDiff) > Math.abs(yDiff)) {
                        /*most significant*/
                        if (xDiff > 0) {
                            self.nextItem();
                        } else {
                            self.previousItem();
                        }

                        e.preventDefault();
                    }
                    /* reset values */
                    xDown = null;
                    yDown = null;
                });

            } else {
                $(document).off('keydown.wf-mediabox');

                // remove events
                $('.wf-mediabox').off('keydown.wf-mediabox');
            }

            var resize = MediaBox.Tools.debounce(function () {
                // get existing width
                var popup = self.items[self.index];

                if (!popup) {
                    return;
                }

                self.updateBodyWidth(popup);

            }, 300);

            $(window).on('resize.wf-mediabox, orientationchange.wf-mediabox', resize);

            // slideshow
            if (s.autoplay) {
                autoplayInterval = setInterval(function () {
                    if (self.nextItem() === false) {
                        clearInterval(autoplayInterval);
                    }
                }, s.autoplay * 1000);
            }
        },

        updateBodyWidth: function (popup) {
            var w, h, ratio, m = 0, ww = $(window).width(), wh = $(window).height();

            var fw = $('.wf-mediabox-frame').width();
            var fh = $('.wf-mediabox-frame').height();

            if (this.settings.scrolling === "scroll") {
                var framePaddingLeft = $('.wf-mediabox-frame').css('padding-left'), framePaddingTop = $('.wf-mediabox-frame').css('padding-top');

                fw = ww - parseInt(framePaddingLeft) * 2;
                fh = wh - parseInt(framePaddingTop) * 2;
            }

            w = MediaBox.Tools.parseWidth(popup.width);
            h = MediaBox.Tools.parseHeight(popup.height || fh);

            if ($('.wf-mediabox-content').hasClass('wf-mediabox-content-ratio-flex')) {
                // get size of border padding and info box
                //var modw = $('.wf-mediabox-body').width() - $('.wf-mediabox-content').width();
                var modh = $('.wf-mediabox-body').height() - $('.wf-mediabox-content').height();

                /*
                // remove from frame width
                w = w - modw;
                // remove from frame height
                h = h - modh;

                // get proportional percentage
                var pct = Math.floor(h / w * 100);*/

                // clamp height
                h = Math.min(h, fh);

                // border padding + info box + frame padding
                modh = modh + (wh - h);

                //$('.wf-mediabox-content-item').css('padding-bottom', pct + '%');
                $('.wf-mediabox-content-item').css('height', 'calc(100vh - ' + modh + 'px)');
            }

            // clamp window height and width (iPhone 6 375px - 20px)
            //fh = Math.max(fh, 355);
            //fw = Math.max(fw, 355);

            var dim = MediaBox.Tools.resize(w, h, fw, fh), bw = dim.width;

            // set the width as calculated
            $('.wf-mediabox-body').css('max-width', bw);

            // get the resultant height
            var bh = $('.wf-mediabox-body').height();

            // find ratio
            if (fw > fh) {
                ratio = (bw / bh).toFixed(1);
            } else {
                ratio = (bh / bw).toFixed(1);
            }

            if (bh > fh) {
                bw = ratio * (fh - 16);
                $('.wf-mediabox-body').css('max-width', bw);
            }

            /*while(bh > fh) {
                bw = Math.max(260, bw - 16);
                bh = ratio * bw;
            }
            
            // set the body width
            $('.wf-mediabox-body').css('max-width', bw);

            var bh = $('.wf-mediabox-body').height();

            while (bh > fh) {
                bw = Math.max(355, bw - 16);

                if (bw < dim.width / 2) {
                    break;
                }
                
                // set the body width
                $('.wf-mediabox-body').css('max-width', Math.floor(bw));

                // ... and update the resultant height value
                bh = $('.wf-mediabox-body').height();
            }*/
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
            var self = this;

            // Optional element
            var changed = false;

            var callback = function () {
                if (!changed) {
                    changed = true;

                    $('.wf-mediabox-body').removeClass('wf-mediabox-transition');

                    return self.change(n);
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

            //$('.wf-mediabox').addClass('wf-mediabox-transition-slide-in');

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

            //$('.wf-mediabox').addClass('wf-mediabox-transition-slide-out');

            return this.queue(n);
        },
        /**
         * Set the popup information (caption, title, numbers)
         */
        info: function () {
            var popup = this.items[this.index];

            // remove existing focus
            $('.wf-mediabox-focus').removeClass('wf-mediabox-focus');

            // download
            // remove existing
            $('a[download]', '.wf-mediabox-content').remove();

            if (popup.params.download) {
                $('<a href="' + popup.src + '" target="_blank" download>' + this.translate('download') + '</a>').appendTo('.wf-mediabox-content');
            }

            // Optional Element Caption/Title

            if ($('.wf-mediabox-caption').length) {
                var title = popup.title || '',
                    text = popup.caption || '',
                    h = '';

                var ex = /([-!#$%&\'\*\+\\./0-9=?A-Z^_`a-z{|}~]+@[-!#$%&\'\*\+\\/0-9=?A-Z^_`a-z{|}~]+\.[-!#$%&\'*+\\./0-9=?A-Z^_`a-z{|}~]+)/gi;
                var ux = '((news|telnet|nttp|file|http|ftp|https)://[-!#$%&\'\*\+\\/0-9=?A-Z^_`a-z{|}~]+\.[-!#$%&\'\*\+\\./0-9=?A-Z^_`a-z{|}~]+)';

                // simple URL matching without any concern for correct syntax, eg: http://something_not_a_space
                var ux = /([a-zA-Z]{3,9}:\/\/[^\s]+)/gi;

                function processRe(h) {
                    h = h.replace(ex, '<a href="mailto:$1" target="_blank">$1</a>');
                    h = h.replace(ux, '<a href="$1" target="_blank">$1</a>');

                    return h;
                }

                // decode title
                title = MediaBox.Entities.decode(title);
                // decode text
                text = MediaBox.Entities.decode(text);

                // get title / caption from popup title
                if (title.indexOf('::') !== -1) {
                    var parts = title.split('::');
                    title = $.trim(parts[0]);
                    text = $.trim(parts[1]);
                }

                if (title) {
                    h += '<h4 id="wf-mediabox-modal-title">' + title + '</h4>';
                    // update aria-labelledby 
                    $('.wf-mediabox').attr('aria-labelledby', 'wf-mediabox-modal-title');
                }

                if (text) {
                    h += '<p id="wf-mediabox-modal-description">' + text + '</p>';
                    // update aria-describedby
                    $('.wf-mediabox').attr('aria-describedby', 'wf-mediabox-modal-description');
                }

                // set caption html (may be empty)
                $('.wf-mediabox-caption').html(h).addClass('wf-mediabox-caption-hidden');

                if (h) {
                    // Process e-mail and urls
                    $('.wf-mediabox-caption').find(':not(a)').each(function () {
                        var s = $(this).html();

                        // contains a link but is not already html
                        if (s && /(@|:\/\/)/.test(s) && s.indexOf('<') === -1) {
                            if (s = processRe(s)) {
                                $(this).replaceWith(s);
                            }
                        }
                    });
                }
            }

            // Optional Element
            var self = this,
                len = this.items.length;

            if ($('.wf-mediabox-numbers').length && len > 1) {
                var html = $('.wf-mediabox-numbers').data('html') || "{{numbers}}";

                if (html.indexOf('{{numbers}}') !== -1) {
                    $('.wf-mediabox-numbers').empty().append('<ol />');

                    for (var i = 0; i < len; i++) {
                        var n = i + 1;

                        var title = this.items[i].title || n;

                        // Create Numbers link
                        var link = $('<button aria-label="' + title + '" tabindex="0" class="wf-mediabox-number" />').html(n);

                        if (this.index === i) {
                            $(link).addClass('active');
                        }

                        $('<li />').append(link).appendTo($('ol', '.wf-mediabox-numbers'));

                        // add click event
                        $(link).on('click', function (e) {
                            var x = parseInt(e.target.innerHTML) - 1;

                            if (self.index == x) {
                                return false;
                            }

                            return self.queue(x);
                        });
                    }
                }

                if (html.indexOf('{{current}}') !== -1) {
                    $('.wf-mediabox-numbers').html(html.replace('{{current}}', this.index + 1).replace('{{total}}', len));
                }

                $('.wf-mediabox-numbers').attr('aria-hidden', false);
            } else {
                $('.wf-mediabox-numbers').empty().attr('aria-hidden', true);
            }

            // show info
            $('.wf-mediabox-info-top, .wf-mediabox-info-bottom').show(); //.children().show();

            // Show / Hide Previous and Next buttons
            $('.wf-mediabox-next, .wf-mediabox-prev').hide().attr('aria-hidden', true);

            if (len > 1) {
                if (this.index > 0) {
                    $('.wf-mediabox-prev').show().attr('aria-hidden', false).addClass('wf-mediabox-focus');
                } else {
                    $('.wf-mediabox-prev').hide().attr('aria-hidden', true);
                }
                if (this.index < len - 1) {
                    $('.wf-mediabox-next').show().attr('aria-hidden', false).addClass('wf-mediabox-focus');
                } else {
                    $('.wf-mediabox-next').hide().attr('aria-hidden', true);
                }
            } else {
                // add focus to close button
                $('.wf-mediabox-close').addClass('wf-mediabox-focus');
            }
        },
        /**
         * Change the popup
         * @param {Integer} n Popup number
         */
        change: function (n) {
            var self = this,
                s = this.settings;

            var p = {},
                popup, w, h;

            if (n < 0 || n >= this.items.length) {
                return false;
            }

            //$('.wf-mediabox.wf-mediabox-transition-slide-out').removeClass('wf-mediabox-transition-slide-out').addClass('wf-mediabox-transition-slide-in');

            // set current popup index
            this.index = n;

            // Show Container, Loader, Cancel
            $('.wf-mediabox-container, .wf-mediabox-cancel').show();

            // set loader
            $('.wf-mediabox').addClass('wf-mediabox-loading').find('.wf-mediabox-loader').attr('aria-hidden', false);

            // get current popup item
            popup = this.items[n];

            var type = "error";
            var html = "";

            // get plugin for this media type
            var plugin = MediaBox.Addons.Plugin.getPlugin(popup);

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
            $('.wf-mediabox-content').attr('class', 'wf-mediabox-content').addClass('wf-mediabox-content-' + type).css('height', '');

            // pass through plugin html to popup
            popup.html = html;

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

            if (MediaBox.Env.ie) {
                $('.wf-mediabox-content img').css('-ms-interpolation-mode', 'bicubic');
            }

            var tabIndex = 0;

            $('.wf-mediabox').on('keydown.wf-mediabox', function (e) {
                // only TAB
                if (e.keyCode !== 9) {
                    return;
                }

                // prevent tabbing outside the lightbox
                e.preventDefault();

                // get all visible, tabbable items
                var $items = $('.wf-mediabox').find('[tabindex]:visible').filter(function () {
                    return parseInt(this.getAttribute('tabindex')) >= 0;
                });

                // get index of the currently focused item
                $items.each(function (i) {
                    if ($(this).hasClass('wf-mediabox-focus')) {
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
                if (tabIndex === $items.length) {
                    tabIndex = 0
                }

                $items.removeClass('wf-mediabox-focus');

                // focus the nth item
                $items.eq(tabIndex).focus().addClass('wf-mediabox-focus');
            });

            // Animate box
            return this.animate();
        },

        /**
         * Animate the Popup
         */
        animate: function () {
            var self = this,
                s = this.settings;

            // current popup
            var popup = this.items[this.index];

            var cw = popup.width || 0;
            var ch = popup.height || 0;

            $('.wf-mediabox-content').removeClass('wf-mediabox-broken-image wf-mediabox-broken-media');
            $('.wf-mediabox-content .wf-icon-404').removeClass('wf-icon-404').find('svg').remove();

            $('.wf-mediabox-caption').removeClass('wf-mediabox-caption-hidden');

            // constrain width for ajax loading
            if ($('.wf-mediabox-content').hasClass('wf-mediabox-content-ajax')) {
                $('.wf-mediabox-body').css('max-width', 640);
            }

            // create loader cache
            var $cache = $('<div class="wf-mediabox-cache" />');

            if (popup.type == 'iframe' || popup.type == 'ajax') {
                $('.wf-mediabox-content-item').html(popup.html);
            } else {
                $cache.html(popup.html).appendTo('.wf-mediabox');
            }

            function itemLoaded() {
                // remove loader cache
                $cache.empty().remove();

                // append media element to popup content if it isn't an iframe (iframe will reload if appended)
                if (this.nodeName !== "IFRAME") {
                    $('.wf-mediabox-content-item').html(popup.html);
                }

                // update loader
                $('.wf-mediabox').removeClass('wf-mediabox-loading').find('.wf-mediabox-loading').attr('aria-hidden', true);

                // remove padding
                $('.wf-mediabox-content-item').css('padding-bottom', '');

                // trigger display
                $('.wf-mediabox').addClass('wf-mediabox-show');

                // Show Information
                $('.wf-mediabox-info-top, .wf-mediabox-info-bottom').addClass('wf-info-show');

                if (this.nodeName === "IMG") {
                    // use passed in width or the images actual width, whichever is less
                    cw = cw || this.naturalWidth || this.width;
                    ch = ch || this.naturalHeight || this.height;

                    // parse to integer value
                    cw = MediaBox.Tools.parseWidth(cw);
                    ch = MediaBox.Tools.parseWidth(ch);

                    // add box padding if any
                    //cw = cw + ($('.wf-mediabox-body').width() - $('.wf-mediabox-content').width());

                    // store width
                    popup.width = cw;
                    // store height
                    popup.height = ch;
                } else {
                    if (this.nodeName === "VIDEO") {
                        cw = cw || this.videoWidth || 0;
                        ch = ch || this.videoHeight || 0;
                    }

                    // a default width
                    cw = cw || 640;

                    // check for 4:3 aspect ratio, otherwise assume 16:9
                    if (cw && ch) {
                        // process passed in values
                        var w = MediaBox.Tools.parseWidth(cw);
                        var h = MediaBox.Tools.parseHeight(ch);

                        var ratio = parseFloat((h / w).toFixed(2));

                        // force 16:9 ratio for video
                        if ($(this).is('.wf-mediabox-iframe-video, .wf-mediabox-video, .wf-mediabox-audio')) {
                            ratio = 0.56;
                        }

                        if (ratio === 0.75) {
                            $('.wf-mediabox-content').addClass('wf-mediabox-content-ratio-4by3');
                        } else if (ratio !== 0.56) {
                            $('.wf-mediabox-content').addClass('wf-mediabox-content-ratio-flex');
                        }

                        // store height
                        //popup.height = ch;
                    }

                    $('.wf-mediabox-content-item').addClass('wf-mediabox-content-ratio');

                    // store width
                    popup.width = cw;
                }

                // update popup width
                self.updateBodyWidth(popup);

                // Changes if scroll popup
                if (s.scrolling === 'scroll') {
                    $('body').addClass('wf-mediabox-scrolling');

                    // scroll to popup body
                    scrollIntoView('.wf-mediabox-body');
                }

                $('.wf-mediabox-body').addClass('wf-mediabox-transition').attr('aria-hidden', false);

                // focus item
                $('.wf-mediabox-focus').focus();

                // focus iframe window
                if (this.nodeName === 'IFRAME') {
                    var ifr = this;

                    setTimeout(function () {
                        ifr.contentWindow.focus();
                    }, 10);
                }

                // force autoplay in IE11
                if (this.nodeName === 'VIDEO' || this.nodeName === 'AUDIO') {                    
                    if (MediaBox.Env.ie && this.autoplay) {
                        this.play();
                    }
                }

                // trigger custom load event
                $(this).trigger('mediabox:load');
            }

            function itemError() {
                var n = this;

                // remove loader cache
                $cache.empty().remove();

                $('.wf-mediabox').removeClass('wf-mediabox-loading');

                $('.wf-mediabox-content').addClass(function () {
                    if (n.nodeName === "IMG") {
                        return "wf-mediabox-broken-image";
                    }

                    return "wf-mediabox-broken-media";
                });

                $('.wf-mediabox-body').addClass('wf-mediabox-transition').css('max-width', '').attr('aria-hidden', false);

                $('.wf-mediabox').addClass('wf-mediabox-show');

                $('.wf-mediabox-content > div').addClass('wf-icon-404').html(function () {
                    return MediaBox.getSVGIcon('404');
                });
            }

            $('img, video, audio, object, embed', $cache).add('iframe', '.wf-mediabox-content').one('load loadedmetadata', function (e) {
                var node = this;

                setTimeout(function () {
                    itemLoaded.apply(node);
                }, 300);

            }).on('error', itemError);

            //$('.wf-mediabox.wf-mediabox-transition-slide-in').removeClass('wf-mediabox-transition-slide-in').addClass('wf-mediabox-transition-slide-out');
        },
        /**
         * Close the popup window. Destroy all objects
         */
        close: function (keepopen) {
            var self = this;

            var transitionDuration = $('.wf-mediabox-container').css('transition-duration');
            transitionDuration = (parseFloat(transitionDuration) * 1000) || 300;

            //$('.wf-mediabox').removeClass('wf-mediabox-transition-slide-in, wf-mediabox-transition-slide-out').addClass('wf-mediabox-transition-scale');

            // Destroy objects after delay
            $('.wf-mediabox-body').removeClass('wf-mediabox-transition');

            var transitionTimer = setTimeout(function () {
                // remove iframe src
                $('iframe, video', '.wf-mediabox-content-item').attr('src', '');

                $('.wf-mediabox-content-item').empty();
                clearTimeout(transitionTimer);

                if (!keepopen) {
                    // remove events
                    self.bind(false);

                    // hide info divs
                    $('.wf-mediabox-info-bottom, .wf-mediabox-info-top').hide();

                    $('.wf-mediabox-frame').remove();

                    var overlayDuration = $('.wf-mediabox-overlay').css('transition-duration');
                    overlayDuration = (parseFloat(overlayDuration) * 1000) || 300;

                    $('.wf-mediabox').removeClass('wf-mediabox-open wf-mediabox-show');

                    // sert overlay opacity
                    $('.wf-mediabox-overlay').css('opacity', 0);

                    var overlayTimer = setTimeout(function () {
                        $('.wf-mediabox').remove();

                        $('body').removeClass('wf-mediabox-scrolling');

                        clearTimeout(overlayTimer);
                    }, overlayDuration);

                    // restore focus to the activator
                    if (self.activator) {
                        $(self.activator).focus();
                    }
                }

            }, transitionDuration);

            // Hide closelink
            $('.wf-mediabox-close').hide();

            window.clearInterval(autoplayInterval);

            return false;
        }
    };

    // Export MediaBox as WFMediaBox/jcepopup in global namespace
    window.WfMediabox = window.jcepopup = MediaBox;

})(jQuery);