WFMediaBox.Theme.add("squeeze", function () {
    return [
        {
            "div": {
                "class": "wf-mediabox-container",
                "content": [
                    {
                        "button": {
                            "class": "wf-mediabox-close",
                            "title": "{{close}}",
                            "aria-label": "{{close}}",
                            "svg-icon": "close:squeeze"
                        }
                    }, {
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
                            "content": [
                                {
                                    "button": {
                                        "class": "wf-mediabox-prev",
                                        "title": "{{previous}}",
                                        "aria-label": "{{previous}}",
                                        "svg-icon": "prev:squeeze"
                                    }
                                },
                                {
                                    "button": {
                                        "class": "wf-mediabox-next",
                                        "title": "{{next}}",
                                        "aria-label": "{{next}}",
                                        "svg-icon": "next:squeeze"
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