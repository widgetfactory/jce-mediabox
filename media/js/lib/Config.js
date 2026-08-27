/**
 * Shared configuration state.
 *
 * Both Mediabox.js and Plugins.js need the settings object and the resolved site url.
 * Keeping them here rather than on Mediabox.js keeps the module graph acyclic -
 * otherwise Mediabox imports Plugins imports Mediabox.
 */

// default settings object
export const settings = {
    selector: '.jcepopup,.wfpopup,[data-mediabox],.jcebox',
    labels: {
        "close": "Close",
        "next": "Next",
        "previous": "Previous"
    },
    convert_local_url: true,
    autoplay: 0,
    // duration in milliseconds of all open / change / close transitions. 0 disables transitions
    transition_speed: 300,
    expand_on_click: true,
    display_mode: 'fit' // 'fit' or 'scroll'
};

let site = '';

/**
 * Get the resolved Site Base URL
 * @return {String}
 */
export function getSite() {
    return site;
}

/**
 * Set the resolved Site Base URL
 * @param {String} value
 */
export function setSite(value) {
    site = value || '';
}
