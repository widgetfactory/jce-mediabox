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
(function($, WFMediaBox) {
    function createObject(data, embed) {
        delete data.group;
        delete data.title;
        delete data.caption;
        delete data.width;
        delete data.height;

        var attribs = ['id', 'name', 'style', 'codebase', 'classid', 'type', 'data'];

        var html = '<object ';
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

    function createIframe(src) {
        // create html
        return '<iframe src="' + src + '" frameborder="0" scrolling="0" allowfullscreen="allowfullscreen" />';
    }

    WFMediaBox.Plugin.add('flash', function() {
        this.type = "object";
        this.html = function(data) {
            data.type = "application/x-shockwave-flash";
            data.data = data.src;

            return $(createObject(data, true));
        };

        this.is = function(data) {
            return /\.swf\b/.test(data.src);
        };
    });
    WFMediaBox.Plugin.add('flv', function() {
        this.type = "object";
        this.html = function(data) {
            var swf = WFMediaBox.settings.mediaplayer || 'plugins/system/jcemediabox/mediaplayer/mediaplayer.swf';

            data.type = "application/x-shockwave-flash";
            data.data = WFMediaBox.resolveMediaPath(swf);

            data.flashvars = 'src=' + WFMediaBox.resolveMediaPath(data.src, true);

            if (typeof data.controls === "undefined") {
                data.controls = "true";
            }

            data.flashvars += '&controls=' + data.controls;

            delete data.src;
            delete data.controls;

            return $(createObject(data));
        };

        this.is = function(data) {
            return /\.(flv|f4v)\b/.test(data.src);
        };
    });
    /*WFMediaBox.Plugin.add('metacafe', function(v) {
     this.attributes = {

     return {
     width: 400,
     height: 345,
     type: 'flash',
     attributes: {
     'wmode': 'opaque',
     'src': (function() {
     s.replace(/watch/i, 'fplayer');
     })();
     }
     };
     }

     return /metacafe(.+)\/(watch|fplayer)\/(.+)/.test(v);
     });*/
    /**
     * Daily Motion - http://www.dailymotion.com
     * @param {String} v URL
     */
    WFMediaBox.Plugin.add('dailymotion', function() {
        this.is = function(data) {
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
        this.html = function(data) {
            return $(createIframe(processURL(data.src)));
        };
    });
    WFMediaBox.Plugin.add('quicktime', function() {
        var n;

        this.html = function(data) {
            data.type = "video/quicktime";
            data.classid = "clsid:02bf25d5-8c17-4b23-bc80-d3488abddc6b";
            data.codebase = "https://www.apple.com/qtactivex/qtplugin.cab#version=6,0,2,0";

            return $(createObject(data));
        };

        this.type = "object";
        this.width = 853;

        this.is = function(data) {
            return /\.(mov)\b/.test(data.src);
        };
    });
    WFMediaBox.Plugin.add('windowsmedia', function() {

        this.type = "object";
        this.html = function(data) {
            data.type = "application/x-mplayer2";
            data.classid = "clsid:6bf52a52-394a-11d3-b153-00c04f79faa6";
            data.codebase = "https://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=5,1,52,701";

            return $(createObject(data, true));
        };

        this.is = function(data) {
            return /\.(wmv|avi)\b/.test(data.src);
        };
    });
    /**
     * Youtube - http://www.youtube.com
     * @param {String} v URL
     */
    WFMediaBox.Plugin.add('youtube', function() {
        var self = this;

        this.is = function(data) {
            return /youtu(\.)?be([^\/]+)?\/(.+)/.test(data.src);
        };

        function processURL(v) {
            v = v.replace(/youtu(\.)?be([^\/]+)?\/(.+)/, function(a, b, c, d) {
                d = d.replace(/(watch\?v=|v\/|embed\/)/, '');

                if (b && !c) {
                    c = '.com';
                }

                return 'youtube' + c + '/embed/' + d;
            });

            // add www (required by iOS ??)
            v = v.replace(/\/\/youtube/i, '//www.youtube');

            // force ssl
            v = v.replace(/^http:\/\//, 'https://');

            v += '?html5=1';

            return v;
        }
        // default 16:9 size
        this.width = 560;
        // declare type
        this.type = "iframe";
        // create html
        this.html = function(data) {
            return $(createIframe(processURL(data.src)));
        };
    });
    WFMediaBox.Plugin.add('vimeo', function() {

        this.is = function(data) {
            return /vimeo\.com\/(\w+\/)?(\w+\/)?([0-9]+)/.test(data.src);
        };

        function processURL(s) {
            s = s.replace(/(player\/)?vimeo\.com\/(\w+\/)?(\w+\/)?([0-9]+)/, function(a, b, c, d, e) {
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
        this.html = function(data) {
            return $(createIframe(processURL(data.src)));
        };
    });
    /**
     * Image
     */
    WFMediaBox.Plugin.add('image', function() {
        this.type = "image";

        // create image html (leave src blank)
        this.html = function(data) {
            return '<img src="#" class="wf-mediabox-img" alt="' + decodeURIComponent(data.title || "") + '" />';
        };

        this.is = function(data) {
            // remove query
            data.src = data.src.split('?')[0];
            return /image\/?/.test(data.type) || /\.(jpg|jpeg|png|gif|bmp|tif)$/i.test(data.src);
        };
    });
    /**
     * HTML5 Video
     */
    WFMediaBox.Plugin.add('video', function() {
        this.type = "video";

        // create image html (leave src blank)
        this.html = function(data) {
            var attribs = ['src="' + data.src + '"', 'class="wf-mediabox-video"'],
                n;

            var params = data.params || {};

            for (n in params) {
                attribs.push(n + '="' + params[n] + '"');
            }

            if (!params.autoplay) {
                attribs.push('controls');
            }

            if (data.width) {
                attribs.push('width="' + data.width + '"');
            }

            if (data.height) {
                attribs.push('height="' + data.height + '"');
            }

            return '<video ' + attribs.join(' ') + '></video>';
        };

        this.is = function(data) {
            return (/video\/(mp4|mpeg|webm|ogg)/.test(data.type) || /\.(mp4|webm|ogg)\b/.test(data.src)) && WFMediaBox.Env.video;
        };
    });
    /**
     * PDF
     */
    WFMediaBox.Plugin.add('pdf', function() {
        this.type = "iframe";
        // create html
        this.html = function(data) {
            return $('<iframe src="' + data.src + '" frameborder="0" />');
        };

        this.height = '100%';

        this.is = function(data) {
            return data.type === "pdf" || /\.pdf$/i.test(data.src);
        };
    });
    /**
     * Ajax / Internal Content
     */
    WFMediaBox.Plugin.add('content', function() {
        function islocal(s) {                        
            if (/^(\w+:)?\/\//.test(s)) {
                return new RegExp('^(' + WFMediaBox.site + ')').test(s);
            } else {
                return true;
            }
        }

        this.type = "ajax";

        this.html = function(data) {
            var html = "";
            var src = data.src;

            if (islocal(src) && src.indexOf('tmpl=component') === -1) {
                src += /\?/.test(src) ? '&tmpl=component' : '?tmpl=component';
            }

            var iframe = $('<iframe src="' + src + '" />').load(function() {
                var n = this,
                    html = this.contentWindow.document.body.innerHTML;

                // append html to created parent
                $(this).parent().append(html);

                // remove iframe
                window.setTimeout(function() {
                    $(n).remove();
                }, 10);

                WFMediaBox.create(WFMediaBox.getPopups('', $(this).parent()));
            });

            return iframe;
        };

        this.is = function(data) {
            return data.type === "ajax" || data.type === "text/html";
        };
    });
    /**
     * Dom Element
     */
    WFMediaBox.Plugin.add('dom', function() {
        this.type = "dom";

        this.html = function(data) {
            var node = $(data.src);

            if (node) {
                return $(node).get(0).outerHTML;
            }

            return "";
        };

        this.is = function(data) {
            return data.type === "dom";
        };
    });
    /**
     * IFrame
     */
    WFMediaBox.Plugin.add('iframe', function() {

        this.type = "iframe";

        this.html = function(data) {
            return $('<iframe src="' + data.src + '" frameborder="0" />');
        };

        this.is = function(data) {
            return !data.type || data.type === "iframe";
        };
    });
})(jQuery, WFMediaBox);
