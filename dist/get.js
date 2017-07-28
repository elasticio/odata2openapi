"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
var https = require("https");
var url = require("url");
function get(protocol, host, path, options, requestOptions) {
    return new Promise(function (resolve, reject) {
        var fetcher = (protocol.startsWith('https:') ? https.request : http.request);
        var request = fetcher(options, function (response) {
            var result = '';
            response.on('data', function (chunk) {
                result += chunk;
            });
            response.on('end', function () {
                var statusCode = response.statusCode, headers = response.headers;
                if (statusCode >= 300 && statusCode < 400) {
                    var u = url.parse(headers['location']);
                    get(u.protocol, u.host, u.path).then(resolve, reject);
                }
                else if (statusCode >= 200 && statusCode < 300) {
                    resolve(result);
                }
                else {
                    reject(new Error("Unexpected response: " + response));
                }
            });
        });
        request.on('error', reject);
        request.end();
    });
}
exports.default = get;
//# sourceMappingURL=get.js.map