sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/UIComponent",
    "coasapui5task1jc/model/formater"  
], function (Controller, Filter, FilterOperator, UIComponent, NumberFormatter) {
    "use strict";

    return Controller.extend("coasapui5task1jc.controller.Home", {
        
        formatter: NumberFormatter,

        onInit: function () {
    
            var oModel = this.getOwnerComponent().getModel("EmployeeV2Model");
            if (oModel) {
                oModel.setProperty("/tableLoading", true);
                
                setTimeout(function() {
                    oModel.setProperty("/tableLoading", false);
                }, 1000);
            }
        },

        onEmployeeSelect: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("listItem");
            if (oSelectedItem) {
                var oBindingContext = oSelectedItem.getBindingContext("EmployeeV2Model");
                var nEmployeeId = oBindingContext.getProperty("id");
                var oRouter = UIComponent.getRouterFor(this);
                oRouter.navTo("employee", {
                    employeeId: nEmployeeId.toString(),
                });
            }
        },

        onEmployeePress: function (oEvent) {
            var oBindingContext = oEvent
                .getSource()
                .getBindingContext("EmployeeV2Model");
            var nEmployeeId = oBindingContext.getProperty("id");

            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("employee", {
                employeeId: nEmployeeId.toString(),
            });
        },

        onFilterEmployees: function (oEvent) {
            var oModel = this.getOwnerComponent().getModel("EmployeeV2Model");
            if (oModel) {
                oModel.setProperty("/tableLoading", true);
            }
            
            var sQuery = oEvent.getParameter("newValue") || oEvent.getParameter("query");
            var oTable = this.byId("employeeTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];
            
            if (sQuery && sQuery.length > 0) {
                var oFilterName = new Filter("name", FilterOperator.Contains, sQuery);
                var oFilterRole = new Filter("role", FilterOperator.Contains, sQuery);
                
                var aAllFilters = [oFilterName, oFilterRole];
                
                // For numeric ID, only use exact match if the query is a valid number
                if (!isNaN(sQuery) && sQuery.trim() !== "") {
                    var oFilterId = new Filter("id", FilterOperator.EQ, parseInt(sQuery, 10));
                    aAllFilters.push(oFilterId);
                }
                
                var oCombinedFilter = new Filter({
                    filters: aAllFilters,
                    and: false
                });
                
                aFilters.push(oCombinedFilter);
            }
            
            oBinding.filter(aFilters);
            
            // Simulate a loading State for 1 sec
            setTimeout(function() {
                if (oModel) {
                    oModel.setProperty("/tableLoading", false);
                }
            }, 1000);
        }
    });
});