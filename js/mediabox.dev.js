/**
 * Inline development version. Only to be used while developing since it uses document.write to load scripts.
 */

/*jshint smarttabs:true, undef:true, latedef:true, curly:true, bitwise:true, camelcase:true */
/*globals $code */

(function(exports) {
    "use strict";

    var html = "", baseDir;
    var modules = {}, exposedModules = [], moduleCount = 0;

    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
        var src = scripts[i].src;

        if (src.indexOf('/mediabox.dev.js') != -1) {            
            baseDir = src.substring(0, src.lastIndexOf('/'));
        }
    }

    function require(ids, callback) {
        var module, defs = [];

        for (var i = 0; i < ids.length; ++i) {
            module = modules[ids[i]] || resolve(ids[i]);
            if (!module) {
                throw 'module definition dependecy not found: ' + ids[i];
            }

            defs.push(module);
        }

        callback.apply(null, defs);
    }

    function resolve(id) {
        var target = exports;
        var fragments = id.split(/[.\/]/);

        for (var fi = 0; fi < fragments.length; ++fi) {
            if (!target[fragments[fi]]) {
                return;
            }

            target = target[fragments[fi]];
        }

        return target;
    }

    function register(id) {
        var target = exports;
        var fragments = id.split(/[.\/]/);

        for (var fi = 0; fi < fragments.length - 1; ++fi) {
            if (target[fragments[fi]] === undefined) {
                target[fragments[fi]] = {};
            }

            target = target[fragments[fi]];
        }

        target[fragments[fragments.length - 1]] = modules[id];
    }

    function define(id, dependencies, definition) {
        if (typeof id !== 'string') {
            throw 'invalid module definition, module id must be defined and be a string';
        }

        if (dependencies === undefined) {
            throw 'invalid module definition, dependencies must be specified';
        }

        if (definition === undefined) {
            throw 'invalid module definition, definition function must be specified';
        }

        require(dependencies, function() {
            modules[id] = definition.apply(null, arguments);
        });

        if (--moduleCount === 0) {
            for (var i = 0; i < exposedModules.length; i++) {
                register(exposedModules[i]);
            }
        }
    }

    function expose(ids) {
        exposedModules = ids;
    }

    function writeScripts() {
        document.write(html);
    }

    function load(path) {
        
        if (path.indexOf('.js') !== -1) {
            html += '<script type="text/javascript" src="' + baseDir + '/' + path + '"></script>\n';
            moduleCount++;
        }
        
        if (path.indexOf('.css') !== -1) {
            html += '<link rel="stylesheet" type="text/css" href="' + baseDir + '/' + path + '" />\n';
            moduleCount++;
        }
    }

    // Expose globally
    exports.define = define;
    exports.require = require;

    expose(["jQuery", "mediabox/Env", "mediabox/util/Entities", "mediabox/Parameter", "mediabox/Storage", "mediabox/Base64", "mediabox/Addons", "mediabox/Convert", "mediabox/util/Tools", "mediabox/MediaBox"]);

    if (!window.jQuery) {
        load('../vendor/jquery/jquery-1.11.1.min.js');
    }

    if (!window.MediaElement) {
        load('../vendor/mediaelement/js/mediaelement-and-player.min.js');
    }

    load('lib/Env.js');
    load('lib/Entities.js');
    load('lib/Parameter.js');
    load('lib/Storage.js');
    load('lib/Base64.js');
    load('lib/Convert.js');
    load('lib/Addons.js');
    load('lib/Tools.js');
    load('lib/Mediabox.js');
    
    // addons
    load('lib/Plugins.js');

    ['bootstrap', 'light', 'shadow', 'squeeze', 'standard', 'uikit'].forEach(function(s) {
        load('../themes/' + s + '/js/template.js');
    });

    writeScripts();
})(this);