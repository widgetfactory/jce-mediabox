WFMediaBox.Theme.add("squeeze", function () {
    return [
        {
            "div": {
                "class": "wf-mediabox-container",
                "content": [
                    {
                        "a": {
                            "class": "wf-mediabox-close wf-icon-close-squeeze",
                            "href": "#",
                            "title": "{{close}}"
                        }
                    },
                    {
                        "div": {
                            "class": "wf-mediabox-loader"
                        }
                    },
                    {
                        "div": {
                            "class": "wf-mediabox-content"
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
                            "class": "wf-mediabox-caption"
                        }
                    },
                    {
                        "div": {
                            "class": "wf-mediabox-nav",
                            "content": [
                                {
                                    "a": {
                                        "class": "wf-mediabox-prev wf-icon-prev-squeeze",
                                        "href": "#",
                                        "title": "{{previous}}"
                                    }
                                },
                                {
                                    "a": {
                                        "class": "wf-mediabox-next wf-icon-next-squeeze",
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
    ];
});
