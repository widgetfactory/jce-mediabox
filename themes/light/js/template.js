WFMediaBox.Theme.add("light", function() {
    return [{
            "div": {
                "class": "wf-mediabox-container",
                "content": [{
                        "div": {
                            "class": "wf-mediabox-loader"
                        }
                    },
                    {
                        "div": {
                            "class": "wf-mediabox-content"
                        }
                    },
                    {
                        "a": {
                            "class": "wf-mediabox-next",
                            "title": "{{next}}"
                        }
                    },
                    {
                        "a": {
                            "class": "wf-mediabox-prev",
                            "title": "{{previous}}"
                        }
                    }
                ]
            }
        },
        {
            "div": {
                "class": "wf-mediabox-info-bottom",
                "content": [{
                        "a": {
                            "class": "wf-mediabox-close",
                            "title": "{{close}}",
                            "text": "{{close}}"
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
                            "content": [{
                                "span": {
                                    "class": "wf-mediabox-numbers",
                                    "text": "{{numbers_count}}"
                                }
                            }]
                        }
                    }
                ]
            }
        }
    ];
});