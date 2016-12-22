WFMediaBox.Theme.add("shadow", function() {
    return [{
            "div": {
                "class": "wf-mediabox-info-top",
                "content": [{
                    "div": {
                        "class": "wf-mediabox-caption"
                    }
                }]
            }
        },
        {
            "div": {
                "class": "wf-mediabox-container",
                "content": [{
                        "div": {
                            "class": "wf-mediabox-loader",
                            "content": [{
                                "a": {
                                    "class": "wf-mediabox-cancel",
                                    "title": "{{cancel}}",
                                    "text": "{{cancel}}"
                                }
                            }]
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
                "content": [{
                    "div": {
                        "class": "wf-mediabox-nav",
                        "content": [{
                                "span": {
                                    "class": "wf-mediabox-numbers",
                                    "text": "{{numbers}}"
                                }
                            },
                            {
                                "a": {
                                    "class": "wf-mediabox-close",
                                    "title": "{{close}}"
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
                }]
            }
        }
    ];
});