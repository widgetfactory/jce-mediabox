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
import Addons from "./Addons";
import Parameter from "./Parameter";
import Tools from "./Tools";
import Storage from "./Storage";
import Env from "./Env";
import Mime from "./Mime";
import Entities from "./Entities";

function stripHtml(html) {
    let tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}

function isBool(attr) {
    var map = ['async', 'checked', 'compact', 'declare', 'defer', 'disabled', 'ismap', 'multiple', 'nohref', 'noresize', 'noshade', 'nowrap', 'readonly', 'selected', 'autoplay', 'loop', 'controls', 'itemscope', 'playsinline', 'contenteditable', 'spellcheck', 'contextmenu', 'draggable', 'hidden'];
    return map.includes(attr);
}

function islocal(s) {
    if (/^([a-z]+)?:\/\//.test(s)) {
        return new RegExp('(' + WfMediabox.site + ')').test(s);
    }

    return true;
}

function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();

    // Change this to div.childNodes to support multiple top-level nodes
    return div.firstChild;
}

/**
 * Parse the URI into component parts
 * https://github.com/tinymce/tinymce/blob/master/js/tinymce/classes/util/URI.js
 */
function parseURL(url) {
    var o = {};

    url = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@\/]*):?([^:@\/]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/.exec(url);

    ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"].forEach(function (i, v) {
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

    let html = '<object class="wf-mediabox-focus"';
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

    var elm = createElementFromHTML(html);

    return elm;
}

function createIframe(src, attribs) {
    // create html
    const html = '<iframe src="' + src + '" frameborder="0" scrolling="0" allowfullscreen="allowfullscreen" />';

    return createElementFromHTML(html);
}

