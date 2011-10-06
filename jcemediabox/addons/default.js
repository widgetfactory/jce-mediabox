/**
 * @version			$Id: default.js 909 2010-12-03 15:59:40Z happynoodleboy $
 * @package 		JCEMediaBox
 * @url				http://www.joomlacontenteditor.net
 * @copyright 		Copyright (C) 2006-2010 Ryan Demmer. All rights reserved.
 * @license 		http://www.gnu.org/copyleft/gpl.html GNU/GPL 2.0 see licences.txt
 * This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 *
 */
JCEMediaBox.Popup.setAddons('flash', {
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
	 * Youtube - http://www.youtube.com
	 * @param {String} v URL
	 */
	youtube: function(v) {
		if (/youtube(.+)\/(.+)/.test(v)) {
			
			if(/v=/g.test(v)){
				s = v.replace(/(.+)v=([^&\/]+)/g, 'v/$2');
			} else {
				s = 'v' + v.substring(v.lastIndexOf('/'));
			}
			
			return {
				width: 425,
				height: 350,
				type: 'flash',
				'wmode': 'opaque',
				'src': v.replace(/(youtube([^\/]+)\/)(.+)/, function(a, b){
						return b + s;
				})
			};
		}
	},
	/**
	 * Metacafe - http://www.metacafe.com
	 * @param {String} v URL
	 */
	metacafe: function(v) {
		if (/metacafe(.+)\/(watch|fplayer)\/(.+)/.test(v)) {
			var s = JCEMediaBox.trim(v);
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
			var s = JCEMediaBox.trim(v);
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
	},
	/**
	 * Vimeo - http://www.vimeo.com
	 * @param {String} v URL
	 */
	vimeo: function(v) {
		if (/vimeo.com\/([0-9]+)/.test(v)) {
			return {
				width: 400,
				height: 320,
				type: 'flash',
				'wmode': 'opaque',
				'src': v.replace(/vimeo.com\/([0-9]+)/, 'vimeo.com/moogaloop.swf?clip_id=$1')
			};
		}
	},
	/**
	 * Twitvid - http://www.twitvid.com
	 * @param {String} v URL
	 */
	twitvid: function(v) {
		if (/twitvid(.+)\/(.+)/.test(v)) {
			
			var s = 'http://www.twitvid.com/player/';
			
			return {
				width: 425,
				height: 344,
				type: 'flash',
				'allowFullScreen' : true,
				'allowscriptaccess' : 'always',
				'allowNetworking' : 'all',
				'wmode': 'transparent',
				'src': v.replace(/(.+)twitvid([^\/]+)\/(.+)/, function(a, b, c, d){
					return s + d;
				})
			};
		}
	}
});
JCEMediaBox.Popup.setAddons('image', {
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
