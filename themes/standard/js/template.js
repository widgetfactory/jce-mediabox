;(function($) {
    $('.wf-mediabox').on('wf-mediabox:template', function() {
        
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
                                    "div" : {
                                        "class" : "wf-mediabox-content-item"
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
                                        "class": "wf-mediabox-close wf-icon-close-standard",
                                        "title": "{{close}}",
                                        "aria-label": "{{close}}"
                                    }
                                },
                                {
                                    "button": {
                                        "class": "wf-mediabox-prev wf-icon-prev-standard",
                                        "title": "{{previous}}",
                                        "aria-label": "{{previous}}"
                                    }
                                },
                                {
                                    "button": {
                                        "class": "wf-mediabox-next wf-icon-next-standard",
                                        "title": "{{next}}",
                                        "aria-label": "{{next}}"
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