/**
 * Extensions to JavaScript types
 *
 * Originally based on Remedial JavaScript by Douglas Crockford
 * (http://javascript.crockford.com/remedial.html)
 */

var typeOf = global.typeOf = function(value) {
    var type = typeof value;
    if (type === 'object') {
        if (!value) return 'null';

        return typeof value.length === 'number' &&
            !(value.propertyIsEnumerable('length')) &&
            typeof value.splice === 'function' ? 'array' : type;
    }

    return type;
};

global.isEmpty = function(obj) {
    if (typeOf(obj) === 'object') {
        return _.all(obj, function(value) {
            return value === undefined || typeof value === 'function'
        });
    }

    return false;
};

String.prototype.supplant = function(attributes) {
    return this.replace(/{([^{}]*)}/g, function(key, value) {
        return attributes[value];
    });
};

String.prototype.trim = function() {
    return this.replace(/^\s*(\S*(?:\s+\S+)*)\s*$/, '$1');
};
