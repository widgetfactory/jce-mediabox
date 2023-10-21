WfMediabox.Theme.add("light", function () {
    return [
        {
            "div": {
                "class": "wf-mediabox-container",
                "content": [
                    {
                        "div": {
                            "class": "wf-mediabox-content",
                            "content": [
                                {
                                    "div": {
                                        "class": "wf-mediabox-content-item"
                                    }
                                },
                                {
                                    "button": {
                                        "class": "wf-mediabox-next",
                                        "title": "{{next}}",
                                        "aria-label": "{{next}}"
                                    }
                                },
                                {
                                    "button": {
                                        "class": "wf-mediabox-prev",
                                        "title": "{{previous}}",
                                        "aria-label": "{{previous}}"
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
                                        "class": "wf-mediabox-close",
                                        "title": "{{close}}",
                                        "aria-label": "{{close}}",
                                        "text": "{{close}}"
                                    }
                                },
                                {
                                    "span": {
                                        "class": "wf-mediabox-numbers",
                                        "text": "{{numbers_count}}"
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