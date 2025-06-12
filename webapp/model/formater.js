sap.ui.define([], function () {
    "use strict";

    return {
        formatCurrency: function (value) {
            if (!value || isNaN(value)) {
                return "$0";
            }        
            const numValue = typeof value === "string" ? parseFloat(value) : value;
            return "$" + numValue.toLocaleString("en-US", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
        }
    };
});