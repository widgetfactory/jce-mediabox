(function($, Parameter) {
    var Convert = {
        /**
         * Convert legacy popups to new format
         */
        legacy: function() {
            $('a[href]').each(function() {

                // Only JCE Popup links
                if (/com_jce/.test(this.href)) {
                    var p, s, img;
                    var oc = $(this).attr('onclick');
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

                        $(this).attr({
                            'href': img,
                            'title': title.replace(/_/, ' '),
                            'onclick': ''
                        });

                        $(this).addClass('jcepopup');
                    }
                }
            });
        },
        /**
         * Convert lightbox popups to MediaBox
         */
        lightbox: function() {
            $('a[rel*=lightbox]').addClass('jcepopup').each(function() {
                var r = this.rel.replace(/lightbox\[?([^\]]*)\]?/, function(a, b) {
                    if (b) {
                        return 'group[' + b + ']';
                    }
                    return '';
                });

                $(this).attr('rel', r);
            });

        },
        /**
         * Convert shadowbox popups to MediaBox
         */
        shadowbox: function() {

            $('a[rel*=shadowbox]').addClass('jcepopup').each(function() {
                var r = this.rel.replace(/shadowbox\[?([^\]]*)\]?/, function(a, b) {
                    var attribs = '', group = '';
                    // group
                    if (b) {
                        group = 'group[' + b + ']';
                    }
                    // attributes
                    if (/;=/.test(a)) {
                        attribs = a.replace(/=([^;"]+)/g, function(x, z) {
                            return '[' + z + ']';
                        });

                    }
                    if (group && attribs) {
                        return group + ';' + attribs;
                    }
                    return group || attribs || '';
                });

                $(this).attr('rel', r);
            });

        }
    };

    window.MediaBox.Convert = Convert;
})(jQuery, MediaBox.Parameter);
