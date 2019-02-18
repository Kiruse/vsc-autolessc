////////////////////////////////////////////////////////////////////////////////
// Local server process as a workaround because for some reason VSCode extensions
// can't run npm directly...
// -----
// Copyright (c) Kiruse 2018 Germany
// License: GPL-3.0
const semver      = require('semver');

const launch    = require('./launch');
const graceful  = require('./graceful');

const isWindows = require('os').platform() === 'win32';


exports.isInstalled = async function() {
    return !!await exports.getInstalledVersion();
}

exports.needsUpdate = async function() {
    let [installed, latest] = await Promise.all([exports.getInstalledVersion(), exports.getLatestVersion()]);
    return semver.lt(installed, latest);
}

exports.install = async function() {
    let args = ['i', '-g', 'less'];
    let cmdstring = 'npm ' + args.join(' ');
    let [code,, stderr] = await launch('npm', args, {shell: isWindows});
    
    if (code) throw Error(`\`${cmdstring}\` terminated with exit code ${code}`);
    if (stderr.length) throw Error(`\`${cmdstring}\` error:`);
    if (!await exports.isInstalled()) throw Error('Failed to install less globally');
}

exports.update = async function() {
    let args = ['up', '-g', 'less'];
    let cmdstring = 'npm ' + args.join(' ');
    let [code,, stderr] = await launch('npm', args, {shell: isWindows});
    
    if (code) throw Error(`\`${cmdstring}\` terminated with exit code ${code}`);
    if (stderr.length) throw Error(`\`${cmdstring}\` error:`);
    if (await exports.needsUpdate()) throw Error('Failed to update less globally');
}


exports.getInstalledVersion = async function() {
    let [code, stdout, stderr] = await launch('npm', ['list', '-g', 'less'], {shell: isWindows});
    if (code) {
        throw Error(`\`npm list -g less\` terminated with exit code ${code}`);
    }
    if (stderr.length) {
        throw Error(stderr);
    }
    
    // Check if less is even installed
    let [, line] = stdout.split('\n');
    if (line.indexOf('@') === -1) return undefined;
    
    // Return version string
    return line.substr(line.indexOf('@') + 1);
}

exports.getLatestVersion = async function() {
    let [code, stdout, stderr] = await launch('npm', ['view', 'less', 'version'], {shell: isWindows});
    if (code) {
        throw Error(`\`npm view less version\` terminated with exit code ${code}`);
    }
    if (stderr.length) {
        throw Error(stderr);
    }
    return stdout;
}
