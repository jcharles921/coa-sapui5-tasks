/*global QUnit*/

sap.ui.define([
	"coasapui5task1jc/controller/coa-sapui5-task-1-jc.controller"
], function (Controller) {
	"use strict";

	QUnit.module("coa-sapui5-task-1-jc Controller");

	QUnit.test("I should test the coa-sapui5-task-1-jc controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
