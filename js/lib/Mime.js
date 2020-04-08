(function() {
    var Mimetype = {

        get: function(c) {
            var ci, cb, mt;

            c = /(director|windowsmedia|mplayer|quicktime|real|divx|flash|pdf)/.exec(c);

            switch (c[1]) {
                case 'director':
                case 'application/x-director':
                    ci = '166b1bca-3f9c-11cf-8075-444553540000';
                    cb = 'http://download.macromedia.com/pub/shockwave/cabs/director/sw.cab#version=8,5,1,0';
                    mt = 'application/x-director';
                    break;
                case 'windowsmedia':
                case 'mplayer':
                case 'application/x-mplayer2':
                    ci = '6bf52a52-394a-11d3-b153-00c04f79faa6';
                    cb = 'http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=5,1,52,701';
                    mt = 'application/x-mplayer2';
                    break;
                case 'quicktime':
                case 'video/quicktime':
                    ci = '02bf25d5-8c17-4b23-bc80-d3488abddc6b';
                    cb = 'http://www.apple.com/qtactivex/qtplugin.cab#version=6,0,2,0';
                    mt = 'video/quicktime';
                    break;
                case 'real':
                case 'realaudio':
                case 'audio/x-pn-realaudio-plugin':
                    ci = 'cfcdaa03-8be4-11cf-b84b-0020afbbccfa';
                    cb = '';
                    mt = 'audio/x-pn-realaudio-plugin';
                    break;
                case 'divx':
                case 'video/divx':
                    ci = '67dabfbf-d0ab-41fa-9c46-cc0f21721616';
                    cb = 'http://go.divx.com/plugin/DivXBrowserPlugin.cab';
                    mt = 'video/divx';
                    break;
                case 'pdf':
                case 'application/pdf':
                    ci = 'ca8a9780-280d-11cf-a24d-444553540000';
                    cb = '';
                    mt = 'application/pdf';
                    break;
                default:
                case 'flash':
                case 'application/x-shockwave-flash':
                    ci = 'd27cdb6e-ae6d-11cf-96b8-444553540000';
                    cb = 'http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,124,0';
                    mt = 'application/x-shockwave-flash';
                    break;
            }
            return {
                'classid'   : ci,
                'codebase'  : cb,
                'mediatype' : mt
            };
        }
    };

    window.WfMediabox.Mimetype = Mimetype;
})();
