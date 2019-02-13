(function() {
        var AliPay = {};
        var util = {};
        util.PADCHAR = "=";
        util.ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

        util.makeDOMException = function() {
            var f, d;
            try {
                return new DOMException(DOMException.INVALID_CHARACTER_ERR)
            } catch (d) {
                var error = new Error("DOM Exception 5");
                error.code = error.number = 5;
                error.name = error.description = "INVALID_CHARACTER_ERR";
                error.toString = function() {
                    return "Error: " + error.name + ": " + error.message
                };
                return error;
            }
        };

        util.getbyte64 = function(e, d) {
            var c = util.ALPHA.indexOf(e.charAt(d));
            if (c === -1) {
                throw util.makeDOMException()
            }
            return c
        };

        util.decode = function(f) {
            f = "" + f;
            var j = util.getbyte64;
            var h, e, g;
            var length = f.length;
            if (length === 0) {
                return f
            }
            if (length % 4 !== 0) {
                throw util.makeDOMException()
            }
            h = 0;
            if (f.charAt(length - 1) === util.PADCHAR) {
                h = 1;
                if (f.charAt(length - 2) === util.PADCHAR) {
                    h = 2
                }
                length -= 4
            }
            var c = [];
            for (e = 0; e < length; e += 4) {
                g = (j(f, e) << 18) | (j(f, e + 1) << 12) | (j(f, e + 2) << 6) | j(f, e + 3);
                c.push(String.fromCharCode(g >> 16, (g >> 8) & 255, g & 255))
            }
            switch (h) {
                case 1:
                    g = (j(f, e) << 18) | (j(f, e + 1) << 12) | (j(f, e + 2) << 6);
                    c.push(String.fromCharCode(g >> 16, (g >> 8) & 255));
                    break;
                case 2:
                    g = (j(f, e) << 18) | (j(f, e + 1) << 12);
                    c.push(String.fromCharCode(g >> 16));
                    break
            }
            return c.join("")
        };

        util.getbyte = function(e, d) {
            var c = e.charCodeAt(d);
            if (c > 255) {
                throw util.makeDOMException()
            }
            return c
        };

        util.encode = function(f) {
            if (arguments.length !== 1) {
                throw new SyntaxError("Not enough arguments")
            }
            var g = util.PADCHAR;
            var h = util.ALPHA;
            var k = util.getbyte;
            var e, j;
            var c = [];
            f = "" + f;
            var d = f.length - f.length % 3;
            if (f.length === 0) {
                return f
            }
            for (e = 0; e < d; e += 3) {
                j = (k(f, e) << 16) | (k(f, e + 1) << 8) | k(f, e + 2);
                c.push(h.charAt(j >> 18));
                c.push(h.charAt((j >> 12) & 63));
                c.push(h.charAt((j >> 6) & 63));
                c.push(h.charAt(j & 63))
            }
            switch (f.length - d) {
                case 1:
                    j = k(f, e) << 16;
                    c.push(h.charAt(j >> 18) + h.charAt((j >> 12) & 63) + g + g);
                    break;
                case 2:
                    j = (k(f, e) << 16) | (k(f, e + 1) << 8);
                    c.push(h.charAt(j >> 18) + h.charAt((j >> 12) & 63) + h.charAt((j >> 6) & 63) + g);
                    break
            }
            return c.join("")
        };

        AliPay.pay = function(d) {
            var c = encodeURIComponent(util.encode(d));
            location.href = "../payment/alipay/pay.htm?goto=" + c
        };

        AliPay.decode = function(c) {
            return util.decode(decodeURIComponent(c))
        };

        window._AP = AliPay
    }
)();