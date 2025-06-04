/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"coasapui5task1jc/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
