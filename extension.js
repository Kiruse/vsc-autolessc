////////////////////////////////////////////////////////////////////////////////
// autolessc VSCode extension module
// -----
// Copyright (c) Kiruse 2018 Germany
// License: GPL-3.0
const vscode = require('vscode');
const path   = require('path');

exports.activate = function(ctx) {
	// vscode.window.showInformationMessage('Hello, World!');
	
	const subs = ctx.subscriptions;
	
	subs.push(vscode.commands.registerCommand('extension.autolessc.updateLess', updateLess))
	subs.push(vscode.commands.registerCommand('extension.autolessc.compileAll', compileAll))
	
	subs.push(vscode.workspace.onDidSaveTextDocument(onSave))
}
	
exports.deactivate = function() {
	
}


function onSave(doc) {
	if (doc.languageId.toLowerCase() !== 'less') return;
	
	const filepath = doc.filename;
	
}

function updateLess(evt) {
	
}

function compileAll(evt) {
	
}
