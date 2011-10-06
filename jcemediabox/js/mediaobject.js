/**
 * Media Object 	@@version@@
 *
 * @version 		$Id: mediaobject.js 909 2010-12-03 15:59:40Z happynoodleboy $
 * @package 		JCE MediaBox
 * @copyright 		Copyright (C) 2007-2009 Ryan Demmer. All rights reserved.
 * @license 		http://www.gnu.org/copyleft/gpl.html GNU/GPL 2.0
 * This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 * Based on the Moxiecode Embed script
 *
 */
var JCEMediaObject = {
    version: {
        'flash': '10,0,22,87',
        'windowsmedia': '5,1,52,701',
        'quicktime': '6,0,2,0',
        'realmedia': '7,0,0,0',
        'shockwave': '8,5,1,0'
    },
    init: function(base, v) {
        var t = this;
        
        this.base = base;
        
        for (n in v) {
            t.version[n] = v[n];
        }
    },
    /**
     * Get the Site Base URL
     * @method getSite
     * @return {String} Site Base URL
     */
    getSite: function() {
        var base = this.base;
        
        if (base) {
            // Get document location
            var site = document.location.href;
            // Split into port (http) and location
            var parts = site.split(':\/\/');
            
            var port = parts[0];
            var url = parts[1];
            
            // Get url part before base
            if (url.indexOf(base) != -1) {
                url = url.substr(0, url.indexOf(base));
                // Get url part before first slash
            } else {
                url = url.substr(0, url.indexOf('/')) || url;
            }
            // Return full url
            return port + '://' + url + base;
        }
        // Can't get site URL!
        return '';
    },
    writeObject: function(cls, cb, mt, p) {
        var h = '', n;
        var msie = /msie/i.test(navigator.userAgent);
        var webkit = /webkit/i.test(navigator.userAgent);
        
        if (!/:\/\//.test(p.src)) {
            p.src = this.getSite() + p.src;
            if (mt == 'video/x-ms-wmv') {
                p.url = p.src;
            }
        }
        h += '<object ';
        if (mt == 'application/x-shockwave-flash' && !msie) {
            h += 'type="' + mt + '" data="' + p.src + '" ';
        } else {
            h += 'classid="clsid:' + cls + '" ';
			if (cb) {
				h += 'codebase="' + cb + '" ';
			}
        }
        for (n in p) {
            if (p[n] !== '') {
                if (/(id|name|width|height|style)$/.test(n)) {
                    h += n + '="' + p[n] + '"';
                }
            }
        }
        h += '>';
        for (n in p) {
            if (p[n] !== '') {
                if (!/(id|name|width|height|style)$/.test(n)) {
                    h += '<param name="' + n + '" value="' + p[n] + '">';
                }
            }
        }
        if (!msie && mt != 'application/x-shockwave-flash') {
            h += '<embed type="' + mt + '" src="' + p.src + '"';
            for (n in p) {
                if (p[n] !== '') {
                    h += n + '="' + p[n] + '"';
                }
            }
            h += '></embed>';
        }
        h += '</object>';
        document.write(h);
    },
	video : function(p) {		
		var h = '<video src="' + p.src + '"';
        for (n in p) {
            if (p[n] !== '') {
                h += n + '="' + p[n] + '"';
            }
        }
        h += '>Your browser does not yet support the video element</video>';
		document.write(h);
	},
	audio : function(p) {
		var h = '<audio src="' + p.src + '"';
        for (n in p) {
            if (p[n] !== '') {
                h += n + '="' + p[n] + '"';
            }
        }
        h += '>Your browser does not yet support the audio element</audio>';
		document.write(h);
	},
    flash: function(p) {
        if (typeof p.wmode == 'undefined') {
            p['wmode'] = 'opaque';
        }
        this.writeObject('D27CDB6E-AE6D-11cf-96B8-444553540000', 'http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=' + this.version['flash'], 'application/x-shockwave-flash', p);
    },
    shockwave: function(p) {
        this.writeObject('166B1BCA-3F9C-11CF-8075-444553540000', 'http://download.macromedia.com/pub/shockwave/cabs/director/sw.cab#version=' + this.version['shockwave'], 'application/x-director', p);
    },
    quicktime: function(p) {
        this.writeObject('02BF25D5-8C17-4B23-BC80-D3488ABDDC6B', 'http://www.apple.com/qtactivex/qtplugin.cab#version=' + this.version['quicktime'], 'video/quicktime', p);
    },
    realmedia: function(p) {
        this.writeObject('CFCDAA03-8BE4-11CF-B84B-0020AFBBCCFA', '', 'audio/x-pn-realaudio-plugin', p);
    },
    windowsmedia: function(p) {
        p.url = p.src;
        this.writeObject('6BF52A52-394A-11D3-B153-00C04F79FAA6', 'http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=' + this.version['windowsmedia'], 'video/x-ms-wmv', p);
    },
    divx: function(p) {
        this.writeObject('67DABFBF-D0AB-41FA-9C46-CC0F21721616', 'http://go.divx.com/plugin/DivXBrowserPlugin.cab', 'video/divx', p);
    }
};
function writeFlash(p) {
    JCEMediaObject.flash(p);
};

function writeShockWave(p) {
    JCEMediaObject.shockwave(p);
};

function writeQuickTime(p) {
    JCEMediaObject.quicktime(p);
};

function writeRealMedia(p) {
    JCEMediaObject.realmedia(p);
};

function writeWindowsMedia(p) {
    JCEMediaObject.windowsmedia(p);
};

function writeDivX(p) {
    JCEMediaObject.divx(p);
};