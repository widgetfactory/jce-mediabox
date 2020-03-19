/**
 * Addons
 * @param {type} $ DomQuery
 * @returns {mediabox/Addons}
 */

(function ($) {
    function Addons() {
        var self = this;

        self.items = [];
        self.lookup = {};
    }

    Addons.prototype = {
        /**
         * Extend the addons object with a new addon
         * @param {String} n Addon name
         * @param {Object} o Addon object
         */
        add: function (id, addOn) {
            this.items.push(addOn);
            this.lookup[id] = { instance: addOn };

            return addOn;
        },
        /**
         * Returns the specified add on by the short name.
         *
         * @method get
         * @param {String} name Add-on to look for.
         * @return {mediabox.Theme/mediabox.Plugin} Theme or plugin add-on instance or undefined.
         */
        get: function (name) {
            if (name && this.lookup[name]) {
                return this.lookup[name].instance;
            }

            return this.lookup;
        }
    };

    Addons.Plugin = new Addons();
    Addons.Theme = new Addons();

    /**
     * Check a plugin
     * @param {type} v
     * @param {type} n
     * @returns {boolean}
     */
    Addons.Plugin.getPlugin = function (v, n) {
        var o, s, r, k;

        s = this.get(n);

        $.each(s, function (k, o) {
            var p = o.instance, c = new p(v);

            if (c && c.is(v)) {
                r = c;
                return false;
            }
        });

        return r;
    };

    /**
     * Convert json theme data to HTML
     * @param {type} data
     * @returns {@exp;el@pro;innerHTML|String}
     */
    Addons.Theme.parse = function (name, translate, parent) {
        var theme = this.get(name), data;

        if (typeof theme !== "function") {
            theme = this.get("standard");
        }

        data = new theme();

        // no theme data
        if (!data) {
            return;
        }

        // create parent div if no parent set
        if (!parent) {
            parent = document.createElement('div');
        }

        if (!translate) {
            translate = function (s) {
                return s;
            };
        }

        /**
         * Internal function to create or process a node
         * @param o Data object
         * @param el Element
         */
        function createNode(o, el) {
            // process node object
            $.each(o, function (k, v) {
                if (typeof v === "string") {
                    // translate
                    v = translate(v);

                    // text node
                    if (k === "text") {
                        $(el).html(v);
                        // attribute
                    } else {
                        $(el).attr(k, v);
                    }
                } else {
                    if ($.isArray(v)) {
                        createNode(v, el);
                    } else if (typeof k === "string") {
                        // create new node
                        var node = document.createElement(k);
                        // append to parent
                        $(el).append(node);
                        // pass back
                        createNode(v, node);
                    } else {
                        // pass back
                        createNode(v, el);
                    }
                }
            });
        }

        // create nodes
        createNode(data, parent);

        // return parent node
        return parent;
    };

    window.MediaBox.Addons = Addons;

    window.MediaBox.Plugin = Addons.Plugin;
    window.MediaBox.Theme = Addons.Theme;
})(jQuery);