Addons.Plugin.add('flash', function () {
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
Addons.Plugin.add('video', function () {
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

        if (Env.mobile) {
            attribs.push('playsinline');
        }

        var ext = data.src.split('.').pop();
        var type = Mimetype.guess(ext) || 'video/mpeg';

        const video = createElementFromHTML('<video ' + attribs.join(' ') + ' tabindex="0"><source src="' + data.src + '" type="' + type + '" /></video>');

        video.addEventListener('loadedmetadata', function (e) {
            video.setAttribute('width', video.videoWidth || '');
            video.setAttribute('height', video.videoHeight || '');
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
Addons.Plugin.add('audio', function () {
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

        return createElementFromHTML('<audio ' + attribs.join(' ') + ' tabindex="0"></audio>');
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
Addons.Plugin.add('dailymotion', function () {
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
        const ifr = createIframe(processURL(data.src));

        // identify as a video to force aspect ratio
        ifr.classList.add('wf-mediabox-iframe-video');

        return ifr;
    };
});

Addons.Plugin.add('quicktime', function () {
    var n;

    this.html = function (data) {
        data.type = "video/quicktime";
        data.classid = "clsid:02bf25d5-8c17-4b23-bc80-d3488abddc6b";
        data.codebase = "https://www.apple.com/qtactivex/qtplugin.cab#version=6,0,2,0";

        return createObject(data);
    };

    this.type = "object";
    this.width = 853;

    this.is = function (data) {
        return /\.(mov)\b/.test(data.src);
    };
});

Addons.Plugin.add('windowsmedia', function () {

    this.type = "object";

    this.html = function (data) {
        data.type = "application/x-mplayer2";
        data.classid = "clsid:6bf52a52-394a-11d3-b153-00c04f79faa6";
        data.codebase = "https://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=5,1,52,701";

        return createObject(data, true);
    };

    this.is = function (data) {
        return /\.(wmv|avi)\b/.test(data.src);
    };
});

/**
 * Youtube - http://www.youtube.com
 * @param {String} v URL
 */
Addons.Plugin.add('youtube', function () {
    var self = this, props = ['autoplay', 'cc_lang_pref', 'cc_load_policy', 'color', 'controls', 'disablekb', 'enablejsapi', 'end', 'fs', 'hl', 'iv_load_policy', 'list', 'listType', 'loop', 'modestbranding', 'origin', 'playlist', 'playsinline', 'rel', 'start', 'widget_referrer'];

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

            var paramsObj = {};

            for (let [key, value] of Object.entries(data.params)) {

                if (key.indexOf('youtube-') !== -1) {
                    key = key.replace('youtube-', '');
                }

                if (props.includes(key)) {
                    paramsObj[key] = value;

                    if (key == 'autoplay' && !!value) {
                        allow.push(key);

                        // add mute
                        paramsObj.mute = 1;
                    }
                }
            };

            if (allow.length) {
                ifr.setAttribute('allow', allow.join(';'));
            }

            let params = new URLSearchParams(paramsObj).toString();

            if (params) {
                if (src.indexOf('?') !== -1) {
                    src += '&' + params;
                } else {
                    src += '?' + params;
                }

                ifr.setAttribute('src', src);
            }
        }

        // identify as a video to force aspect ratio
        ifr.classList.add('wf-mediabox-iframe-video');

        return ifr;
    };
});

Addons.Plugin.add('vimeo', function () {

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
        var src = processURL(data.src), ifr = createIframe(src);

        // identify as a video to force aspect ratio
        ifr.classList.add('wf-mediabox-iframe-video');

        if (data.params) {
            var paramsObj = {};

            for (let [key, value] of Object.entries(data.params)) {
                if (key.indexOf('vimeo-') !== -1) {
                    key = key.replace('vimeo-', '');
                    paramsObj[key] = value;
                }
            };

            let params = new URLSearchParams(paramsObj).toString();

            if (params) {
                if (src.indexOf('?') !== -1) {
                    src += '&' + params;
                } else {
                    src += '?' + params;
                }

                ifr.setAttribute('src', src);
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
        const img = createElementFromHTML('<img src="' + data.src + '" class="wf-mediabox-img" alt="' + decodeURIComponent(data.alt || data.title || "") + '" tabindex="0" />');

        if (data.params) {
            for (let [name, value] of Object.entries(data.params)) {
                if (name === "srcset") {
                    value = value.replace(/(?:[^\s]+)\s*(?:[\d\.]+[wx])?(?:\,\s*)?/gi, function (match) {
                        if (islocal(match)) {
                            return WfMediabox.site + match;
                        }

                        return match;
                    });
                }

                img.setAttribute(name, value);
            };
        }

        return img;
    }

    return "";
});

/**
 * Image
 */
Addons.Plugin.add('image', function () {
    this.type = "image";

    // create image html (leave src blank)
    this.html = function (data) {
        // get alt value from title or passed in alt variable
        var alt = decodeURIComponent(data.alt || data.title || "");
        // remove HTML
        alt = stripHtml(alt);

        const img = createElementFromHTML('<img src="' + data.src + '" class="wf-mediabox-img" alt="' + alt + '" tabindex="0" />');

        if (data.params) {
            for (let [name, value] of Object.entries(data.params)) {
                if (name === "srcset") {
                    value = value.replace(/(?:[^\s]+)\s*(?:[\d\.]+[wx])?(?:\,\s*)?/gi, function (match) {
                        if (islocal(match)) {
                            return WfMediabox.site + match;
                        }

                        return match;
                    });
                }

                img.setAttribute(name, value);
            };
        }

        return img;
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

        data.width = data.width || '100%';
        data.height = data.height || '100%';

        const ifr = createElementFromHTML('<iframe src="' + data.src + '" frameborder="0" aria-label="' + label + '"></iframe>');

        ifr.addEventListener('load', function () {
            if (WfMediabox.Env.gecko) {
                return;
            }

            // small timeout then reset src to reset sizing
            ifr.src = '';

            setTimeout(function () {
                ifr.src = data.src;
            }, 0);

        }, { once: true });
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
        // create component src
        src = createComponentURL(data.src);

        data.width = data.width || '100%';
        data.height = data.height || '100%';

        const ifr = createIframe(src);

        ifr.addEventListener('load', function () {
            const parent = ifr.parentNode,
                html = ifr.contentWindow.document.body.innerHTML;

            // remove iframe
            window.setTimeout(function () {
                ifr.remove();
            }, 10);

            // append html to parent
            parent.innerHTML = html;

            var uri = parseURL(ifr.src);

            if (uri.anchor) {
                var elm = parent.querySelector('#' + uri.anchor);

                if (elm) {
                    elm.scrollIntoView();
                }
            }

            // process anchors
            parent.querySelectorAll('a[href^="#"]').forEach(function (elm) {
                elm.addEventListener('click', function (e) {
                    e.preventDefault();

                    var id = elm.getAttribute('href'), elm = parent.querySelector(id);

                    if (elm) {
                        elm.scrollIntoView();
                    }
                });
            });

            WfMediabox.create(WfMediabox.getPopups('', parent));

            if (data.params) {
                // add passed in styles
                if (data.params.style) {
                    let style = document.createElement('style');

                    let cssNode = document.createElement('div');
                    cssNode.setAttribute('style', data.params.style);

                    style.textContent = '.wf-mediabox-content{' + cssNode.style.cssText + '}';
                    parent.insertBefore(style, parent.firstChild);
                }
            }
        });

        return ifr;
    };

    this.is = function (data) {
        return data.type === "ajax" || data.type === "text/html" || data.node.classList.contains('ajax');
    };
});
/**
 * Dom Element
 */
WfMediabox.Plugin.add('dom', function () {
    this.type = "dom";

    this.html = function (data) {
        var node = createElementFromHTML(data.src);

        if (node) {
            return node.outerHTML;
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
Addons.Plugin.add('iframe', function () {

    this.type = "iframe";

    this.html = function (data) {
        data.width = data.width || '100%';
        data.height = data.height || '100%';

        // create component src
        src = createComponentURL(data.src);

        // create iframe markup
        const ifr = createIframe(src);

        return ifr
    };

    this.is = function (data) {
        return !data.type || data.type === "iframe";
    };
});