/**
 * Copyright (c) Moxiecode Systems AB
 * Copyright (c) 1999–2017 Ephox Corporation. All rights reserved.
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Copyright (c) 2009 - 2026 Ryan Demmer. All rights reserved.
 *
 * @note Forked from or includes code from TinyMCE 4.x/5.x (originally LGPL v2.1),
 * TinyMCE 6.x (MIT), and TinyMCE 7.x (GPL v2.0 or later).
 *
 * Code originally under LGPL v2.1 is relicensed under GPL v2.0 or later
 * as permitted by Section 3 of the LGPL v2.1.
 * Code originally under MIT is incorporated under its permissive terms.
 * Code originally under GPL v2.0 or later remains under GPL v2.0 or later.
 *
 * Licensed under the GNU General Public License v2.0 or later (GPL v2+):
 * https://www.gnu.org/licenses/gpl-2.0.html
 */

/**
 * This class contains various environment constants like browser versions etc.
 * Normally you don't want to sniff specific browser versions but sometimes you have
 * to when it's impossible to feature detect. So use this with care.
 *
 * @class wren.Env
 * @static
 */

var nav = navigator,
    userAgent = nav.userAgent;
var opera, webkit, ie, gecko, iDevice, android, fileApi, phone, tablet, windowsPhone;

function matchMediaQuery(query) {
    return "matchMedia" in window ? matchMedia(query).matches : false;
}

opera = window.opera && window.opera.buildNumber;
android = /Android/.test(userAgent);
webkit = /WebKit/.test(userAgent);
ie = !webkit && !opera && (/MSIE/gi).test(userAgent) && (/Explorer/gi).test(nav.appName);
ie = ie && /MSIE (\w+)\./.exec(userAgent)[1];
ie = ie && !webkit;
gecko = !webkit && !ie && /Gecko/.test(userAgent);
iDevice = /(iPad|iPhone)/.test(userAgent);
phone = matchMediaQuery("only screen and (max-device-width: 480px)") && (android || iDevice);
tablet = matchMediaQuery("only screen and (min-width: 800px)") && (android || iDevice);
windowsPhone = userAgent.indexOf('Windows Phone') != -1;

// Is a iPad/iPhone and not on iOS5 sniff the WebKit version since older iOS WebKit versions
// says it has contentEditable support but there is no visible caret.
var contentEditable = !iDevice || fileApi || userAgent.match(/AppleWebKit\/(\d*)/)[1] >= 534;

export default {

    chrome: webkit && !ie && !opera,
    edge: ie && parseInt(ie, 10) >= 12,
    firefox: gecko,
    ie: ie,
    opera: opera,
    safari: webkit && !ie && !opera,

    android: function () {
        return /Android/.test(userAgent);
    },

    ios: function () {
        return /(iPad|iPhone)/.test(userAgent) && !windowsPhone;
    },

    chromeOs: function () {
        return /CrOS/.test(userAgent);
    },

    macOs: function () {
        return userAgent.indexOf('Mac') != -1;
    },

    desktop: !phone && !tablet,
    windowsPhone: windowsPhone,

    webkit: webkit,

    gecko: gecko,

    mobile: phone || tablet
};