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
                                        "class": "wf-mediabox-close wf-icon-close-standard",
                                        "href": "#",
                                        "title": "{{close}}"
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
                                                    "class": "wf-mediabox-prev wf-icon-prev-standard",
                                                    "href": "#",
                                                    "title": "{{previous}}"
                                                }
                                            },
                                            {
                                                "a": {
                                                    "class": "wf-mediabox-next wf-icon-next-standard",
                                                    "href": "#",
                                                    "title": "{{next}}"
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
