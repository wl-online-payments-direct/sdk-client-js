(function (global) {
    var directsdk = {}, modules = {};

    /* SDK internal function */
    directsdk.define = function (module, dependencies, fn) {
        if (dependencies && dependencies.length) {
            for (var i = 0; i < dependencies.length; i++) {
                dependencies[i] = modules[dependencies[i]];
            }
        }
        modules[module] = fn.apply(this, dependencies || []);
    };

    // Export `directsdk` based on environment.
    global.directsdk = directsdk;

    if (typeof exports !== 'undefined') {
        exports.directsdk = directsdk;
    }

    directsdk.define('directsdk.core', [], function () {
        return directsdk;
    });

    // use require.js if available otherwise we use our own
    if (typeof define === 'undefined') {
        global.define = directsdk.define;
    }
} (typeof window === 'undefined' ? this : window));

// (re)define core
define("directsdk.core", [], function () {
    var global = typeof window === 'undefined' ? this : window;
    var directsdk = {};
    global.directsdk = directsdk;
    if (typeof exports !== 'undefined') {
        exports.directsdk = directsdk;
    }
    return directsdk;
});
