# autolessc

Quick and dirty extension to aid in web development with LESS CSS.

This extension arose out of the lack of an up-to-date extension which compiles LESS upon saving a .less file. Two others
exist (that I found), but one does not support latest CSS features and the other requires you to execute a command
manually. Meh.

## Features

Currently only supports locally mounted file systems.

* Manage less version globally through npm
* Compile LESS on save with all options of lessc
* More to come as I find the time and need to develop them!

\!\[compile on save\]\(images/compile-on-save.gif\)

## Requirements

Only node & npm. The extension will manage the rest automatically.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: enable/disable this extension
* `myExtension.thing`: set to `blah` to do something

## Release Notes

### 1.0.0

Initial release
