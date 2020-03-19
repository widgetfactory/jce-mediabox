; (function ($) {
    $('.wf-mediabox').on('wf-mediabox:template', function () {

    });
})(jQuery);

WFMediaBox.Theme.add("standard", function () {
    return [
        {
            "div": {
                "class": "wf-mediabox-container",
                "content": [{
                    "div": {
                        "class": "wf-mediabox-content",
                        "content": [
                            {
                                "div": {
                                    "class": "wf-mediabox-content-item"
                                }
                            }
                        ]
                    }
                },
                {
                    "div": {
                        "class": "wf-mediabox-caption"
                    }
                },
                {
                    "nav": {
                        "class": "wf-mediabox-nav",
                        "role": "navigation",
                        "content": [{
                            "button": {
                                "class": "wf-mediabox-close",
                                "title": "{{close}}",
                                "aria-label": "{{close}}",
                                "svg-icon": "close:standard"
                            }
                        },
                        {
                            "button": {
                                "class": "wf-mediabox-prev",
                                "title": "{{previous}}",
                                "aria-label": "{{previous}}",
                                "svg-icon": "prev:standard"
                            }
                        },
                        {
                            "button": {
                                "class": "wf-mediabox-next",
                                "title": "{{next}}",
                                "aria-label": "{{next}}",
                                "svg-icon": "next:standard"
                            }
                        },
                        {
                            "span": {
                                "class": "wf-mediabox-numbers",
                                "text": "{{numbers}}"
                            }
                        }
                        ]
                    }
                }
                ]
            }
        }
    ];
});