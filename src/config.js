////////////////////////////////////////////////////////////////////////////////
// autolessc configuration object using VSCode API
// -----
// Copyright (c) Kiruse 2018 Germany
// License: GPL-3.0
const vscode = require('vscode');

module.exports = Object.defineProperties({}, {
    root: {
        get() {
            let value = vscode.workspace.getConfiguration('autolessc').get('root');
            if (!value) {
                if (vscode.workspace.workspaceFolders) {
                    return vscode.workspace.workspaceFolders
                        .filter(folder => folder.uri.scheme === 'file')
                        .map(folder => folder.uri.path);
                }
                else {
                    return [];
                }
            }
            if (typeof value === 'string') {
                return [value];
            }
            return value;
        }
    }
})
