WFMediaBox.Theme.add("uikit", function() {
    return [{
        "div": {
            "class": "wf-mediabox-container uk-modal-dialog uk-modal-dialog-lightbox uk-slidenav-position",
            "content": [{
                    "a": {
                        "class": "wf-mediabox-close uk-modal-close uk-close uk-close-alt"
                    }
                },
                {
                    "div": {
                        "class": "wf-mediabox-content uk-lightbox-content",
                        "content": [{
                                "a": {
                                    "class": "wf-mediabox-prev uk-slidenav uk-slidenav-contrast uk-slidenav-previous uk-hidden-touch"
                                }
                            },
                            {
                                "a": {
                                    "class": "wf-mediabox-next uk-slidenav uk-slidenav-contrast uk-slidenav-next uk-hidden-touch"
                                }
                            }
                        ]
                    }
                },
                {
                    "div": {
                        "class": "uk-modal-spinner wf-mediabox-loader"
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