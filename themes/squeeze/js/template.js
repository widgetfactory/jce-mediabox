WFMediaBox.Theme.add("squeeze", function () {
    return [
        {
            "div": {
                "class": "wf-mediabox-container",
                "content": [{
                    "button": {
                        "class": "wf-mediabox-close wf-icon-close-squeeze",
                        "title": "{{close}}",
                        "aria-label": "{{close}}"
                    }
                },{
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
                            "content": [
                                {
                                    "button": {
                                        "class": "wf-mediabox-prev wf-icon-prev-squeeze",
                                        "title": "{{previous}}",
                                        "aria-label": "{{previous}}"
                                    }
                                },
                                {
                                    "button": {
                                        "class": "wf-mediabox-next wf-icon-next-squeeze",
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