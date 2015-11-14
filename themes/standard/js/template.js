WFMediaBox.Theme.add("standard", function () {
    return [
        {
            "div": {
                "class": "wf-mediabox-container",
                "content": [
                    {
                        "div": {
                            "class": "wf-mediabox-loader"
                        }
                    },
                    {
                        "div": {
                            "class": "wf-mediabox-content",
                            "content": ""
                        }
                    },
                    {
                        "div": {
                            "class": "wf-mediabox-info-bottom",
                            "content": [
                                {
                                    "a": {
                                        "class": "wf-mediabox-close wf-icon-close",
                                        "href": "#",
                                        "title": "{{close}}",
                                        "text": ""
                                    }
                                },
                                {
                                    "div": {
                                        "class": "wf-mediabox-caption"
                                    }
                                },
                                {
                                    "div": {
                                        "class": "wf-mediabox-nav",
                                        "content": [
                                            {
                                                "a": {
                                                    "class": "wf-mediabox-prev wf-icon-prev",
                                                    "href": "#",
                                                    "title": "{{previous}}",
                                                    "text": ""
                                                }
                                            },
                                            {
                                                "a": {
                                                    "class": "wf-mediabox-next wf-icon-next",
                                                    "href": "#",
                                                    "title": "{{next}}",
                                                    "text": ""
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
                ]
            }
        }
    ];
});