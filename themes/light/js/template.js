WFMediaBox.Theme.add("light", function () {
    return [
    {
        "div": {
            "id": "wf-mediabox-container",
            "content": [
                {
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
                        "href": "#",
                        "title": "{{next}}",
                        "text": "&raquo;"
                    }
                },
                {
                    "a": {
                        "class": "wf-mediabox-prev",
                        "href": "#",
                        "title": "{{previous}}",
                        "text": "&laquo;"
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
                        "a": {
                            "class": "wf-mediabox-close",
                            "href": "#",
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
                            "content": [
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