var _ = exports._ = require('underscore')._;

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
