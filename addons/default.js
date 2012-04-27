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
(function(mediabox, undefined){
    // don't load if JCEMediaBox class is not defined
    if (mediabox === undefined) {
        return;
    }
	
    // JCEMediaBox.Popup shortcut
    var popup = mediabox.Popup, trim = mediabox.trim;
	
    /**
	 * Flash addons
	 */
    popup.setAddons('flash', {
        /**
		 * Standard Flash object
		 * @param {String} v URL
		 */
        flash : function(v) {
            if (/\.swf\b/.test(v)) {
                return {
                    type: 'flash'
                };
            }
        },
		
        /**
		 * Standard Flash object
		 * @param {String} v URL
		 */
        flv : function(v) {
            if (/\.flv\b/.test(v)) {
                return {
                    type: 'video/x-flv'
                };
            }
        },
		
        /**
		 * Metacafe - http://www.metacafe.com
		 * @param {String} v URL
		 */
        metacafe: function(v) {
            if (/metacafe(.+)\/(watch|fplayer)\/(.+)/.test(v)) {
                var s = trim(v);
                if (!/\.swf/i.test(s)) {
                    if (s.charAt(s.length - 1) == '/') {
                        s = s.substring(0, s.length - 1);
                    }
                    s = s + '.swf';
                }
				
                return {
                    width: 400,
                    height: 345,
                    type: 'flash',
                    attributes: {
                        'wmode': 'opaque',
                        'src': s.replace(/watch/i, 'fplayer')
                    }
                };
            }
        },
        /**
		 * Daily Motion - http://www.dailymotion.com
		 * @param {String} v URL
		 */
        dailymotion: function(v) {
            if (/dailymotion(.+)\/(swf|video)\//.test(v)) {
                var s = trim(v);
                s = s.replace(/_(.*)/, '');
				
                return {
                    width: 420,
                    height: 339,
                    type: 'flash',
                    'wmode': 'opaque',
                    'src': s.replace(/video/i, 'swf')
                };
            }
        },
        /**
		 * Google Video - http://video.google.com
		 * @param {String} v URL
		 */
        googlevideo: function(v) {
            if (/google(.+)\/(videoplay|googleplayer\.swf)\?docid=(.+)/.test(v)) {
                return {
                    width: 425,
                    height: 326,
                    type: 'flash',
                    'id': 'VideoPlayback',
                    'wmode': 'opaque',
                    'src': v.replace(/videoplay/g, 'googleplayer.swf')
                };
            }
        }
    });

    /**
	 * IFrame addons
	 */
    popup.setAddons('iframe', {
        /**
		 * Youtube - http://www.youtube.com
		 * @param {String} v URL
		 */
        youtube: function(v) {
            if (/youtu(\.)?be([^\/]+)?\/(.+)/.test(v)) {
				
                return {
                    width	: 425,
                    height	: 350,
                    type	: 'iframe',
                    'src'	: v.replace(/youtu(\.)?be([^\/]+)?\/(.+)/, function(a, b, c, d) {
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
                };
            }
        },
		
        vimeo: function(v) {
            if (/vimeo\.com\/(video\/)?([0-9]+)/.test(v)) {
                return {
                    width	: 400,
                    height	: 225,
                    type	: 'iframe',
                    'src'	: v.replace(/(player\.)?vimeo\.com\/(video\/)?([0-9]+)/, function(a, b, c, d) {						
                        if (b) {						
                            return a;
                        }
                        return 'player.vimeo.com/video/' + d;
                    })
                };
            }
        },
		
        /**
		 * Twitvid - http://www.twitvid.com
		 * @param {String} v URL
		 */
        twitvid: function(v) {
            if (/twitvid(.+)\/(.+)/.test(v)) {
				
                var s = 'http://www.twitvid.com/embed.php?guid=';
			
                return {
                    width	: 480,
                    height	: 360,
                    type	: 'iframe',
                    'src': v.replace(/(.+)twitvid([^\/]+)\/(.+)/, function(a, b, c, d){
                        if (/embed\.php/.test(d)) {
                            return a;
                        }
						
                        return s + d;
                    })
                };
            }
        }
    });

    /**
	 * Image addons
	 */
    popup.setAddons('image', {
        /**
		 * Stnadard Image types
		 * @param {String} v URL
		 */
        image: function(v) {
            if (/\.(jpg|jpeg|png|gif|bmp|tif)$/i.test(v)) {
                return {
                    type : 'image'
                };
            }
        },
        /**
		 * Twitpic - http://www.twitpic.com
		 * @param {String} v URL
		 */
        twitpic: function(v) {
            if (/twitpic(.+)\/(.+)/.test(v)) {
                return {
                    type : 'image'
                };
            }
        }
    });
})(JCEMediaBox);
