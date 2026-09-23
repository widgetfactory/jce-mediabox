/* global Joomla */

/**
 * Initialise with the options the plugin passed through addScriptOptions().
 *
 * The options are configuration only, so if core.js is missing or the plugin
 * added none, initialising with the built in defaults is better than not
 * initialising at all.
 */
function start() {
    var options = null;

    if (typeof Joomla !== 'undefined' && typeof Joomla.getOptions === 'function') {
        options = Joomla.getOptions('plg_system_jcemediabox');
    }

    window.WfMediabox.init(options || {});
}

/*
 * The bundle is deferred, so it normally runs before DOMContentLoaded. Loaded any
 * later, eg: dynamically or with async, that event has already fired and a
 * listener would never run.
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
} else {
    start();
}
