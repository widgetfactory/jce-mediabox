/**
 * JCEMediaBox Addons 	@@version@@
 * @package             JCEMediaBox
 * @url			http://www.joomlacontenteditor.net
 * @copyright           @@copyright@@
 * @license 		@@licence@@
 * @date		@@date@@
 * This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 *
 */

/* global jQuery, WfMediabox */

(function ($, WfMediabox) {
    function stripHtml(html) {
        let tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    }

    function isBool(attr) {
        var map = ['async', 'checked', 'compact', 'declare', 'defer', 'disabled', 'ismap', 'multiple', 'nohref', 'noresize', 'noshade', 'nowrap', 'readonly', 'selected', 'autoplay', 'loop', 'controls', 'itemscope', 'playsinline', 'contenteditable', 'spellcheck', 'contextmenu', 'draggable', 'hidden'];
        return $.inArray(attr, map) !== -1;
    }

    function islocal(s) {
        if (/^([a-z]+)?:\/\//.test(s)) {
            return new RegExp('(' + WfMediabox.site + ')').test(s);
        }

        return true;
    }

    function basename(path) {
        return path.replace(/^.*[\/\\]/g, '');
    }

    function appendTimestampToUrl(url) {
        var timestamp = Date.now();
        var separator = url.includes('?') ? '&' : '?';

        return url + separator + 'ts=' + timestamp;
    }

    /**
     * ---------------------------------------------------------------------
     * parseURL
     * ---------------------------------------------------------------------
     * Parse a URL string into component parts using the native URL API.
     *
     * @param   {string}  url   The URL string to parse. May be absolute or relative.
     * @returns {Object}         An object with the following keys:
     *                           {
     *                             protocol : string,   // eg. "https"
     *                             userInfo : string,   // eg. "user:pass"
     *                             hostname : string,   // eg. "example.com"
     *                             port     : string,   // eg. "8080"
     *                             pathname : string,   // eg. "/path/to/file"
     *                             query    : string,   // eg. "a=1&b=2"
     *                             anchor   : string    // eg. "section"
     *                           }
     *
     * Notes:
     * - Automatically resolves relative URLs against WfMediabox.site or window.location.href.
     * - Handles protocol-relative URLs (starting with //).
     * - Returns empty strings for invalid URLs.
     * ---------------------------------------------------------------------
     */
    function parseURL(url) {
        var href = String(url || '');
        var base = WfMediabox.site;

        // Handle protocol-relative URLs (eg. //example.com/path)
        if (/^\/\//.test(href)) {
            var proto = (typeof window !== 'undefined' && window.location && window.location.protocol)
                ? window.location.protocol
                : 'https:';
            href = proto + href;
        }

        var out = {
            protocol: '',
            userInfo: '',
            hostname: '',
            port: '',
            pathname: '',
            query: '',
            anchor: ''
        };

        try {
            // Use base for relative URLs, otherwise parse directly
            var u = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(href) ? new URL(href) : new URL(href, base);

            // Protocol (remove trailing colon)
            out.protocol = u.protocol.replace(/:$/, '');

            // Compose userInfo from username[:password]
            var ui = u.username || '';
            if (u.password) {
                ui += (ui ? ':' : '') + u.password;
            }
            out.userInfo = ui;

            // Hostname, port, pathname
            out.hostname = u.hostname;
            out.port = u.port;
            out.pathname = u.pathname || '';

            // Query and anchor without ? or #
            out.query = u.search ? u.search.slice(1) : '';
            out.anchor = u.hash ? u.hash.slice(1) : '';
        }
        catch (e) {
            // Invalid URL → return defaults (empty strings)
        }

        return out;
    }

    /**
     * ---------------------------------------------------------------------
     * buildURL
     * ---------------------------------------------------------------------
     * Reconstruct a full URL string from the component parts created by parseURL().
     *
     * @param   {Object}  o  URL parts object, eg. { protocol, userInfo, hostname, port, pathname, query, anchor }
     * @returns {string}     A complete, properly formatted URL.
     *
     * Notes:
     * - Automatically inserts // after the protocol if hostname or userInfo is present.
     * - Avoids duplicate ports when o.host already includes it.
     * ---------------------------------------------------------------------
     */
    function buildURL(o) {
        o = o || {};
        var url = '';

        // Protocol
        if (o.protocol) {
            url += o.protocol + ':';
        }

        // Add authority section (//...)
        var haveAuthority = o.hostname || o.host || o.userInfo || o.port;

        if (haveAuthority) {
            url += '//';
        }

        // User info (username[:password]@)
        if (o.userInfo) {
            url += o.userInfo + '@';
        }

        // Hostname (or host)
        var authorityHost = o.hostname || o.host || '';

        url += authorityHost;

        // Port (only if not already part of host)
        if (o.port && o.hostname) {
            url += ':' + o.port;
        }

        // Path
        if (o.pathname) {
            url += o.pathname;
        }

        // Query
        if (o.query) {
            url += '?' + o.query;
        }

        // Anchor
        if (o.anchor) {
            url += '#' + o.anchor;
        }

        return url;
    }

    function createComponentURL(src) {
        if (!WfMediabox.settings.convert_local_url) {
            return src;
        }

        var uri = parseURL(src);

        if (islocal(src)) {
            if (!uri.query) {
                uri.query = 'tmpl=component';
            } else if (uri.query.indexOf('tmpl') == -1) {
                uri.query += '&tmpl=component';
            }
        }

        // rebuild src
        src = buildURL(uri);

        return src;
    }

    function createObject(data, embed) {
        delete data.group;
        delete data.title;
        delete data.caption;
        delete data.width;
        delete data.height;

        var attribs = ['id', 'name', 'style', 'codebase', 'classid', 'type', 'data'];

        var html = '<object class="wf-mediabox-focus"';
        // custom attributes
        for (var n in data) {
            if (attribs.indexOf(n) !== -1 && typeof data[n] === "string") {
                html += ' ' + n + '="' + decodeURIComponent(data[n]) + '"';

                delete data[n];
            }
        }

        html += '>';

        // custom params
        for (var n in data) {
            if (typeof data[n] === "string") {
                html += ' <param name="' + n + '" value="' + decodeURIComponent(data[n]) + '" />';
            }
        }

        if (embed) {
            html += '<embed';
            for (var n in data) {
                if (typeof data[n] === "string") {
                    html += ' ' + n + '="' + decodeURIComponent(data[n]) + '"';
                }
            }

            html += '></embed>';
        }
        html += '</object>';

        return html;
    }

    function createIframe(src, attribs) {
        // create html
        return '<iframe src="' + src + '" frameborder="0" scrolling="0" allowfullscreen="allowfullscreen" />';
    }

    WfMediabox.Plugin.add('flash', function () {
        this.type = "object";
        this.html = function (data) {
            data.type = "application/x-shockwave-flash";
            data.data = data.src;

            return $(createObject(data, true));
        };

        this.is = function (data) {
            return /\.swf\b/.test(data.src);
        };
    });

    /**
     * HTML5 Video
     */
    WfMediabox.Plugin.add('video', function () {
        this.type = "video";

        // create image html (leave src blank)
        this.html = function (data) {
            var attribs = ['class="wf-mediabox-video wf-mediabox-focus"'],
                n;

            var params = data.params || {};

            for (n in params) {
                if (isBool(n)) {
                    attribs.push(n);
                } else {
                    attribs.push(n + '="' + params[n] + '"');
                }
            }

            if (!params.autoplay) {
                attribs.push('controls');
            }

            if (WfMediabox.Env.mobile) {
                attribs.push('playsinline');
            }

            var ext = data.src.split('.').pop();
            var type = WfMediabox.Mimetype.guess(ext) || 'video/mpeg';

            var video = $('<video ' + attribs.join(' ') + ' tabindex="0" />').on('loadedmetadata', function (e) {
                $(this).attr({ 'width': this.videoWidth || '', 'height': this.videoHeight || '' });
            }).attr({
                'src': data.src,
                'type': type
            });

            //.append('<source src="' + data.src + '" type="' + type + '" />');

            return video;
        };

        this.is = function (data) {
            var src = data.src;

            // remove query to test extension
            src = src.split('?')[0];

            return (/video\/(mp4|mpeg|webm|ogg)/.test(data.type) || /\.(mp4|webm|ogg)\b/.test(src)) && WfMediabox.Env.video;
        };
    });

    /**
     * HTML5 Audio
     */
    WfMediabox.Plugin.add('audio', function () {
        this.type = "audio";

        // create image html (leave src blank)
        this.html = function (data) {
            var attribs = ['src="' + data.src + '"', 'class="wf-mediabox-audio wf-mediabox-focus"'],
                n;

            var params = data.params || {};

            for (n in params) {
                if (isBool(n)) {
                    attribs.push(n);
                } else {
                    attribs.push(n + '="' + params[n] + '"');
                }
            }

            if (!params.autoplay) {
                attribs.push('controls');
            }

            return $('<audio ' + attribs.join(' ') + ' tabindex="0" />');
        };

        this.is = function (data) {
            var src = data.src;

            // remove query to test extension
            src = src.split('?')[0];

            return (/audio\/(mp3|mpeg|oga|x-wav)/.test(data.type) || /\.(mp3|oga|wav|m4a)\b/.test(src)) && WfMediabox.Env.audio;
        };
    });

    /**
     * Daily Motion - http://www.dailymotion.com
     * @param {String} v URL
     */
    WfMediabox.Plugin.add('dailymotion', function () {
        this.is = function (data) {
            return /dai\.?ly(motion)/.test(data.src);
        };

        function processURL(s) {
            var u = 'https://dailymotion.com/embed/video/';

            var m = s.match(/dai\.?ly(motion)?(.+)?\/(swf|video)?\/?([a-z0-9]+)_?/);

            if (m) {
                u += m[4];
            }

            return u;
        }

        this.width = 480;

        // declare type
        this.type = "iframe";
        // create html
        this.html = function (data) {
            var ifr = $(createIframe(processURL(data.src)));

            // identify as a video to force aspect ratio
            $(ifr).addClass('wf-mediabox-iframe-video');

            return ifr;
        };
    });
    WfMediabox.Plugin.add('quicktime', function () {
        this.html = function (data) {
            data.type = "video/quicktime";
            data.classid = "clsid:02bf25d5-8c17-4b23-bc80-d3488abddc6b";
            data.codebase = "https://www.apple.com/qtactivex/qtplugin.cab#version=6,0,2,0";

            return $(createObject(data));
        };

        this.type = "object";
        this.width = 853;

        this.is = function (data) {
            return /\.(mov)\b/.test(data.src);
        };
    });
    WfMediabox.Plugin.add('windowsmedia', function () {

        this.type = "object";
        this.html = function (data) {
            data.type = "application/x-mplayer2";
            data.classid = "clsid:6bf52a52-394a-11d3-b153-00c04f79faa6";
            data.codebase = "https://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=5,1,52,701";

            return $(createObject(data, true));
        };

        this.is = function (data) {
            return /\.(wmv|avi)\b/.test(data.src);
        };
    });
    /**
     * Youtube - http://www.youtube.com
     * @param {String} v URL
     */
    WfMediabox.Plugin.add('youtube', function () {
        var props = ['autoplay', 'cc_lang_pref', 'cc_load_policy', 'color', 'controls', 'disablekb', 'enablejsapi', 'end', 'fs', 'hl', 'iv_load_policy', 'list', 'listType', 'loop', 'modestbranding', 'origin', 'playlist', 'playsinline', 'rel', 'start', 'widget_referrer'];

        this.is = function (data) {
            return /youtu(\.)?be([^\/]+)?\/(.+)/.test(data.src);
        };

        function processURL(v) {
            v = v.replace(/youtu(\.)?be([^\/]+)?\/(.+)/, function (a, b, c, d) {
                d = d.replace(/(watch\?v=|v\/|embed\/|live\/)/, '');

                if (b && !c) {
                    c = '.com';
                }

                // replace first ampersand with question mark
                if (d.indexOf('?') === -1) {
                    d = d.replace(/&/, '?');
                }

                // convert "t" key to "start" if it exists, removing the "s" unit if present
                d = d.replace(/([?&])t=([0-9]+)(s)?/, function (match, prefix, value) {
                    return prefix + 'start=' + value;
                });

                return 'youtube' + c + '/embed/' + d;
            });

            // add www (required by iOS ??)
            v = v.replace(/\/\/youtube/i, '//www.youtube');

            // force ssl
            v = v.replace(/^http:\/\//, 'https://');

            return v;
        }

        // default 16:9 size
        this.width = 560;

        // declare type
        this.type = "iframe";

        // create html
        this.html = function (data) {
            var src = processURL(data.src), ifr = $(createIframe(src));

            if (data.params) {
                var allow = ['accelerometer', 'encrypted-media', 'gyroscope', 'picture-in-picture', 'allowfullscreen'];

                var params = {};

                $.each(data.params, function (key, value) {
                    if (key.indexOf('youtube-') !== -1) {
                        key = key.replace('youtube-', '');
                    }

                    if ($.inArray(key, props) !== -1) {
                        params[key] = value;

                        if (key == 'autoplay' && !!value) {
                            allow.push(key);

                            // add mute
                            params.mute = 1;
                        }
                    }
                });

                if (allow.length) {
                    $(ifr).attr('allow', allow.join(';'));
                }

                params = $.param(params);

                if (params) {
                    if (src.indexOf('?') !== -1) {
                        src += '&' + params;
                    } else {
                        src += '?' + params;
                    }

                    $(ifr).attr('src', src);
                }
            }
            // identify as a video to force aspect ratio
            $(ifr).addClass('wf-mediabox-iframe-video');

            return ifr;
        };
    });

    WfMediabox.Plugin.add('vimeo', function () {

        this.is = function (data) {
            return /vimeo\.com\/(\w+\/)?(\w+\/)?([0-9]+)/.test(data.src);
        };

        function processURL(s) {
            if (s.indexOf('player.vimeo.com/video/') == -1) {
                s = s.replace(/vimeo\.com\/(?:\w+\/){0,3}((?:[0-9]+\b)(?:\/[a-z0-9]+)?)/, function (match, value) {
                    var hash = '', params = value.split('/'), id = params[0];

                    if (params.length == 2) {
                        hash = params[1];
                    }

                    return 'player.vimeo.com/video/' + id + (hash ? '?h=' + hash : '');
                });
            }

            // force ssl
            s = s.replace(/^http:\/\//, 'https://');

            return s;
        }

        this.width = 500;

        // declare type
        this.type = "iframe";

        // create html
        this.html = function (data) {
            var src = processURL(data.src), ifr = $(createIframe(src));

            // identify as a video to force aspect ratio
            $(ifr).addClass('wf-mediabox-iframe-video');

            if (data.params) {
                var params = {};

                $.each(data.params, function (key, value) {
                    if (key.indexOf('vimeo-') !== -1) {
                        key = key.replace('vimeo-', '');
                        params[key] = value;
                    }
                });

                params = $.param(params);

                if (params) {
                    if (src.indexOf('?') !== -1) {
                        src += '&' + params;
                    } else {
                        src += '?' + params;
                    }

                    $(ifr).attr('src', src);
                }
            }

            return ifr;
        };
    });

    $('.wf-mediabox').on('WfMediabox:plugin', function (e, data) {

        function isImage(data) {
            var src = data.src;
            // remove query to test extension
            src = src.split('?')[0];
            return /image\/?/.test(data.type) || /\.(jpg|jpeg|png|apng|gif|bmp|tif|webp)$/i.test(src);
        }

        if (isImage(data)) {
            var $img = $('<img src="' + data.src + '" class="wf-mediabox-img" alt="' + decodeURIComponent(data.alt || data.title || "") + '" tabindex="0" />');

            if (data.params) {
                $.each(data.params, function (name, value) {
                    if (name === "srcset") {
                        value = value.replace(/(?:[^\s]+)\s*(?:[\d\.]+[wx])?(?:\,\s*)?/gi, function (match) {
                            if (islocal(match)) {
                                return WfMediabox.site + match;
                            }

                            return match;
                        });
                    }

                    $img.attr(name, value);
                });
            }

            return $img;
        }

        return "";
    });

    /**
     * Image
     */
    WfMediabox.Plugin.add('image', function () {
        this.type = "image";

        // create image html (leave src blank)
        this.html = function (data) {
            // get alt value from title or passed in alt variable
            var alt = decodeURIComponent(data.alt || data.title || "");
            // remove HTML
            alt = stripHtml(alt);

            var $img = $('<img src="' + data.src + '" class="wf-mediabox-img" alt="' + alt + '" tabindex="0" />');

            if (data.params) {
                $.each(data.params, function (name, value) {
                    if (name === "srcset") {
                        value = value.replace(/(?:[^\s]+)\s*(?:[\d\.]+[wx])?(?:\,\s*)?/gi, function (match) {
                            if (islocal(match)) {
                                return WfMediabox.site + match;
                            }

                            return match;
                        });
                    }

                    $img.attr(name, value);
                });
            }

            $img.on('mediabox:load', function () {
                var cw = this.clientWidth, ch = this.clientHeight, nw = this.naturalWidth, nh = this.naturalHeight;

                if ($('body').hasClass('wf-mediabox-scrolling')) {
                    return;
                }

                if (WfMediabox.settings.expand_on_click === false) {
                    return;
                }

                $(this).parent().removeClass('wf-mediabox-content-item-expand');

                if (nw > cw || nh > ch) {
                    var $body = $('.wf-mediabox-body');

                    // fullscreen zoom
                    $(this).add('.wf-mediabox-expand', $body).on('click', function () {

                        if ($('.wf-mediabox-frame').hasClass('wf-mediabox-fullscreen')) {
                            $('.wf-mediabox-frame').removeClass('wf-mediabox-fullscreen');

                            $body.css({
                                'width': '',
                                'max-height': ''
                            });

                            $img.trigger('mediabox:resize');
                        } else {
                            $('.wf-mediabox-frame').addClass('wf-mediabox-fullscreen');

                            $body.css({
                                'max-width': '',
                                'max-height': nh + 15, // natural height + scrollbar height
                                'width': nw
                            });

                            requestAnimationFrame(function () {
                                var el = $img.parent().get(0);
                                
                                if (el) {
                                    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
                                    el.scrollTop = (el.scrollHeight - el.clientHeight) / 2;
                                }
                            });
                        }

                    }).parent().addClass('wf-mediabox-content-item-expand');
                }
            });

            return $img;
        };

        this.is = function (data) {
            var src = data.src;
            // remove query to test extension
            src = src.split('?')[0];
            return /image\/?/.test(data.type) || /\.(jpg|jpeg|png|gif|bmp|tif|webp)$/i.test(src);
        };
    });

    /**
     * PDF
     */
    WfMediabox.Plugin.add('pdf', function () {
        this.type = "object";

        // create html
        this.html = function (data) {
            // get the "basename" of the file
            var name = basename(data.src);

            // set the label to the title or a default
            var label = data.title || 'PDF display of ' + name;

            data.width = data.width || '100%';
            data.height = data.height || '100%';

            if (WfMediabox.Env.safari) {
                // load with transparent src
                return $('<object data="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" aria-label="' + label + '" />').on('mediabox:load', function () {
                    // replace src with timestamped pdf url
                    var src = appendTimestampToUrl(data.src);
                    $(this).attr({ 'data': src, 'type': 'application/pdf' });
                });
            }

            return $('<object data="' + data.src + '" type="application/pdf" aria-label="' + label + '" />');
        };

        this.is = function (data) {
            return data.type === "pdf" || /application\/(x-)?pdf/.test(data.type) || /\.pdf$/i.test(data.src);
        };
    });

    /**
     * Ajax / Internal Content
     */
    WfMediabox.Plugin.add('content', function () {
        this.type = "ajax";

        this.html = function (data) {

            var src = data.src;

            // create component src for local urls
            if (islocal(src)) {
                src = createComponentURL(src);
            }

            data.width = data.width || '100%';
            data.height = data.height || '100%';

            var iframe = $('<iframe src="' + src + '" />').on('mediabox:load', function () {
                // eslint-disable-next-line consistent-this
                var n = this, $parent = $(this).parent(),
                    html = this.contentWindow.document.body.innerHTML;

                // remove iframe
                window.setTimeout(function () {
                    $(n).remove();
                }, 10);

                // append html to created parent
                $parent.append(html);

                // if the src has an anchor, scroll to it
                if (this.src.indexOf('#') !== -1) {
                    var uri = parseURL(this.src);

                    if (uri.anchor) {
                        var elm = $parent.find('#' + uri.anchor).get(0);

                        if (elm) {
                            elm.scrollIntoView();
                        }
                    }
                }

                // process anchors
                $parent.find('a[href^="#"]').on('click', function (e) {
                    e.preventDefault();

                    var id = $(this).attr('href'), elm = $parent.find(id).get(0);

                    if (elm) {
                        elm.scrollIntoView();
                    }
                });

                WfMediabox.create(WfMediabox.getPopups('', $parent));

                if (data.params) {
                    // add passed in styles
                    if (data.params.style) {
                        $('<style type="text/css" />').text('.wf-mediabox-content{' + $('<div />').attr('style', data.params.style).get(0).style.cssText + '}').insertBefore($parent);
                    }
                }
            });

            return iframe;
        };

        this.is = function (data) {
            return data.type === "ajax" || data.type === "text/html" || $(data.node).hasClass('ajax');
        };
    });
    /**
     * Dom Element
     */
    WfMediabox.Plugin.add('dom', function () {
        this.type = "dom";

        this.html = function (data) {
            var params = data.params || {};

            var src = params.content || data.src;

            // empty or an anchor tag
            if (!src || src === '#') {
                return "";
            }

            // the src value should be an id selector or class selector, eg: #foo or .foo
            if (src.charAt(0) !== '#' && src.charAt(0) !== '.') {
                src = '#' + src;
            }

            // set node as the first available element if any
            var node = $(src).get(0);

            if (node) {
                return node.outerHTML;
            }

            return "";
        };

        this.is = function (data) {
            var params = data.params || {};

            return data.type === "dom" || params.content;
        };
    });
    /**
     * IFrame
     */
    WfMediabox.Plugin.add('iframe', function () {

        this.type = "iframe";

        this.html = function (data) {
            data.width = data.width || '100%';
            data.height = data.height || '100%';

            var src = data.src;

            // create component src for local urls
            if (islocal(src)) {
                src = createComponentURL(src);
            }

            // create iframe markup
            var ifr = createIframe(src);

            return $(ifr);
        };

        this.is = function (data) {
            return !data.type || data.type === "iframe";
        };
    });
})(jQuery, WfMediabox);