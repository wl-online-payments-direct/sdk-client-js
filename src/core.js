(function (global) {
    var onlinepaymentssdk = {}, modules = {};

    /* SDK internal function */
    onlinepaymentssdk.define = function (module, dependencies, fn) {
        if (dependencies && dependencies.length) {
            for (var i = 0; i < dependencies.length; i++) {
                dependencies[i] = modules[dependencies[i]];
            }
        }
        modules[module] = fn.apply(this, dependencies || []);
    };

    // Export `onlinepaymentssdk` based on environment.
    global.onlinepaymentssdk = onlinepaymentssdk;

    if (typeof exports !== 'undefined') {
        exports.onlinepaymentssdk = onlinepaymentssdk;
    }

    onlinepaymentssdk.define('onlinepaymentssdk.core', [], function () {
        return onlinepaymentssdk;
    });

    // use require.js if available otherwise we use our own
    if (typeof define === 'undefined') {
        global.define = onlinepaymentssdk.define;
    }
} (typeof window === 'undefined' ? this : window));

// (re)define core
define("onlinepaymentssdk.core", [], function () {
    var global = typeof window === 'undefined' ? this : window;
    var onlinepaymentssdk = {};
    global.onlinepaymentssdk = onlinepaymentssdk;
    if (typeof exports !== 'undefined') {
        exports.onlinepaymentssdk = onlinepaymentssdk;
    }
    return onlinepaymentssdk;
});
