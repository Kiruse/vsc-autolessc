////////////////////////////////////////////////////////////////////////////////
// A simple utility function that wraps child_process.spawn in a promise.
// It resolves with the process's exit code, stdout and stderr. stdin is
// currently not supported.
// -----
// Copyright (c) Kiruse 2018 Germany
// License: GPL-3.0
const {spawn} = require('child_process');
module.exports = function(cmd, args, opts) {
	return new Promise((resolve, reject) => {
		let child;
		try {
			child = spawn(cmd, args, opts);
		}
		catch (err) {
			reject(err);
			return;
		}
		
		let stdout = '', stderr = '';
		
		child.stdout.on('data', data => {
			stdout += data;
		})
		child.stderr.on('data', data => {
			stderr += data;
		})
		
		child.on('close', code => {
			resolve([code, stdout, stderr]);
		})
	})
}