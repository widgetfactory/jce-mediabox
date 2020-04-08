(function () {
    var entities = {
        '\"': '&quot;',
        "'": '&#39;',
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;'
    };

    var Entities = {
        encode: function (str) {
            return ('' + str).replace(/[<>&\"\']/g, function (c) {
                return entities[c] || c;
            });
        },
        decode: function (str) {
            var el;

            // try decode encoded URI
            try {
                str = decodeURIComponent(str);
            } catch (e) {}

            el = document.createElement("div");
            el.innerHTML = str;

            return el.innerHTML || str;
        }
    };

    window.WfMediabox.Entities = Entities;
})();