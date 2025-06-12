sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/core/routing/History",
    "coasapui5task1jc/model/formater"  
], function (Controller, UIComponent, History, NumberFormatter) {
    "use strict";

    return Controller.extend("coasapui5task1jc.controller.Employee", {
        
        formatter: NumberFormatter,

        onInit: function () {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter
                .getRoute("employee")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            var sEmployeeId = oEvent.getParameter("arguments").employeeId;
            var nEmployeeId = parseInt(sEmployeeId, 10);
            var oModel = this.getView().getModel("EmployeeV2Model");
            var aEmployees = oModel.getProperty("/employeeData");
            var iEmployeeIndex = -1;

            if (aEmployees) {
                for (var i = 0; i < aEmployees.length; i++) {
                    if (aEmployees[i].id === nEmployeeId) {
                        iEmployeeIndex = i;
                        break;
                    }
                }
            }

            if (iEmployeeIndex !== -1) {
                this.getView().bindElement({
                    path: "/employeeData/" + iEmployeeIndex,
                    model: "EmployeeV2Model",
                });
            } else {
                console.error("Employee with ID " + sEmployeeId + " not found");
                this.onNavBack();
            }
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = UIComponent.getRouterFor(this);
                oRouter.navTo("home", {}, true);
            }
        }
    });
});