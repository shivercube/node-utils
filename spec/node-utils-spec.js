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

describe('typeOf', function() {
    it('returns correct types', function() {
        expect(typeOf({})).toEqual('object');
        expect(typeOf([])).toEqual('array');
        expect(typeOf(function() {})).toEqual('function');
        expect(typeOf('')).toEqual('string');
        expect(typeOf(1)).toEqual('number');
        expect(typeOf(true)).toEqual('boolean');
        expect(typeOf(null)).toEqual('null');
        expect(typeOf()).toEqual('undefined');
    });
});

describe('isEmpty', function() {
    it('returns true for empty objects', function() {
        expect(isEmpty({})).toEqual(true);
    });

    it('ignores functions', function() {
        expect(isEmpty({f: function() {}})).toEqual(true);
    });

    it('returns false for non-empty objects', function() {
        expect(isEmpty({a: 1})).toEqual(false);
    });

    it('returns false for non-objects', function() {
        expect(isEmpty([])).toEqual(false);
    });
});

describe('supplant', function() {
    it('substitutes strings', function() {
        expect('My {key} is {value}'.supplant({key: 'name', value: 'bob'}))
            .toEqual('My name is bob');
    });

    it('automatically converts types', function() {
        var now = new Date();
        expect('Current time is: {date}'.supplant({date: now}))
            .toEqual('Current time is: ' + now);
    });
});

describe('trim', function() {
    it('removes all whitespace', function() {
        expect("  this is me\n  ".trim()).toEqual('this is me');
    });

    it('works on non strings', function() {
        expect(utils.trim(123)).toEqual('123');
    });
});

describe('getAttribute', function() {
    var obj = {id: 'abc', personal: {name: {first: 'Bob'}}};

    it('retrieves an attribute when given a string', function() {
        expect(utils.getAttribute(obj, 'id')).toEqual(obj.id);
        expect(utils.getAttribute(obj, 'personal')).toEqual(obj.personal);
    });

    it('retrieves attribute when given an array', function() {
        expect(utils.getAttribute(obj, ['id'])).toEqual(obj.id);
        expect(utils.getAttribute(obj, ['personal', 'name', 'first']))
            .toEqual(obj.personal.name.first);
    });

    it("returns undefined when string attribute doesn't exist", function() {
        expect(utils.getAttribute(obj, 'name')).toBeUndefined();
        expect(utils.getAttribute(obj, ['personal', 'age'])).toBeUndefined();
    });
});

describe('observer', function() {
    var observer;

    beforeEach(function() {
        observer = utils.Observer();
    });

    it('fires events', function() {
        var called = [];
        observer.on('ev1', function(arg1, arg2) {
            called.push('ev1');
            expect(arguments).toEqual([1, 'me']);
        });
        observer.on('ev2', function() {
            called.push('ev2');
            expect(arguments).toEqual([]);
        });
        observer.on('ev3', function(arg1) {
            called.push('ev3');
            expect(arguments).toEqual(['name']);
            expect(called).toEqual(['ev1', 'ev2', 'ev3']);
            asyncSpecDone();
        });

        observer.fire('ev1', 1, 'me');
        observer.fire('ev2');
        observer.fire('ev3', 'name');
        asyncSpecWait();
    });

    it('fires events multiple times', function() {
        var counter = 0;

        function handler(arg1, arg2, arg3) {
            expect(arg1).toEqual(1);
            expect(arg2).toEqual(2);
            expect(arg3).toEqual('3');
            if (++counter == 2) asyncSpecDone();
        }

        observer.on('ev', handler);
        observer.on('ev', handler);
        observer.fire('ev', 1, 2, '3');
        asyncSpecWait();
    });

    it('can fire an event only once', function() {
        observer.once('ev', function(data) {
            expect(data).toEqual('only once');
            asyncSpecDone();
        });

        observer.fire('ev', 'only once');
        observer.fire('ev', 'not twice');
        asyncSpecWait();
    });

    it('relays events', function() {
        function Obj() {
            return {
                called: false,
                fn: function(data) {
                    expect(data).toEqual('hello');
                    this.called = true;
                    asyncSpecWait();
                }
            };
        }

        var obj = Obj();
        observer.on('ev', function(data) {
            expect(data).toEqual('hello');
            asyncSpecDone();
        });
        observer.relay('ev', obj, 'fn');
        obj.fn('hello');
        expect(obj.called).toEqual(true);
    });

    describe('group scheduling', function() {
        function multipleHandler(args) {
            expect(args).toEqual({ev1: 'result from ev1', ev2: [1, 2]});
            asyncSpecDone();
        }

        it('allows group scheduling', function() {
            observer.when('ev1', 'ev2', multipleHandler);
            observer.fire('ev2', 1, 2);
            observer.fire('ev1', 'result from ev1');
            asyncSpecWait();
        });

        it('allows an array as first argument', function() {
            observer.when(['ev1', 'ev2'], multipleHandler);
            observer.fire('ev2', 1, 2);
            observer.fire('ev1', 'result from ev1');
            asyncSpecWait();
        });

        it('supports single events', function() {
            observer.when('ev1', function(args) {
                expect(args).toEqual({ev1: 'result from ev1'});
                asyncSpecDone();
            });

            observer.fire('ev1', 'result from ev1');
            asyncSpecWait();
        });
    });
});

describe('chain', function() {
    it('chains together multiple functions', function() {
        function step1(i) {
            expect(i).toEqual(1);
            return i + 1;
        }

        function step2(i) {
            expect(i).toEqual(2);
            return [i * 2, i * 3];
        }

        function step3(a, b) {
            expect(a).toEqual(4);
            expect(b).toEqual(6);
            return a + b;
        }

        expect(utils.chain(step1, step2, step3)(1)).toEqual(10);
    });
});
