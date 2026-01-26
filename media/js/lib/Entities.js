var entities = {
    '\"': '&quot;',
    "'": '&#39;',
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;'
};

const encode = function (str) {
    return ('' + str).replace(/[<>&\"\']/g, function (c) {
        return entities[c] || c;
    });
};

const decode = function (str) {
    var el;

    // try decode encoded URI
    try {
        str = decodeURIComponent(str);
    } catch (e) { }

    el = document.createElement("div");
    el.innerHTML = str;

    return el.innerHTML || str;
}


export default {
    encode,
    decode
};