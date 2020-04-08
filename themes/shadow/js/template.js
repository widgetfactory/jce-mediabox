WfMediabox.Theme.add("shadow", function () {
    return [
        {
            "div": {
                "class": "wf-mediabox-info-top",
                "content": [
                    {
                        "div": {
                            "class": "wf-mediabox-caption"
                        }
                    }
                ]
            }
        },
        {
            "div": {
                "class": "wf-mediabox-container",
                "content": [
                    {
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
                    }
                ]
            }
        },
        {
            "div": {
                "class": "wf-mediabox-info-bottom",
                "content": [
                    {
                        "div": {
                            "class": "wf-mediabox-nav",
                            "role": "navigation",
                            "content": [
                                {
                                    "span": {
                                        "class": "wf-mediabox-numbers",
                                        "text": "{{numbers}}"
                                    }
                                },
                                {
                                    "button": {
                                        "class": "wf-mediabox-close",
                                        "title": "{{close}}",
                                        "aria-label": "{{close}}"
                                    }
                                },
                                {
                                    "button": {
                                        "class": "wf-mediabox-next",
                                        "title": "{{next}}",
                                        "aria-label": "{{next}}",
                                        "svg-icon": "next:shadow"
                                    }
                                },
                                {
                                    "button": {
                                        "class": "wf-mediabox-prev",
                                        "title": "{{previous}}",
                                        "aria-label": "{{previous}}",
                                        "svg-icon": "prev:shadow"
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