WFMediaBox.Theme.add("uikit", function () {
    return [{
        "div": {
            "class": "wf-mediabox-container uk-modal-dialog uk-modal-dialog-lightbox uk-slidenav-position",
            "content": [{
                    "a": {
                        "class": "wf-mediabox-close uk-modal-close uk-close uk-close-alt",
                        "role": "button",
                        "title": "{{close}}",
                        "aria-label": "{{close}}"
                    }
                },
                {
                    "div": {
                        "class": "wf-mediabox-content uk-lightbox-content",
                        "content": [{
                            "nav": {
                                "role": "navigation",
                                "class": "wf-mediabox-nav",
                                "content": [{
                                        "a": {
                                            "class": "wf-mediabox-prev uk-slidenav uk-slidenav-contrast uk-slidenav-previous uk-hidden-touch",
                                            "title": "{{previous}}",
                                            "aria-label": "{{previous}}",
                                            "role": "button"
                                        }
                                    },
                                    {
                                        "a": {
                                            "class": "wf-mediabox-next uk-slidenav uk-slidenav-contrast uk-slidenav-next uk-hidden-touch",
                                            "title": "{{next}}",
                                            "aria-label": "{{next}}",
                                            "role": "button"
                                        }
                                    }
                                ]
                            },
                            "div": {
                                "class" : "wf-mediabox-content-item"
                            }
                        }]
                    }
                },
                {
                    "div": {
                        "class": "wf-mediabox-caption uk-modal-caption"
                    }
                }
            ]
        }
    }];
});