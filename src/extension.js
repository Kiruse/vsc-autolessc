////////////////////////////////////////////////////////////////////////////////
// autolessc VSCode extension module
// -----
// Copyright (c) Kiruse 2018 Germany
// License: GPL-3.0
const vscode        = require('vscode');
const os            = require('os');
const {promisify}   = require('util');
const path          = require('path');
const glob          = promisify(require('glob'));

const BusyIndicator = require('./busyindicator');
const graceful      = require('./graceful');
const launch        = require('./launch');
const lesstools     = require('./less-tools');

const config = require('./config');

const cpuCount    = os.cpus.length;
const isWindows   = os.platform() === 'win32';

let busyIndicator = null;
let activeCompilers = [];

exports.activate = async function(ctx) {
	const subs = ctx.subscriptions;
	let initIndicator = (new BusyIndicator('Initializing autolessc')).show();
	
	if (await initLess()) {
		console.log('less is installed, wooh!');
		
		subs.push(vscode.commands.registerCommand('extension.autolessc.checkLess', checkLess));
		subs.push(vscode.commands.registerCommand('extension.autolessc.compileAll', compileAll));
		
		subs.push(vscode.workspace.onDidSaveTextDocument(onSave));
		
		busyIndicator = new BusyIndicator();
	}
	
	initIndicator.hide().dispose();
}

exports.deactivate = function() {
	
}


async function initLess() {
	// Attempt to install less if necessary - this is required for proper functioning
	let [err, result] = await graceful(lesstools.isInstalled());
	if (err) {
		console.error(err);
		vscode.window.showErrorMessage('Error during check for less package: ' + err.toString());
		return false;
	}
	
	if (!result) {
		[err] = await graceful(lesstools.install());
		if (err) {
			console.error(err);
			vscode.window.showErrorMessage('Error during less installation: ' + err.toString());
			return false;
		}
	}
	
	// Attempt to update less - this is not required for proper functioning
	[err, result] = await graceful(lesstools.needsUpdate());
	if (err) {
		console.error(err);
		vscode.window.showWarningMessage('Error while checking for latest version of less. This bug is under investigation. Try running `npm up -g less` manually.\nNonetheless, autolessc can still be used.');
	}
	else {
		[err] = await graceful(lesstools.update());
		if (err) {
			console.error(err);
			vscode.window.showWarningMessage('Error while updating less. This bug is under investigation. Try running `npm up -g less` manually.\nNonetheless, autolessc can still be used.');
		}
	}
	
	return true;
}

async function checkLess() {
	let indicator = (new BusyIndicator('Checking LESS')).show();
	
	try {
		if (!await lesstools.isInstalled()) {
			indicator.label = 'Installing LESS';
			await lesstools.install();
		}
		else if (await lesstools.needsUpdate()) {
			indicator.label = 'Updating LESS';
			await lesstools.update();
		}
	}
	catch (err) {
		console.error(err);
		vscode.window.showErrorMessage('Error while updating less. This bug is currently under investigation. Try running `npm up -g less` manually.');
	}
	indicator.dispose();
}


async function onSave(doc) {
	if (doc.languageId.toLowerCase() !== 'less') return;
	
	const file = doc.fileName;
	if (!isValidFile(file)) return;
	
	let [err,, stderr] = await graceful(compile(file));
	
	if (err || stderr.length) {
		vscode.window.showErrorMessage(`Failed to compile ${file}`);
	}
}

async function compileAll() {
	let files = [];
	for (let root of config.root) {
		files = files.concat(glob(`${root}/**/*.less`));
	}
	
	let [err] = await graceful(Promise.all(files.map(file => compile(file))));
	if (err) {
		vscode.window.showErrorMessage('Failed to compile some or all some files');
	}
}

async function compile(from, to) {
	to = to || `${path.dirname(from)}/${path.basename(from, '.less')}.css`;
	
	let args = [from, to];
	let opts = {
		shell: isWindows
	};
	
	// To avoid race conditions, we need to wait until we actually managed to claim a slot
	while (!hasCompileSlot()) await Promise.race(activeCompilers);
	
	let promise = launch('lessc', args, opts);
	let cmdstring = 'lessc ' + args.join(' ');
	activeCompilers.push(promise);
	busyIndicator.show();
	
	try {
		let [code, stdout, stderr] = await promise;
		if (code) throw Error(`\`${cmdstring}\` terminated with exit code ${code}`);
		return [stdout, stderr];
	}
	finally {
		let index = activeCompilers.indexOf(promise);
		if (index !== -1) {
			activeCompilers.splice(activeCompilers.indexOf(promise));
			if (!activeCompilers.length) busyIndicator.hide();
		}
	}
}

function hasCompileSlot() {
	return activeCompilers.length >= cpuCount;
}


/**
 * Tests if the specified file is valid for compilation with lessc. File must
 * have the .less extension and be within the directory specified by roots (or
 * the workspace folders if none other specified).
 * @param {string} file to test
 * @return {boolean}
 */
function isValidFile(file) {
	let roots = config.root;
	
	// If absolutely no roots found, we'll just assume the user opened a singular file without any workspace
	// meaning it's very likely an intended operation.
	if (!roots.length) {
		return true;
	}
	
	for (let root of roots) {
		let relativePath = path.posix.normalize(path.relative(file, root));
		if (!relativePath.startsWith('../')) {
			return true;
		}
	}
	return false;
}
