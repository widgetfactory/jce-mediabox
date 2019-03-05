WFMediaBox.Theme.add("shadow", function () {
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
                                        "class": "wf-mediabox-next wf-icon-next-shadow",
                                        "title": "{{next}}",
                                        "aria-label": "{{next}}"
                                    }
                                },
                                {
                                    "button": {
                                        "class": "wf-mediabox-prev wf-icon-prev-shadow",
                                        "title": "{{previous}}",
                                        "aria-label": "{{previous}}"
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