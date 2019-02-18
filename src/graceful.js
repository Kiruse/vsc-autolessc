////////////////////////////////////////////////////////////////////////////////
// Quick and simple utility module to simplify the unnecessary try...catch wraps
// around await promise calls. Makes the entire thing more like callback calls.
// Usage:
//      let [err, result] = await graceful(myPromise);
//      if (err) throw err;
// -----
// Copyright (c) Kiruse 2018 Germany
// License: GPL-3.0
module.exports = promise => promise.then(vals => [undefined, ...wrap(vals)]).catch(err => [err])
var wrap = vals => Array.isArray(vals) ? vals : [vals];