/**
 * JCEMediaBox Addons 	@@version@@
 * @package             JCEMediaBox
 * @url			http://www.joomlacontenteditor.net
 * @copyright           @@copyright@@
 * @license 		@@licence@@
 * @date		@@date@@
 * This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 *
 */
WFMediaBox.Plugin.add('flash', function(v) {
    this.attributes = {
        type        : 'application/x-shockwave-flash',
        classid     : 'd27cdb6e-ae6d-11cf-96b8-444553540000',
        codebase    : 'http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,124,0',
        wmode       : 'transparent'
    };

    this.is = function() {return /\.swf\b/.test(v);}
});
WFMediaBox.Plugin.add('flv', function(v) {
    this.attributes = {
        type: 'video/x-flv'
    };

    this.is = function() {return /\.flv\b/.test(v);}
});
/*WFMediaBox.Plugin.add('metacafe', function(v) {
    this.attributes = {

            return {
                width: 400,
                height: 345,
                type: 'flash',
                attributes: {
                    'wmode': 'opaque',
                    'src': (function() {
                        s.replace(/watch/i, 'fplayer');
                    })();
                }
            };
        }
        
        return /metacafe(.+)\/(watch|fplayer)\/(.+)/.test(v);
});*/
/**
 * Daily Motion - http://www.dailymotion.com
 * @param {String} v URL
 */
WFMediaBox.Plugin.add('dailymotion', function(v) {
    var self = this;

    self.is = function() {
        return /dailymotion(.+)\/(swf|video)\//.test(v);
    }

    function processURL(s) {
        if (self.is()) {
            s = trim(s);
            s = s.replace(/_(.*)/, '');
            s = s.replace(/video/i, 'swf');
        }

        return s;
    }

    self.attributes = {
        width: 420,
        height: 339,
        type: 'flash',
        'wmode': 'opaque',
        'src': processURL(v)
    }
});
WFMediaBox.Plugin.add('quicktime', function(v) {
    this.attributes = {
        classid: '02bf25d5-8c17-4b23-bc80-d3488abddc6b',
        codebase: 'http://www.apple.com/qtactivex/qtplugin.cab#version=6,0,2,0',
        type: 'video/quicktime'
    };

    this.is = function() {return /\.mov\b/.test(v);}
});
/**
 * Youtube - http://www.youtube.com
 * @param {String} v URL
 */
WFMediaBox.Plugin.add('youtube', function(v) {
    var self = this;
    
    self.is = function() {
        return /youtu(\.)?be([^\/]+)?\/(.+)/.test(v);
    }

    function processURL(v) {
        if (self.is()) {
            v.replace(/youtu(\.)?be([^\/]+)?\/(.+)/, function(a, b, c, d) {
                var query = '';
                if (/watch\?/.test(d)) {
                    // remove watch?
                    d = d.replace(/watch\?/, '');
                    // get query arguments
                    var args = JCEMediaBox.Popup.params(d);
                    // set video id
                    query += args.v;
                    delete args.v;
                    for (k in args) {
                        query += (((/\?/.test(query)) ? '&' : '?') + k + '=' + args[k]);
                    }

                } else {
                    query = d.replace(/embed\//, '');
                }

                if (b && !c) {
                    c = '.com';
                }

                if (!/wmode/.test(query)) {
                    query += /\?/.test(query) ? '&wmode=opaque' : '?wmode=opaque';
                }

                return 'youtube' + c + '/embed/' + query;
                // add www (required by iOS ??)
            }).replace(/\/\/youtube/i, '//www.youtube')
        }

        return v;
    }

    this.attributes = {
        width: 425,
        height: 350,
        type: 'iframe',
        src: processURL(v)
    };
});
WFMediaBox.Plugin.add('vimeo', function(v) {
    
    this.is = function() {return /vimeo\.com\/(video\/)?([0-9]+)/.test(v);}
    
    this.attributes = {
        width: 400,
        height: 225,
        type: 'iframe',
        src: v.replace(/(player\.)?vimeo\.com\/(video\/)?([0-9]+)/, function(a, b, c, d) {
            if (b) {
                return a;
            }
            return 'player.vimeo.com/video/' + d;
        })
    };
});
/**
 * Image
 */
WFMediaBox.Plugin.add('image', function(v) {
    this.attributes = {type: 'image'};
    this.is = function() {return /\.(jpg|jpeg|png|gif|bmp|tif)$/i.test(v);}
});
/**
 * Twitpic - http://www.twitpic.com
 */
WFMediaBox.Plugin.add('twitpic', function(v) {
    this.attributes = {type: 'image'};

    this.is = function() {return /twitpic(.+)\/(.+)/.test(v);}
});