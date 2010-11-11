var crypto = require('crypto'),
    events = require('events');
require('underscore');
require('./remedial');
require('./printf');

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
var async = exports.async = function(fn) {
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
var Sync = exports.Sync = function() {
    var results = {},
        total = 0,
        current = 0,
        _callback = null;

    function test() {
        if (++current >= total && _callback) _callback.call(null, results);
    }

    return {
        run: function(fn) {
            total += 1;
            return function() {
                var result = fn.apply(null, arguments);
                if (result && result.length) results[result[0]] = result[1];
                test();
            };
        },
        wait: function(callback) {
            _callback = callback;
        }
    };
};

/**
 * Calls the given collection of functions asynchronously, collecting the
 * results
 */
exports.run = function(functions, callback) {
    var args = getArgs(arguments);
    functions = args[0];
    callback = args[1];

    var sync = Sync();
    _.each(functions, function(fn) { async(sync.run(fn)); });
    sync.wait(callback);
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

exports.trim = function(value) {
    return ('' + value).trim();
};

exports.getAttribute = function(obj, attribute) {
    if (typeof attribute == 'string') return obj[attribute];

    var value = obj[attribute[0]];
    for (var i = 1, len = attribute.length; i < len; ++i) {
        if (!value) break;
        value = value[attribute[i]];
    }
    return value;
};

/**
 * Object which abstracts event handling
 */
exports.Observer = (function() {
    function callHandler(handler, callOnce) {
        var called = false;
        return function() {
            if (!callOnce || !called) {
                called = true;
                async.apply(null, _.flatten([handler, _.values(arguments)]));
            }
        };
    }

    function notUndefined(arg) { return typeof arg !== 'undefined'; }

    return function() {
        var emitter = new events.EventEmitter();

        function fire(event) { emitter.emit.apply(emitter, arguments); }

        return {
            fire: fire,
            on: function(event, handler) {
                emitter.addListener(event, callHandler(handler, false));
            },
            once: function(event, handler) {
                emitter.addListener(event, callHandler(handler, true));
            },
            relay: function(event, obj, fn) {
                var original = obj['fn'];
                obj['fn'] = function() {
                    original.apply(this, arguments);
                    fire.apply(null, _.flatten([event, _.values(arguments)]));
                };
            },
            /**
             * Calls the given handler when all of the given events are fired
             */
            when: function(events, handler) {
                var args = getArgs(arguments);
                events = args[0];
                handler = args[1];

                var self = this,
                    totalEvents = events.length,
                    calledEvents = 0,
                    eventArgs = {};

                function eventHandler(event) {
                    return function() {
                        var args = _(arguments).chain().values()
                            .select(notUndefined).value();

                        eventArgs[event] = args.length == 1 ? args[0] : args;

                        if (++calledEvents == totalEvents) handler(eventArgs);
                    };
                }

                _.each(events, function(event) {
                    self.once(event, eventHandler(event));
                });
            }
        };
    };
}());

/**
 * Runs the given collection of functions sequentially, returning the final
 * result when finished
 */
exports.chain = function() {
    var functions = arguments;
    return function() {
        var result = _.values(arguments);
        _.each(functions, function(fn) {
            result = fn.apply(null,
                typeOf(result) == 'array' ? result : [result]);
        });

        return result;
    };
};

/**
 * Encapsulates parsing of a JSON string
 * @param data
 * @return false|object
 */
exports.parseJSON = function(data) {
    try { return JSON.parse(data);}
    catch (err) { return false; }
};

/**
 * Corrects the given array of arguments: [[1…n], last]
 */
function getArgs(args) {
    var first = args[0],
        last = args[1];

    if (args.length > 2) {
        first = _.first(args, args.length - 1);
        last = _.last(args);
    }

    if (typeOf(first) != 'array') first = [first];

    return [first, last];
}
