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
(function ($, WfMediabox) {
    function islocal(s) {
        if (/^([a-z]+)?:\/\//.test(s)) {
            return new RegExp('(' + WfMediabox.site + ')').test(s);
        }

        return true;
    }

    /**
     * Parse the URI into component parts
     * https://github.com/tinymce/tinymce/blob/master/js/tinymce/classes/util/URI.js
     */
    function parseURL(url) {
        var o = {};

        url = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@\/]*):?([^:@\/]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/.exec(url);

        $.each(["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"], function (i, v) {
            var s = url[i];
            if (s) {
                o[v] = s;
            }
        });

        return o;
    }

    function buildURL(o) {
        var url = '';

        if (o.protocol) {
            url += o.protocol + '://';
        }

        if (o.userInfo) {
            url += o.userInfo + '@';
        }

        if (o.host) {
            url += o.host;
        }

        if (o.port) {
            url += ':' + o.port;
        }

        if (o.path) {
            url += o.path;
        }

        if (o.query) {
            url += '?' + o.query;
        }

        if (o.anchor) {
            url += '#' + o.anchor;
        }

        return url;
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
            var attribs = ['src="' + data.src + '"', 'class="wf-mediabox-video wf-mediabox-focus"'],
                n;

            var params = data.params || {};

            for (n in params) {
                attribs.push(n + '="' + params[n] + '"');
            }

            if (!params.autoplay) {
                attribs.push('controls');
            }

            var video = $('<video ' + attribs.join(' ') + ' tabindex="0" />').on('loadedmetadata', function(e) {
                $(this).attr({'width' : this.videoWidth || '', 'height' : this.videoHeight || ''});
            });

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
                attribs.push(n + '="' + params[n] + '"');
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
        var n;

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
        var self = this;

        this.is = function (data) {
            return /youtu(\.)?be([^\/]+)?\/(.+)/.test(data.src);
        };

        function processURL(v) {
            v = v.replace(/youtu(\.)?be([^\/]+)?\/(.+)/, function (a, b, c, d) {
                d = d.replace(/(watch\?v=|v\/|embed\/)/, '');

                if (b && !c) {
                    c = '.com';
                }
                
                // replace first ampersand with question mark
                if (d.indexOf('?') === -1) {
                    d = d.replace(/&/, '?');
                }

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

                $.each(data.params, function(key, value) {
                    if (key.indexOf('youtube-') !== -1) {
                        key = key.replace('youtube-', '');
                        params[key] = value;

                        if (!!value) {
                            allow.push(key);
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
            s = s.replace(/(player[\/\.])?vimeo\.com\/(\w+\/)?(\w+\/)?([0-9]+)/, function (a, b, c, d, e) {
                if (b) {
                    return a;
                }
                return 'player.vimeo.com/video/' + e;
            });

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

                $.each(data.params, function(key, value) {
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

    $('.wf-mediabox').on('WfMediabox:plugin', function(e, data) {
        
        function isImage(data) {
            var src = data.src;
            // remove query to test extension
            src = src.split('?')[0];
            return /image\/?/.test(data.type) || /\.(jpg|jpeg|png|apng|gif|bmp|tif|webp)$/i.test(src);
        }

        if (isImage(data)) {
            var $img = $('<img src="' + data.src + '" class="wf-mediabox-img" alt="' + decodeURIComponent(data.alt || data.title || "") + '" tabindex="0" />');

            if (data.params) {
                $.each(data.params, function(name, value) {
                    if (name === "srcset") {
                        value = value.replace(/(?:[^\s]+)\s*(?:[\d\.]+[wx])?(?:\,\s*)?/gi, function(match) {
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
            var $img = $('<img src="' + data.src + '" class="wf-mediabox-img" alt="' + decodeURIComponent(data.alt || data.title || "") + '" tabindex="0" />');

            if (data.params) {
                $.each(data.params, function(name, value) {
                    if (name === "srcset") {
                        value = value.replace(/(?:[^\s]+)\s*(?:[\d\.]+[wx])?(?:\,\s*)?/gi, function(match) {
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
        this.type = "iframe";

        // create html
        this.html = function (data) {
            var label = data.title || 'PDF Iframe';

            data.width  = data.width    || '100%';
            data.height = data.height   || '100%';
            
            return $('<iframe src="' + data.src + '" frameborder="0" aria-label="' + label + '" />');
        };

        this.is = function (data) {
            return data.type === "pdf" || /\.pdf$/i.test(data.src);
        };
    });

    /**
     * Ajax / Internal Content
     */
    WfMediabox.Plugin.add('content', function () {
        this.type = "ajax";

        this.html = function (data) {
            var html = "";

            var src = data.src;
            var uri = parseURL(src);

            if (islocal(src)) {
                if (!uri.query) {
                    uri.query = 'tmpl=component';
                } else if (uri.query.indexOf('tmpl=component') == -1) {
                    uri.query += '&tmpl=component';
                }
            }

            // rebuild src
            src = buildURL(uri);

            data.width  = data.width    || '100%';
            data.height = data.height   || '100%';

            var iframe = $('<iframe src="' + src + '" />').on('mediabox:load', function () {
                var n = this, $parent = $(this).parent(),
                    html = this.contentWindow.document.body.innerHTML;

                // append html to created parent
                $parent.append(html);

                if (uri.anchor) {
                    var elm = $parent.find('#' + uri.anchor).get(0);

                    if (elm) {
                        elm.scrollIntoView();
                    }
                }

                // remove iframe
                window.setTimeout(function () {
                    $(n).remove();
                }, 10);

                // process anchors
                $parent.find('a[href^="#"]').on('click', function(e) {
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
            var node = $(data.src);

            if (node) {
                return $(node).get(0).outerHTML;
            }

            return "";
        };

        this.is = function (data) {
            return data.type === "dom";
        };
    });
    /**
     * IFrame
     */
    WfMediabox.Plugin.add('iframe', function () {

        this.type = "iframe";

        this.html = function (data) {
            var src = data.src;
            var uri = parseURL(src);

            data.width  = data.width    || '100%';
            data.height = data.height   || '100%';

            if (islocal(src)) {
                if (!uri.query) {
                    uri.query = 'tmpl=component';
                } else if (uri.query.indexOf('tmpl=component') == -1) {
                    uri.query += '&tmpl=component';
                }
            }

            // rebuild src
            src = buildURL(uri);

            var ifr = createIframe(src);

            return $(ifr);
        };

        this.is = function (data) {
            return !data.type || data.type === "iframe";
        };
    });
})(jQuery, WfMediabox);