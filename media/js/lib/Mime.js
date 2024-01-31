var lookup = {};
var mimes = {};

// Media types supported by this plugin
var mediaTypes = {
    // Type, clsid, mime types, codebase
    "flash": {
        classid: "CLSID:D27CDB6E-AE6D-11CF-96B8-444553540000",
        type: "application/x-shockwave-flash",
        codebase: "http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=10,1,53,64"
    },
    "shockwave": {
        classid: "CLSID:166B1BCA-3F9C-11CF-8075-444553540000",
        type: "application/x-director",
        codebase: "http://download.macromedia.com/pub/shockwave/cabs/director/sw.cab#version=10,2,0,023"
    },
    "windowsmedia": {
        classid: "CLSID:6BF52A52-394A-11D3-B153-00C04F79FAA6",
        type: "application/x-mplayer2",
        codebase: "http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=10,00,00,3646"
    },
    "quicktime": {
        classid: "CLSID:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B",
        type: "video/quicktime",
        codebase: "http://www.apple.com/qtactivex/qtplugin.cab#version=7,3,0,0"
    },
    "divx": {
        classid: "CLSID:67DABFBF-D0AB-41FA-9C46-CC0F21721616",
        type: "video/divx",
        codebase: "http://go.divx.com/plugin/DivXBrowserPlugin.cab"
    },
    "realmedia": {
        classid: "CLSID:CFCDAA03-8BE4-11CF-B84B-0020AFBBCCFA",
        type: "audio/x-pn-realaudio-plugin"
    },
    "java": {
        classid: "CLSID:8AD9C840-044E-11D1-B3E9-00805F499D93",
        type: "application/x-java-applet",
        codebase: "http://java.sun.com/products/plugin/autodl/jinstall-1_5_0-windows-i586.cab#Version=1,5,0,0"
    },
    "silverlight": {
        classid: "CLSID:DFEAF541-F3E1-4C24-ACAC-99C30715084A",
        type: "application/x-silverlight-2"
    },
    "video": {
        type: 'video/mpeg'
    },
    "audio": {
        type: 'audio/mpeg'
    },
    "iframe": {}
};

// Parses the default mime types string into a mimes lookup map
(function (data) {
    var items = data.split(/,/),
        i, y, ext;

    for (i = 0; i < items.length; i += 2) {
        ext = items[i + 1].split(/ /);

        for (y = 0; y < ext.length; y++) {
            mimes[ext[y]] = items[i];
        }
    }
})(
    "application/x-director,dcr," +
    "video/divx,divx," +
    "application/pdf,pdf," +
    "application/x-shockwave-flash,swf swfl," +
    "audio/mpeg,mpga mpega mp2 mp3," +
    "audio/ogg,ogg spx oga," +
    "audio/x-wav,wav," +
    "video/mpeg,mpeg mpg mpe," +
    "video/mp4,mp4 m4v," +
    "video/ogg,ogg ogv," +
    "video/webm,webm," +
    "video/quicktime,qt mov," +
    "video/x-flv,flv," +
    "video/vnd.rn-realvideo,rv", +
    "video/3gpp,3gp," +
    "video/x-matroska,mkv"
);

for (var key in mediaTypes) {
    let value = mediaTypes[key];

    value.name = key;

    if (value.classid) {
        lookup[value.classid] = value;
    }

    if (value.type) {
        lookup[value.type] = value;
    }

    lookup[key.toLowerCase()] = value;
}

export default {
    props: function (value) {
        return lookup[value] || false;
    },

    guess: function (value) {
        return mimes[value] || false;
    }
};
