define("mediabox/util/Entities", [], function() {

    var entities = {
        '\"': '&quot;',
        "'": '&#39;',
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;'
    };

    return {
        encode: function(s) {
            return ('' + s).replace(/[<>&\"\']/g, function(c) {
                return entities[c] || c;
            });
        },
        decode: function(s) {
            var el;

            el = document.createElement("div");
            el.innerHTML = s;

            return el.textContent || el.innerText || s;
        }
    };
});