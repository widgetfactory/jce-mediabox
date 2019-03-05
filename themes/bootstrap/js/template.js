WFMediaBox.Theme.add("bootstrap", function () {
    return [{
        "div": {
            "class": "wf-mediabox-container modal",
            "content": [{
                "div": {
                    "class": "modal-header",
                    "content": [{
                        "button": {
                            "type": "button",
                            "class": "close wf-mediabox-close",
                            "title": "{{close}}",
                            "aria-label": "{{close}}",
                            "content": [{
                                "span": {
                                    "aria-hidden": "true",
                                    "text": "&times;"
                                }
                            }]
                        },
                        "div": {
                            "class": "wf-mediabox-caption"
                        }
                    }]
                },
            }, {

                "div": {
                    "class": "wf-mediabox-content",
                    "content": [{
                        "nav": {
                            "class": "wf-mediabox-nav modal-body carousel",
                            "role": "navigation",
                            "content": [{
                                    "a": {
                                        "role": "button",
                                        "class": "left carousel-control wf-mediabox-prev",
                                        "title": "{{previous}}",
                                        "aria-label": "{{previous}}",
                                        "content": [{
                                            "span": {
                                                "aria-hidden": "true",
                                                "class": "glyphicon glyphicon-chevron-left"
                                            }
                                        }]
                                    }
                                },
                                {
                                    "a": {
                                        "role": "button",
                                        "class": "right carousel-control wf-mediabox-next",
                                        "title": "{{next}}",
                                        "aria-label": "{{next}}",
                                        "content": [{
                                            "span": {
                                                "aria-hidden": "true",
                                                "class": "glyphicon glyphicon-chevron-right"
                                            }
                                        }]
                                    }
                                }
                            ]
                        },
                        "div": {
                            "class": "wf-mediabox-content-item"
                        }
                    }]
                }
            }]
        }
    }];
});