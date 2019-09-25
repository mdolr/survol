var JSON;
JSON || (JSON = {}),
    function () {
        "use strict";

        function f(e) { return e < 10 ? "0" + e : e }

        function quote(e) { return escapable.lastIndex = 0, escapable.test(e) ? '"' + e.replace(escapable, function (e) { var t = meta[e]; return typeof t == "string" ? t : "\\u" + ("0000" + e.charCodeAt(0).toString(16)).slice(-4) }) + '"' : '"' + e + '"' }

        function str(e, t) {
            var n, r, i, s, o = gap,
                u, a = t[e];
            a && typeof a == "object" && typeof a.toJSON == "function" && (a = a.toJSON(e)), typeof rep == "function" && (a = rep.call(t, e, a));
            switch (typeof a) {
                case "string":
                    return quote(a);
                case "number":
                    return isFinite(a) ? String(a) : "null";
                case "boolean":
                case "null":
                    return String(a);
                case "object":
                    if (!a) return "null";
                    gap += indent, u = [];
                    if (Object.prototype.toString.apply(a) === "[object Array]") { s = a.length; for (n = 0; n < s; n += 1) u[n] = str(n, a) || "null"; return i = u.length === 0 ? "[]" : gap ? "[\n" + gap + u.join(",\n" + gap) + "\n" + o + "]" : "[" + u.join(",") + "]", gap = o, i }
                    if (rep && typeof rep == "object") { s = rep.length; for (n = 0; n < s; n += 1) typeof rep[n] == "string" && (r = rep[n], i = str(r, a), i && u.push(quote(r) + (gap ? ": " : ":") + i)) } else
                        for (r in a) Object.prototype.hasOwnProperty.call(a, r) && (i = str(r, a), i && u.push(quote(r) + (gap ? ": " : ":") + i));
                    return i = u.length === 0 ? "{}" : gap ? "{\n" + gap + u.join(",\n" + gap) + "\n" + o + "}" : "{" + u.join(",") + "}", gap = o, i
            }
        }
        typeof Date.prototype.toJSON != "function" && (Date.prototype.toJSON = function (e) { return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + f(this.getUTCMonth() + 1) + "-" + f(this.getUTCDate()) + "T" + f(this.getUTCHours()) + ":" + f(this.getUTCMinutes()) + ":" + f(this.getUTCSeconds()) + "Z" : null }, String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function (e) { return this.valueOf() });
        var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            gap, indent, meta = { "\b": "\\b", "	": "\\t", "\n": "\\n", "\f": "\\f", "\r": "\\r", '"': '\\"', "\\": "\\\\" },
            rep;
        typeof JSON.stringify != "function" && (JSON.stringify = function (e, t, n) {
            var r;
            gap = "", indent = "";
            if (typeof n == "number")
                for (r = 0; r < n; r += 1) indent += " ";
            else typeof n == "string" && (indent = n);
            rep = t;
            if (!t || typeof t == "function" || typeof t == "object" && typeof t.length == "number") return str("", { "": e });
            throw new Error("JSON.stringify")
        }), typeof JSON.parse != "function" && (JSON.parse = function (text, reviver) {
            function walk(e, t) {
                var n, r, i = e[t];
                if (i && typeof i == "object")
                    for (n in i) Object.prototype.hasOwnProperty.call(i, n) && (r = walk(i, n), r !== undefined ? i[n] = r : delete i[n]);
                return reviver.call(e, t, i)
            }
            var j;
            text = String(text), cx.lastIndex = 0, cx.test(text) && (text = text.replace(cx, function (e) { return "\\u" + ("0000" + e.charCodeAt(0).toString(16)).slice(-4) }));
            if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) return j = eval("(" + text + ")"), typeof reviver == "function" ? walk({ "": j }, "") : j;
            throw new SyntaxError("JSON.parse")
        })
    }(), r = window.r || {}, ! function (e) { e.uuid = function () { var e = (new Date).getTime(); return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (t) { var n = (e + Math.random() * 16) % 16 | 0; return e = Math.floor(e / 16), (t == "x" ? n : n & 3 | 8).toString(16) }) } }(r),
    function (e, t) {
        function n(e, n) { n = n || { bubbles: !1, cancelable: !1, detail: t }; var r = document.createEvent("CustomEvent"); return r.initCustomEvent(e, n.bubbles, n.cancelable, n.detail), r }
        if (e.CustomEvent) return;
        n.prototype = e.Event.prototype, e.CustomEvent = n
    }(this),
    function (e, t, n) {
        "use strict";

        function h(n) {
            if (n.origin !== location.origin && !u.test(n.origin) && n.origin !== "null") return;
            try {
                var r = JSON.parse(n.data),
                    i = r.type;
                if (!f.test(i)) return;
                var s = i.split(".", 2)[1];
                if (l[s]) { var o = l[s]; for (var a = 0; a < o.targets.length; a++) e.frames.postMessage(o.targets[a], i, r.data, r.options) }
                var c = new CustomEvent(i, { detail: r.data });
                c.source = n.source, c.options = r.options, t.dispatchEvent(c);
                var h = new CustomEvent("*." + s, { detail: r.data });
                h.source = n.source, h.options = r.options, h.originalType = i, t.dispatchEvent(h)
            } catch (p) {}
        }

        function p(e, n, r) { "addEventListener" in t ? t.addEventListener(e, n, r) : "attachEvent" in t && t.attachEvent("on" + e, n) }

        function d(e, n, r) { "removeEventListener" in t ? t.removeEventListener(e, n) : "detachEvent" in t && t.attachEvent("on" + e, n) }

        function v(e) { return new RegExp("^http(s)?:\\/\\/" + e.join("|") + "$", "i") }

        function m(e) { return new RegExp("\\.(?:" + e.join("|") + ")$") }

        function g(e) { return /\*/.test(e) }
        var r = ".*",
            i = ".postMessage",
            s = { targetOrigin: "*" },
            o = [r],
            u = v(o),
            a = [i],
            f = m(a),
            l = {},
            c = !1,
            y = e.frames = {
                postMessage: function (e, t, n, r) {
                    /\..+$/.test(t) || (t += i), r = r || {};
                    for (var o in s) r.hasOwnProperty(o) || (r[o] = s[o]);
                    e.postMessage(JSON.stringify({ type: t, data: n, options: r }), r.targetOrigin)
                },
                receiveMessage: function (e, t, n, r) {
                    typeof e == "string" && (r = n, n = t, t = e, e = null), r = r || this;
                    var i = function (t) {
                        if (e && e !== t.source && e.contentWindow !== t.source) return;
                        n.apply(r, arguments)
                    };
                    return p(t, i), { off: function () { d(t, i) } }
                },
                proxy: function (e, t) {
                    this.listen(e), Object.prototype.toString.call(t) !== "[object Array]" && (t = [t]);
                    var n = l[e];
                    n ? n.targets = [].concat(n.targets, target) : n = { targets: t }, l[e] = n
                },
                receiveMessageOnce: function (e, t, n, r) { var i = y.receiveMessage(e, t, function () { n && n.apply(this, arguments), i.off() }, r); return i },
                addPostMessageOrigin: function (e) { g(e) ? o = [r] : o.indexOf(e) === -1 && (y.removePostMessageOrigin(r), o.push(e), u = v(o)) },
                removePostMessageOrigin: function (e) {
                    var t = o.indexOf(e);
                    t !== -1 && (o.splice(t, 1), u = v(o))
                },
                listen: function (e) { a.indexOf(e) === -1 && (a.push(e), f = m(a)), c || (p("message", h), c = !0) },
                stopListening: function (e) {
                    var t = a.indexOf(e);
                    t !== -1 && (a.splice(t, 1), a.length ? f = m(a) : (d("message", h), c = !1))
                }
            }
    }(this.r = this.r || {}, this),
    function (e, t, n, r) {
        var i = Object.prototype.hasOwnProperty;
        e.utils = e.utils || {}, e.utils.uuid = t.uuid, e.utils.serialize = function (e) { var t = []; for (var n in e) e.hasOwnProperty(n) && t.push(encodeURIComponent(n) + "=" + encodeURIComponent(e[n])); return t.join("&") }
    }(window.rembeddit = window.rembeddit || {}, r, this),
    function (e, t, n) {
        function o(e, t, n) { for (var r = 0; r < e.length; r++) t.call(n, r, e[r]) }

        function u(e) { return i.test(e.href) && s.test(e.pathname) }

        function a(e) { return u(e) && e.pathname.replace(/^\//, "") }

        function f(e) { return e.endsWith("/") || (e += "/"), e }

        function l(e, t) {
            var n;
            for (var r = 0, i = e.length; r < i; r++)
                if (n = a(e[r])) break;
            var s = "https://" + t + "/" + n;
            return f(s)
        }

        function c(e, t) {
            var n = 0,
                r = t.getAttribute("data-embed-live");
            t.getAttribute("data-embed-parent") === "true" && n++;
            var i = "embed=true&context=" + n + "&depth=" + ++n + "&showedits=" + (r === "true") + "&created=" + t.getAttribute("data-embed-created") + "&uuid=" + t.getAttribute("data-embed-uuid") + "&showmore=false";
            return e + "?" + i
        }
        var i = /^https?:\/\//i,
            s = /\/?r\/[\w_]+\/comments\/(?:\S+\/){2,}[\w_]+\/?/i;
        e.init = function (e, t) {
            e = e || {}, t = t || function () {};
            var n = document.querySelectorAll(".reddit-embed");
            o(n, function (n, i) {
                if (i.getAttribute("data-initialized")) return;
                i.setAttribute("data-initialized", !0);
                var s = document.createElement("iframe"),
                    o = i.getElementsByTagName("a"),
                    u = l(o, i.getAttribute("data-embed-media"));
                if (!u) return;
                r.frames.addPostMessageOrigin(i.getAttribute("data-embed-media")), r.frames.listen("embed"), s.height = s.style.height = 0, s.width = s.style.width = "100%", s.scrolling = "no", s.frameBorder = 0, s.allowTransparency = !0, s.style.display = "none", s.style.maxWidth = "800px", s.style.minWidth = "220px", s.style.margin = "10px 0", s.style.boxShadow = "0 0 5px 0.5px rgba(0, 0, 0, 0.05)", s.style.boxSizing = "border-box", s.src = c(u, i), r.frames.receiveMessageOnce(s, "ping.embed", function (n) { i.parentNode.removeChild(i), s.style.display = "block", t(n), r.frames.postMessage(s.contentWindow, "pong.embed", { type: i.getAttribute("data-embed-parent") === "true" ? "comment_and_parent" : "comment", location: location, options: e }) });
                var a = r.frames.receiveMessage(s, "resize.embed", function (e) {
                    if (!s.parentNode) { a.off(); return }
                    s.height = s.style.height = e.detail + "px"
                });
                i.parentNode.insertBefore(s, i)
            })
        };
        if (e.preview) return;
        e.init()
    }(window.rembeddit = window.rembeddit || {}, window.r, this);