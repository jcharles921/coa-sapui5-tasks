sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/core/routing/History",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "coasapui5task1jc/model/formater"
], function (Controller, UIComponent, History, Fragment, MessageToast, JSONModel, NumberFormatter) {
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
                    model: "EmployeeV2Model"
                });
                
                // Store the current employee index for edit operations
                this._currentEmployeeIndex = iEmployeeIndex;
            } else {
                console.error("Employee with ID " + sEmployeeId + " not found");
                this.onNavBack();
            }
        },
        
        onEditEmployee: function () {
            var oView = this.getView();
            var oModel = oView.getModel("EmployeeV2Model");
            var sPath = oView.getElementBinding("EmployeeV2Model").getPath();
            var oEmployee = oModel.getProperty(sPath);
            
            // Create a copy of the employee data for editing
            var oEmployeeCopy = {
                id: oEmployee.id,
                name: oEmployee.name,
                role: oEmployee.role,
                salary: oEmployee.salary
            };
            
            // Create dialog model
            var oDialogModel = new JSONModel({
                title: "Edit Employee",
                saveButtonText: "Update",
                showId: true,
                employee: oEmployeeCopy,
                validation: {
                    nameState: "None",
                    nameStateText: "",
                    roleState: "None",
                    roleStateText: "",
                    salaryState: "None",
                    salaryStateText: ""
                }
            });
            
            // Store original data for comparison
            this._originalEmployeeData = JSON.parse(JSON.stringify(oEmployee));
            
            if (!this._oEditDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "coasapui5task1jc.view.fragments.EmployeeDialog",
                    controller: this
                }).then(function (oDialog) {
                    this._oEditDialog = oDialog;
                    oView.addDependent(this._oEditDialog);
                    this._oEditDialog.setModel(oDialogModel, "dialogModel");
                    this._oEditDialog.open();
                }.bind(this));
            } else {
                this._oEditDialog.setModel(oDialogModel, "dialogModel");
                this._oEditDialog.open();
            }
        },
        
        onSaveEmployee: function () {
            var oDialogModel = this._oEditDialog.getModel("dialogModel");
            var oEmployeeData = oDialogModel.getProperty("/employee");
            
            // Validate the form
            if (!this._validateEmployeeForm(oDialogModel)) {
                return;
            }
            

            var oModel = this.getView().getModel("EmployeeV2Model");
            var aEmployees = oModel.getProperty("/employeeData");
            
            // Update the employee at the stored index
            if (this._currentEmployeeIndex !== undefined && this._currentEmployeeIndex >= 0) {
                // Ensure salary is a number
                oEmployeeData.salary = parseFloat(oEmployeeData.salary) || 0;
                
                // Update the employee in the array
                aEmployees[this._currentEmployeeIndex] = {
                    id: oEmployeeData.id,
                    name: oEmployeeData.name.trim(),
                    role: oEmployeeData.role.trim(),
                    salary: oEmployeeData.salary
                };
                
                // Update the model
                oModel.setProperty("/employeeData", aEmployees);
                
                // Show success message
                MessageToast.show("Employee updated successfully!");
                
                // Close dialog
                this._oEditDialog.close();
                
                // Clear stored data
                this._originalEmployeeData = null;
            } else {
                MessageToast.show("Error: Could not find employee to update");
            }
        },
        
        onCancelDialog: function () {
            if (this._oEditDialog) {
                this._oEditDialog.close();
            }
            this._originalEmployeeData = null;
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