var crypto = require('crypto');
require('underscore');
require('remedial');
require('printf');

/**
 * Merges the given objects together
 */
exports.merge = function() {
    var obj = {};
    _.each(arguments, function(arg) {
        for (var item in arg) obj[item] = arg[item];
    });

    return obj;
};

/**
 * Removes the first n items from the given property list
 */
var shift = exports.shift = function(args, n) {
    return _.values(args).slice(n ? n : 1);
};

/**
 * Calls the given function with the given arguments asynchronously
 */
exports.async = function(fn) {
    var args = shift(arguments);
    setTimeout(function() { fn.apply(null, args); }, 0);
};

/**
 * Executes one of the given functions based on conditional logic defined in
 * a property list
 *
 * Example:
 * execiteIf({a: false, b: true, c: false}, {
 *     a: function() { return 'a'; },
 *     b: function() { return 'b'; },
 *     c: function() { return 'c'; },
 *     '': function() { return 'empty'; }
 * }) //=> 'b'
 *
 * @param context The object which defines the properties to test
 * @param logic The property list containing the possible functions to execute
 */
exports.executeIf = function(context, logic) {
    for (var i in logic) {
        if (i && context[i]) {
            return logic[i]();
        }
    }

    return logic[''] ? logic['']() : false;
};

/**
 * Object which coordinates a collection of asynchronous functions
 */
exports.Sync = function() {
    var results = {},
        total = 0,
        current = 0,
        _callback = null;

    function test() {
        if (++current >= total && _callback) _callback.call(null, results);
    }

    return {
        run: function(callback) {
            total += 1;
            return function() {
                var result = callback.apply(null, arguments);
                if (result && result.length) results[result[0]] = result[1];
                test();
            };
        },
        wait: function(callback) {
            _callback = callback;
        }
    };
};

exports.md5 = function(value) {
    return crypto.createHash('md5').update(value).digest('hex');
};

exports.hasProperties = function(obj) {
    var args = shift(arguments);
    if (typeof args[0] == 'object') args = args[0];
    for (var i = args.length - 1; i >= 0; --i) if (!obj[args[i]]) return false;
    return true;
};
