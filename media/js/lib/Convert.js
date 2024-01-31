var Convert = {
    /**
     * Convert legacy popups to new format
     */
    legacy: function () {
        const nodes = document.querySelectorAll('a[href]');

        nodes.forEach(function (elm) {
            // Only JCE Popup links
            if (/com_jce/.test(elm.href)) {
                var p, s, img;

                var oc = elm.getAttribute('onclick');

                if (oc) {
                    s = oc.replace(/&#39;/g, "'").split("'");
                    p = Parameter.parse(s[1]);

                    var img = p.img || '';
                    var title = p.title || '';
                }

                if (img) {
                    if (!/http:\/\//.test(img)) {
                        if (img.charAt(0) === '/') {
                            img = img.substr(1);
                        }
                        img = JCEMediaBox.site.replace(/http:\/\/([^\/]+)/, '') + img;
                    }

                    elm.setAttribute('href', img);
                    elm.setAttribute('title', title.replace(/_/, ' '));
                    elm.setAttribute('onclick', '');

                    elm.classList.add('jcepopup');
                }
            }
        });
    },
    /**
     * Convert lightbox popups to MediaBox
     */
    lightbox: function () {
        var nodes = document.querySelectorAll('a[rel*=lightbox]');

        nodes.forEach(function (elm) {
            elm.classList.add('jcepopup');

            let rel = elm.getAttribute('rel');

            rel = rel.replace(/lightbox\[?([^\]]*)\]?/, function (a, b) {
                if (b) {
                    return 'group[' + b + ']';
                }
                return '';
            });

            elm.setAttribute('rel', rel);
        });
    },
    /**
     * Convert shadowbox popups to MediaBox
     */
    shadowbox: function () {
        var nodes = document.querySelectorAll('a[rel*=shadowbox]');

        nodes.forEach(function (elm) {
            elm.classList.add('jcepopup');

            let rel = elm.getAttribute('rel');

            rel = rel.replace(/shadowbox\[?([^\]]*)\]?/, function (a, b) {
                if (b) {
                    return 'group[' + b + ']';
                }
                return '';
            });

            elm.setAttribute('rel', rel);
        });
    }
};
export default Convert;