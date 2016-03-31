/**
 * Env.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class contains various environment constrants like browser versions etc.
 * Normally you don't want to sniff specific browser versions but sometimes you have
 * to when it's impossible to feature detect. So use this with care.
 *
 * @class tinymce.Env
 * @static
 */
(function() {

    var nav = navigator, userAgent = nav.userAgent;
    var opera, webkit, ie, ie6, gecko, mac, iDevice, Android, video, audio;

    opera = window.opera && window.opera.buildNumber;
    webkit = /WebKit/.test(userAgent);
    ie = !webkit && !opera && (/MSIE/gi).test(userAgent) && (/Explorer/gi).test(nav.appName);
    ie = ie && /MSIE (\w+)\./.exec(userAgent)[1];
    ie6 = ie && !window.XMLHttpRequest;
    gecko = !webkit && /Gecko/.test(userAgent);
    mac = userAgent.indexOf('Mac') != -1;
    iDevice = /(iPad|iPhone)/.test(userAgent);
    Android = /Android/.test(userAgent);

    /*
     * From Modernizr v2.0.6
     * http://www.modernizr.com
     * Copyright (c) 2009-2011 Faruk Ates, Paul Irish, Alex Sexton
     */
    video = (function() {
        var el = document.createElement('video'), o = {};
        // IE9 Running on Windows Server SKU can cause an exception to be thrown, bug #224
        try {

            if (!!el.canPlayType) {
                o.ogg = el.canPlayType('video/ogg; codecs="theora"');

                // Workaround required for IE9, which doesn't report video support without audio codec specified.
                //   bug 599718 @ msft connect
                var h264 = 'video/mp4; codecs="avc1.42E01E';
                o.mp4 = el.canPlayType(h264 + '"') || el.canPlayType(h264 + ', mp4a.40.2"');

                o.webm = el.canPlayType('video/webm; codecs="vp8, vorbis"');

                return o;
            }

        } catch (e) {
        }

        return false;
    })();

    /*
     * From Modernizr v2.0.6
     * http://www.modernizr.com
     * Copyright (c) 2009-2011 Faruk Ates, Paul Irish, Alex Sexton
     */
    audio = (function() {
        var el = document.createElement('audio'), o = {};
        try {
            if (!!el.canPlayType) {
                o.ogg = el.canPlayType('audio/ogg; codecs="vorbis"');
                o.mp3 = el.canPlayType('audio/mpeg;');

                // Mimetypes accepted:
                //   https://developer.mozilla.org/En/Media_formats_supported_by_the_audio_and_video_elements
                //   http://bit.ly/iphoneoscodecs
                o.wav = el.canPlayType('audio/wav; codecs="1"');
                o.m4a = el.canPlayType('audio/x-m4a;') || el.canPlayType('audio/aac;');
                o.webm = el.canPlayType('audio/webm; codecs="vp8, vorbis"');

                return o;
            }
        } catch (e) {
        }

        return false;
    })();

    var Env = {
        /**
         * Constant that is true if the browser is Opera.
         *
         * @property opera
         * @type Boolean
         * @final
         */
        opera: opera,
        /**
         * Constant that is true if the browser is WebKit (Safari/Chrome).
         *
         * @property webKit
         * @type Boolean
         * @final
         */
        webkit: webkit,
        /**
         * Constant that is more than zero if the browser is IE6.
         *
         * @property ie6
         * @type Boolean
         * @final
         */
        ie6: ie6,
        /**
         * Constant that is more than zero if the browser is IE.
         *
         * @property ie
         * @type Boolean
         * @final
         */
        ie: ie,
        /**
         * Constant that is true if the browser is Gecko.
         *
         * @property gecko
         * @type Boolean
         * @final
         */
        gecko: gecko,
        /**
         * Constant that is true if the os is Mac OS.
         *
         * @property mac
         * @type Boolean
         * @final
         */
        mac: mac,
        /**
         * Constant that is true if the os is iOS.
         *
         * @property iOS
         * @type Boolean
         * @final
         */
        iOS: iDevice,
        /**
         * Constant that is true if the os is Android.
         *
         * @property Android
         * @type Boolean
         * @final
         */
        android: Android,
        /**
         * Object showing browser support for HTML5 video.
         *
         * @property video
         * @type Object
         * @final
         */
        video: video,
        /**
         * Object showing browser support for HTML5 audio.
         *
         * @property audio
         * @type Object
         * @final
         */
        audio: audio
    };

    window.MediaBox.Env = Env;
})();
