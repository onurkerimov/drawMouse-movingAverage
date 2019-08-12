
window.$Collection = (function(number) {

    function $za(number) { return new $zaza(number) }

    $zaza.prototype.new = function(el) {
        this.array.push(el)
        resize(this)
    }

    $zaza.prototype.size = function(num) {
        this.size = num
        resize(this)
    }

    $zaza.prototype.index = function(num) {
        return this.array[num]
    }

    $zaza.prototype.lastIndex = function(num) {
        return this.array[this.array.length - num - 1]
    }

    function $zaza(number) {

        if (!number) { var number = 2 }

        this.size = number
        this.array = []

    };

    function resize(dis) {
        while (dis.array.length > dis.size) { dis.array.shift() }
        return
    };

    return $za
}());

window.$ = (function() {

    function $() {

        var obj = new $NodeList(Array.from(arguments));

        Array.from(obj.arguments).forEach((arg) => {

            if (typeof arg === 'string') {

                if (arg[0] === '<') {
                    // if is a HTML string
                    var matches = arg.match(/<([\w-]*)>/);
                    if (matches === null || matches === undefined) {
                        throw 'Invalid Selector / Node';
                        return false;
                    }
                    var nodeName = matches[0].replace('<', '').replace('>', '');
                    obj.nodes = document.createElement(nodeName);

                } else {
                    // if is a selector
                    obj.nodes = obj.nodes.concat(Array.from(document.querySelectorAll(arg)))
                }

            } else if (arg.length) {
                obj.nodes = obj.nodes.concat(arg)

            } else if (typeof arg === 'object') {
                if (arg.nodes) {
                    obj.nodes = obj.nodes.concat(arg.nodes)
                } else {
                    obj.nodes.push(arg)
                }

            }
        })

        obj.nodes = uniq(obj.nodes)

        return obj;
    };

    // ===

    $.extend = function() {

        var object = merge(...arguments)
        $NodeList.prototype = Object.assign(object, $NodeList.prototype)
        return this
    };

    // ===

    $NodeList.prototype.use = function(trackr) {

        trackr.use(this)
        return this
    }

    $NodeList.prototype.do = function(callback) {
        if (typeof callback === 'string') {

            var args = Array.from(arguments)
            args = args.slice(1)
            return this[callback](...args)
        }

        callback(this)
        return this
    }


    var _event = { // === addEvent, removeEvent, trigger, hover, pan

        addEvent: function() {

            var obj = new $NodeList(Array.from(arguments), this)

            this.nodes.forEach((elem) => {
                elem.addEventListener(...arguments)
            })

            obj.nodes = this.nodes
            obj.event = { nodes: this.nodes, args: arguments, on: true }
            return obj
        },

        removeEvent: function() {

            var obj = new $NodeList(Array.from(arguments), this)
            this.nodes.forEach((elem) => {
                elem.removeEventListener(...arguments)
            })
            obj.nodes = this.nodes
            obj.event = { nodes: this.nodes, args: arguments, on: true }
            return obj
        }
    }

    $.extend(_event)


    // ===

    function $NodeList(args, prev) {

        if (prev) { this.prevObject = prev }
        this.arguments = args
        this.nodes = []

        var _getters = {
            get _() { return this.nodes[0] },
            get __() { return this.nodes }
        }

        this.__proto__ = Object.assign(_getters, this.__proto__)

    };

    function uniq(nodes) {
        return nodes.reduce(function(a, b) {
            if (a.includes(b) === false) a.push(b)
            return a
        }, [])
    };

    function merge() {
        return Array.from(arguments).reduce(function(result, currentObject) {
            for (var key in currentObject) {
                if (currentObject.hasOwnProperty(key)) {
                    result[key] = currentObject[key]
                }
            }
            return result;
        }, {})
    };

    return $
}());



(function() { // === $.loop, $.loopInverse

    function $loop(num, callback) {

        for (var i = 0; i < num; i++) {
            callback(i)
        }
    }

    function $loopInverse(num, callback) {
        for (var i = num - 1; i >= 0; i--) {
            callback(i)
        }
    }

    $.loop = $loop
    $.loopInverse = $loopInverse

}());

$.extend({
    mousemoveConstant: function(handler) {
        var mem
        var timeout;
        var mouseStops;

        $(document).addEvent('mouseenter', () => {
            $(document).addEvent('mousemove', mousemoveHandler);
        });

        $(document).addEvent('mouseleave', () => {
            $(document).removeEvent('mousemove', mousemoveHandler);
        });

        function mousemoveStop() {
            mouseStops = true
            fn()

            function fn() {
                if (mouseStops === true) {
                    handler(mem)
                    setTimeout(fn, 10)
                }
            }
        }

        function mousemoveHandler(e) {
            mouseStops = false
            if (timeout !== undefined) {
                window.clearTimeout(timeout);
            }
            timeout = window.setTimeout(function() {
                mem = e
                mousemoveStop()
            }, 20);
        }
    }
})