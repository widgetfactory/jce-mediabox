(function() {
    // https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Storage
    if (!window.sessionStorage) {
        window.sessionStorage = {
            getItem: function(sKey) {
                if (!sKey || !this.hasOwnProperty(sKey)) {
                    return null;
                }
                return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
            },
            key: function(nKeyId) {
                return unescape(document.cookie.replace(/\s*\=(?:.(?!;))*$/, "").split(/\s*\=(?:[^;](?!;))*[^;]?;\s*/)[nKeyId]);
            },
            setItem: function(sKey, sValue) {
                if (!sKey) {
                    return;
                }
                document.cookie = escape(sKey) + "=" + escape(sValue) + "; path=/";
                this.length = document.cookie.match(/\=/g).length;
            },
            length: 0,
            removeItem: function(sKey) {
                if (!sKey || !this.hasOwnProperty(sKey)) {
                    return;
                }
                document.cookie = escape(sKey) + "=; path=/";
                this.length--;
            },
            hasOwnProperty: function(sKey) {
                return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
            }
        };
        window.sessionStorage.length = (document.cookie.match(/\=/g) || window.sessionStorage).length;
    }

    var Storage = {
        /**
         * Gets the raw data from sessionStorage by name.
         *
         * @method get
         * @param {String} n Name of sessionStorage item to retrive.
         * @return {String} sessionStorage data string.
         */
        get: function(n) {
            return sessionStorage.getItem(n);
        },
        /**
         * Sets a raw sessionStorage item.
         *
         * @method set
         * @param {String} n Name of the sessionStorage item.
         * @param {String} v Raw sessionStorage data.
         */
        set: function(n, v) {
            return sessionStorage.setItem(n, v);
        }
    };

    window.MediaBox.Storage = Storage;
})();
