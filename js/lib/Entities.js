(function() {
    var entities = {
        '\"': '&quot;',
        "'": '&#39;',
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;'
    };

    var Entities = {
        encode: function(s) {
            return ('' + s).replace(/[<>&\"\']/g, function(c) {
                return entities[c] || c;
            });
        },
        decode: function(s) {
            var el;

            el = document.createElement("div");
            el.innerHTML = s;

            return el.innerHTML || s;
        }
    };

    window.MediaBox.Entities = Entities;
})();
