WFMediaBox.Theme.add("standard", function() {
    return [
        {
            "div": {
                "id": "jcemediabox-popup-container",
                "content": [
                    {
                        "div": {
                            "id": "jcemediabox-popup-loader"
                        }
                    },
                    {
                        "div": {
                            "id": "jcemediabox-popup-content",
                            "content": [
                                {
                                    "div": {
                                        "id": "jcemediabox-popup-info-bottom",
                                        "content": [
                                            {
                                                "a": {
                                                    "id": "jcemediabox-popup-closelink",
                                                    "href": "#",
                                                    "title": "{#close}",
                                                    "class": "wf-icon-close",
                                                    "text" : ""
                                                }
                                            },
                                            {
                                                "div": {
                                                    "id": "jcemediabox-popup-caption"
                                                }
                                            },
                                            {
                                                "div": {
                                                    "id": "jcemediabox-popup-nav",
                                                    "content": [
                                                        {
                                                            "a": {
                                                                "id": "jcemediabox-popup-prev",
                                                                "href": "#",
                                                                "title": "{#close}",
                                                                "class": "wf-icon-prev",         
                                                                "text" : ""
                                                            }
                                                        },
                                                        {
                                                            "a": {
                                                                "id": "jcemediabox-popup-next",
                                                                "href": "#",
                                                                "title": "{#close}",
                                                                "class": "wf-icon-next",
                                                                "text": ""
                                                            }
                                                        },
                                                        {
                                                            "span": {
                                                                "id": "jcemediabox-popup-numbers",
                                                                "text": "{$numbers}"
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
                ]
            }
        }
    ];
});