////////////////////////////////////////////////////////////////////////////////
// Busy indicator for VSCode's status bar. Uses a simple period that loops
// through a number of whitespace characters.
// -----
// Copyright (c) Kiruse 2018 Germany
// License: GPL-3.0
const vscode = require('vscode');

module.exports = class {
    constructor(label = 'Compiling LESS', frames = 5) {
        this.item = vscode.window.createStatusBarItem();
        this.item.hide();
        
        this.label    = label;
        this.interval = null;
        this.frame    = 0;
        this.frames   = frames;
        this.visible  = false;
    }
    
    show() {
        if (!this.visible) {
            this.interval = setInterval(this.tick.bind(this), 300);
            this.visible  = true;
            this.item.show();
        }
        return this;
    }
    
    hide() {
        if (this.visible) {
            clearInterval(this.interval);
            this.interval = null;
            this.visible  = false;
            this.item.hide();
        }
        return this;
    }
    
    dispose() {
        this.item.dispose();
        this.item = null;
    }
    
    tick() {
        this.item.text = this.label + (new Array(this.frame)).fill(' ').join('') + '.';
        this.frame = (this.frame + 1) % this.frames;
    }
}
