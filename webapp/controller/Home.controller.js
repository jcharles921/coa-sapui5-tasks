sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/UIComponent",
    "coasapui5task1jc/model/formater",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/ValueState"
], function (Controller, Filter, FilterOperator, UIComponent, NumberFormatter, Fragment, MessageToast, JSONModel, ValueState) {
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
        
        openDialog: function (oEvent) {
            var oView = this.getView();
            
            var oDialogModel = new JSONModel({
                title: "Add New Employee",
                saveButtonText: "Add Employee",
                showId: false,
                employee: {
                    id: null,
                    name: "",
                    role: "",
                    salary: ""
                },
                validation: {
                    nameState: "None",
                    nameStateText: "",
                    roleState: "None",
                    roleStateText: "",
                    salaryState: "None",
                    salaryStateText: ""
                }
            });
            
            if (!this._oAddDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "coasapui5task1jc.view.fragments.EmployeeDialog",
                    controller: this
                }).then(function (oDialog) {
                    this._oAddDialog = oDialog;
                    oView.addDependent(this._oAddDialog);
                    this._oAddDialog.setModel(oDialogModel, "dialogModel");
                    this._oAddDialog.open();
                }.bind(this));
            } else {
              
                this._oAddDialog.setModel(oDialogModel, "dialogModel");
                this._oAddDialog.open();
            }
        },

        onSaveEmployee: function () {
            var oDialogModel = this._oAddDialog.getModel("dialogModel");
            var oEmployeeData = oDialogModel.getProperty("/employee");
            
            // Validate the form
            if (!this._validateEmployeeForm(oDialogModel)) {
                return;
            }
            
            // Get the model and current data
            var oModel = this.getOwnerComponent().getModel("EmployeeV2Model");
            var aEmployeeData = oModel.getProperty("/employeeData") || [];
            
           
            var nNewId = aEmployeeData.length > 0 ? 
                Math.max.apply(Math, aEmployeeData.map(function(emp) { return emp.id; })) + 1 : 1;
            
           
            var oNewEmployee = {
                id: nNewId,
                name: oEmployeeData.name.trim(),
                role: oEmployeeData.role.trim(),
                salary: parseFloat(oEmployeeData.salary)
            };
            
            // Add to array
            aEmployeeData.push(oNewEmployee);
            oModel.setProperty("/employeeData", aEmployeeData);
            
           
            MessageToast.show("Employee '" + oNewEmployee.name + "' added successfully!");
            
            // Close dialog
            this._oAddDialog.close();
        },

        onCancelDialog: function () {
            if (this._oAddDialog) {
                this._oAddDialog.close();
            }
        },

        _validateEmployeeForm: function (oDialogModel) {
            var oEmployee = oDialogModel.getProperty("/employee");
            var bValid = true;
            var oValidation = {
                nameState: "None",
                nameStateText: "",
                roleState: "None",
                roleStateText: "",
                salaryState: "None",
                salaryStateText: ""
            };
            
            // Validate name
            if (!oEmployee.name || oEmployee.name.trim().length === 0) {
                oValidation.nameState = "Error";
                oValidation.nameStateText = "Employee name is required";
                bValid = false;
            } else if (oEmployee.name.trim().length > 100) {
                oValidation.nameState = "Error";
                oValidation.nameStateText = "Employee name must be less than 100 characters";
                bValid = false;
            }
            
            // Validate role
            if (!oEmployee.role || oEmployee.role.trim().length === 0) {
                oValidation.roleState = "Error";
                oValidation.roleStateText = "Employee role is required";
                bValid = false;
            } else if (oEmployee.role.trim().length > 50) {
                oValidation.roleState = "Error";
                oValidation.roleStateText = "Employee role must be less than 50 characters";
                bValid = false;
            }
            
            // Validate salary
            var nSalary = parseFloat(oEmployee.salary);
            if (!oEmployee.salary || isNaN(nSalary) || nSalary <= 0) {
                oValidation.salaryState = "Error";
                oValidation.salaryStateText = "Please enter a valid salary amount";
                bValid = false;
            } else if (nSalary > 999999999) {
                oValidation.salaryState = "Error";
                oValidation.salaryStateText = "Salary amount is too large";
                bValid = false;
            }
            
            // Update validation state
            oDialogModel.setProperty("/validation", oValidation);
            
            return bValid;
        },
        
        onDelete: function (oEvent) {
            var oModel = this.getOwnerComponent().getModel("EmployeeV2Model");
            var aEmployeeData = oModel.getProperty("/employeeData") || [];
            
            // Get the binding context of the deleted item
            var oBindingContext = oEvent.getParameter("listItem").getBindingContext("EmployeeV2Model");
            var nEmployeeId = oBindingContext.getProperty("id");
            var sEmployeeName = oBindingContext.getProperty("name");
            
            // Find and remove the employee from the array
            var nIndex = aEmployeeData.findIndex(function(employee) {
                return employee.id === nEmployeeId;
            });
            
            if (nIndex > -1) {
                aEmployeeData.splice(nIndex, 1);
                oModel.setProperty("/employeeData", aEmployeeData);
                MessageToast.show("Employee '" + sEmployeeName + "' deleted successfully!");
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
     
            setTimeout(function() {
                if (oModel) {
                    oModel.setProperty("/tableLoading", false);
                }
            }, 1000);
        }
    });
});