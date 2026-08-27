/**
 * Plugin registry.
 *
 * The media type plugins register themselves here at load time. Registration order is
 * significant: getPlugin() returns the first plugin whose is() accepts the data, and
 * the iframe plugin is the catch-all, so it must be registered last.
 */

const plugins = {};

/**
 * Register a plugin
 * @param {String} name
 * @param {Function} plugin Plugin constructor
 * @return {Boolean} False if the name is taken or the plugin is not a constructor
 */
function add(name, plugin) {
    if (typeof name !== "string" || typeof plugin !== "function") {
        return false;
    }

    // check if plugin already exists
    if (plugins.hasOwnProperty(name)) {
        return false;
    }

    plugins[name] = plugin;

    return true;
}

/**
 * Get a plugin constructor by name, or the whole registry when called without one
 * @param {String} name
 * @return {Function|Object|null}
 */
function get(name) {
    if (typeof name !== "string") {
        return plugins;
    }

    if (plugins.hasOwnProperty(name)) {
        return plugins[name];
    }

    return null;
}

/**
 * Find the first registered plugin that accepts the given popup data.
 *
 * Object.keys preserves insertion order for string keys, so plugins are tried in
 * registration order and the iframe catch-all stays last.
 *
 * @param {Object} data Popup data object
 * @param {String} name Optional plugin name to restrict the search to
 * @return {Object|undefined} Plugin instance
 */
function getPlugin(data, name) {
    var found;

    var registry = get(name);

    // a named lookup returns a single constructor
    if (typeof registry === "function") {
        var single = new registry(data);

        return single && single.is(data) ? single : undefined;
    }

    if (!registry) {
        return undefined;
    }

    Object.keys(registry).some(function (key) {
        var Ctor = registry[key];
        var instance = new Ctor(data);

        if (instance && instance.is(data)) {
            found = instance;

            return true;
        }

        return false;
    });

    return found;
}

export default {
    add: add,
    get: get,
    getPlugin: getPlugin
};
