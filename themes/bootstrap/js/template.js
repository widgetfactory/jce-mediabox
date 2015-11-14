WFMediaBox.Theme.add("bootstrap", function () {
    return [
        {
            "div": {
                "class": "wf-mediabox-container modal",
                "content": [
                    {
                        "div": {
                            "class": "wf-mediabox-loader"
                        }
                    },
                    {
                        "div": {
                            "class": "modal-header",
                            "content": [
                                {
                                    "button": {
                                        "type": "button",
                                        "class": "close wf-mediabox-close",
                                        "text": "&times;"
                                    },
                                    "h3": {
                                        "class": "wf-mediabox-caption"
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "div": {
                            "class": "wf-mediabox-content modal-body carousel",
                            "content" : [
                                {
                                    "a": {
                                        "class": "left carousel-control wf-mediabox-prev",
                                        "href": "#",
                                        "text": "&lsaquo;"
                                    }
                                },
                                {
                                    "a": {
                                        "class": "right carousel-control wf-mediabox-next",
                                        "href": "#",
                                        "text": "&rsaquo;"
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