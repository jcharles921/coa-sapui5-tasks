sap.ui.define([
    "sap/ui/core/UIComponent"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("coasapui5task1jc.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            UIComponent.prototype.init.apply(this, arguments);
            this.getRouter().initialize();
        }
    });
});