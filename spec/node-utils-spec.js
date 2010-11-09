var utils = require('index');

describe('utils.merge', function() {
    var obj1 = {a: 1, b: 2, c: 3},
        obj2 = {d: 4, e: 5},
        obj3 = {a: 6, e: 7, h: 8, d: 9, j: 10};

    it('merges two objects', function() {
        expect(utils.merge(obj1, obj2)).toEqual({
            a: 1, b: 2, c: 3, d: 4, e: 5
        });
        expect(utils.merge(obj1, obj3)).toEqual({
            a: 6, b: 2, c: 3, e: 7, h: 8, d: 9, j: 10
        });
    });

    it('merges multiple objects', function() {
        expect(utils.merge(obj1, obj2, obj3)).toEqual({
            a: 6, b: 2, c: 3, d: 9, e: 7, h: 8, j:10
        });
        expect(utils.merge(obj3, obj2, obj1)).toEqual({
            a: 1, e: 5, h: 8, d: 4, j: 10, b: 2, c: 3
        });
    });
});

describe('utils.shift', function() {
    var args1 = {0: 1, 1: 2, 2: 3},
        args2 = {0: 'a', 1: 'b', 2:'c', 3: 'd'};

    it('removes the first item from a list', function() {
        expect(utils.shift(args1)).toEqual([2, 3]);
        expect(utils.shift(args2)).toEqual(['b', 'c', 'd']);
    });

    it('removes the first n items from a list', function() {
        expect(utils.shift(args1, 2)).toEqual([3]);
        expect(utils.shift(args2, 2)).toEqual(['c', 'd']);
    });
});

describe('utils.async', function() {
    it('calls a function asynchronously', function() {
        utils.async(asyncSpecDone);
        asyncSpecWait();
    });

    it('calls a function with given arguments asynchronously', function() {
        utils.async(function() {
            expect(arguments).toEqual({0: 1, 1: 2, 2: 3});
            asyncSpecDone();
        }, 1, 2, 3);
        asyncSpecWait();
    });
});

describe('utils.executeIf', function() {
    var logic = {
        a: function() { return 'a'; },
        b: function() { return 'b'; },
        c: function() { return 'c'; },
        '': function() { return 'empty'; }
    };

    it('calls the appropriate handler when the context matches', function() {
        expect(utils.executeIf({b: true}, logic)).toEqual('b');
        expect(utils.executeIf({a: false, c: true}, logic)).toEqual('c');
    });

    it('executes the default handler when appropriate', function() {
        expect(utils.executeIf({}, logic)).toEqual('empty');
    });
});

describe('Sync', function() {
    it('collects all results', function() {
        var sync = utils.Sync(),
            obj = {a: 1, b: 2, c: 3};

        _.each(obj, function(value, key) {
            utils.async(sync.run(function(key, value) {
                return [key, value];
            }), key, value);
        });

        sync.wait(function(result) {
            expect(result).toEqual(obj);
            asyncSpecDone();
        });
        asyncSpecWait();
    });
});

describe('hasProperties', function() {
    it('returns true when all properties exist', function() {
        expect(utils.hasProperties({a: 1, b: 2, c: 3}, 'a', 'b', 'c'))
            .toEqual(true);
    });

    it('accepts arrays', function() {
        expect(utils.hasProperties({a: 1, b: 2, c: 3}, ['a', 'b', 'c']))
            .toEqual(true);
    });

    it('returns false when no properties exist', function() {
        expect(utils.hasProperties({}, 'a', 'b', 'c')).toEqual(false);
    });

    it('returns false when not all properties exist', function() {
        expect(utils.hasProperties({a: 1, c: 3}, 'a', 'b', 'c')).toEqual(false);
    });
});
