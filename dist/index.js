"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var url = require("url");
var get_1 = require("./get");
var parse_1 = require("./parse");
exports.parse = parse_1.default;
var convert_1 = require("./convert");
exports.convert = convert_1.default;
function odata2openapi(metadataUrl, options, requestOptions, headers) {
    var _a = url.parse(metadataUrl), path = _a.path, host = _a.host, protocol = _a.protocol;
    if (!options) {
        options = {
            basePath: path.replace(/\/\$metadata$/, ''),
            host: host
        };
    }
    if (!headers) {
        headers = {
            'Accept': '*/*',
            'User-Agent': 'odata2openapi'
        };
    }
    if (!requestOptions) {
        var hostSplit = host.split(':');
        requestOptions = {
            hostname: hostSplit[0],
            port: hostSplit.length > 1 ? Number(hostSplit[1]) : 80,
            method: 'GET',
            headers: headers,
            path: path
        };
    }
    return get_1.default(protocol, host, path, options, requestOptions).then(parse_1.default).then(function (service) { return convert_1.default(service.entitySets, options, service.version); });
}
exports.odata2openapi = odata2openapi;
//# sourceMappingURL=index.js.map