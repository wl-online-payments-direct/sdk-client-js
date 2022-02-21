define("onlinepaymentssdk.C2SCommunicatorConfiguration", ["onlinepaymentssdk.core"], function (onlinepaymentssdk) {

    var C2SCommunicatorConfiguration = function (sessionDetails, apiVersion) {
        // clientSessionID, assetBaseUrl and apiBaseUrl are deprecated but still may be used. Here we check for presense of new variables, if they dont exist... Use the old variables.
        if (!sessionDetails.clientSessionId) {
            sessionDetails.clientSessionId = sessionDetails.clientSessionID;
        } else if (sessionDetails.clientSessionID) {
            throw new Error("You cannot use both the clientSessionId and the clientSessionID at the same time, please use the clientSessionId only.");
        }
        if (!sessionDetails.assetUrl) {
            sessionDetails.assetUrl = sessionDetails.assetsBaseUrl
        } else if (sessionDetails.assetsBaseUrl) {
            throw new Error("You cannot use both the assetUrl and the assetsBaseUrl at the same time, please use the assetUrl only.");
        }
        if (!sessionDetails.clientApiUrl) {
            sessionDetails.clientApiUrl = sessionDetails.apiBaseUrl
        } else if (sessionDetails.apiBaseUrl) {
            throw new Error("You cannot use both the clientApiUrl and the apiBaseUrl at the same time, please use the clientApiUrl only.");
        }

        this.clientSessionId = sessionDetails.clientSessionId;
        this.customerId = sessionDetails.customerId;

        // ignore the region here
        this.clientApiUrl = sessionDetails.clientApiUrl;
        this.assetUrl = sessionDetails.assetUrl;
        if (!this.clientApiUrl) {
            throw new Error("This version of the onlinepaymentssdk requires an clientApiUrl, which you did not provide.");
        }
        if (!this.assetUrl) {
            throw new Error("This version of the onlinepaymentssdk requires an assetUrl, which you did not provide.");
        }

        // now that the clientApiUrl is set check when if the api version is set in the URL, its the correct version break if not.
        if (this.clientApiUrl.indexOf("//") === -1) {
            throw new Error("A valid URL is required for the clientApiUrl, you provided '" + this.clientApiUrl + "'");
        }
        var tester = this.clientApiUrl.split("/"); // [0] = (http(s): || "") , [1] = "", [2] = "host:port", [3+] = path
        if (tester[0] !== "" && tester[0].indexOf("http") !== 0) {
            throw new Error("A valid URL is required for the clientApiUrl, you provided '" + this.clientApiUrl + "'");
        }
        // if you cannot provide an URL that starts with (http(s)::)// and want an error: please provide a PR :)

        var path = tester.splice(3).join("/"); // the path (if no path; path = "").
        if (!path) { //If path == ""
            this.clientApiUrl += "/" + apiVersion;
        } else if (path === 'client') { //If path == client
            this.clientApiUrl += "/" + apiVersion.split('/')[1];
        } else if (path.indexOf(apiVersion) !== 0 || path.length !== apiVersion.length) {
            throw new Error("This version of the onlinepaymentssdk is only compatible with " + apiVersion + ", you supplied: '" + path + "'");
        }
    };
    onlinepaymentssdk.C2SCommunicatorConfiguration = C2SCommunicatorConfiguration;
    return C2SCommunicatorConfiguration;
});