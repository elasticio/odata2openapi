"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var defaultResponse = {
    description: 'Unexpected error',
    schema: {
        $ref: '#/definitions/Error'
    }
};
var registeredOperations = new Set();
function verifyOperationIdUniqueness(operationId) {
    if (registeredOperations.has(operationId)) {
        throw new Error(operationId + " is a duplicate operationId.");
    }
    registeredOperations.add(operationId);
    return operationId;
}
function entitySetGet(entitySet, oDataVersion) {
    return {
        operationId: verifyOperationIdUniqueness("get" + entitySet.name),
        parameters: [{
                name: '$filter',
                type: 'string',
                required: false,
                in: 'query'
            },
            {
                name: '$top',
                type: 'integer',
                required: false,
                in: 'query'
            },
            {
                name: '$skip',
                type: 'integer',
                required: false,
                in: 'query'
            },
            {
                name: '$orderby',
                type: 'string',
                required: false,
                in: 'query'
            },
            {
                name: '$expand',
                type: 'string',
                required: false,
                in: 'query'
            },
            {
                name: oDataVersion == '4.0' ? '$count' : '$inlinecount',
                type: oDataVersion == '4.0' ? 'boolean' : 'string',
                required: false,
                in: 'query'
            }],
        responses: {
            '200': {
                description: "List of " + entitySet.entityType.name,
                schema: {
                    type: 'object',
                    properties: {
                        value: {
                            type: 'array',
                            items: {
                                $ref: "#/definitions/" + entitySet.namespace + "." + entitySet.entityType.name
                            }
                        }
                    }
                }
            },
            default: defaultResponse
        }
    };
}
function entitySetPost(entitySet) {
    return {
        operationId: verifyOperationIdUniqueness("create" + entitySet.entityType.name),
        parameters: [
            {
                name: entitySet.entityType.name,
                in: 'body',
                required: true,
                schema: {
                    $ref: "#/definitions/" + entitySet.namespace + "." + entitySet.entityType.name
                }
            }
        ],
        responses: {
            '201': {
                description: "Created entity",
                schema: {
                    $ref: "#/definitions/" + entitySet.namespace + "." + entitySet.entityType.name
                }
            },
            default: defaultResponse
        }
    };
}
function entitySetOperations(entitySet, oDataVersion) {
    return {
        get: entitySetGet(entitySet, oDataVersion),
        post: entitySetPost(entitySet)
    };
}
function entityTypeOperations(entitySet) {
    return {
        get: entityTypeGet(entitySet),
        delete: entityTypeDelete(entitySet),
        patch: entityTypePatch(entitySet)
    };
}
function keyParameters(entitySet) {
    return entitySet.entityType.key.map(function (entityProperty) {
        var _a = property(entityProperty.type), type = _a.type, format = _a.format;
        var parameter = {
            name: entityProperty.name,
            required: true,
            in: 'path',
            type: type
        };
        if (format) {
            parameter.format = format;
        }
        return parameter;
    });
}
function entityTypeGet(entitySet) {
    return {
        operationId: verifyOperationIdUniqueness("get" + entitySet.entityType.name + "ById"),
        parameters: keyParameters(entitySet),
        responses: {
            '200': {
                description: "A " + entitySet.entityType.name + ".",
                schema: {
                    $ref: "#/definitions/" + entitySet.namespace + "." + entitySet.entityType.name
                }
            },
            default: defaultResponse
        }
    };
}
function entityTypeDelete(entitySet) {
    return {
        operationId: verifyOperationIdUniqueness("delete" + entitySet.entityType.name),
        parameters: keyParameters(entitySet),
        responses: {
            '204': {
                description: "Empty response.",
            },
            default: defaultResponse
        }
    };
}
function entityTypePatch(entitySet) {
    var parameters = keyParameters(entitySet);
    parameters.push({
        name: entitySet.entityType.name,
        in: 'body',
        required: true,
        schema: {
            $ref: "#/definitions/" + entitySet.namespace + "." + entitySet.entityType.name
        }
    });
    return {
        operationId: verifyOperationIdUniqueness("update" + entitySet.entityType.name),
        parameters: parameters,
        responses: {
            '200': {
                description: "A " + entitySet.entityType.name + ".",
                schema: {
                    $ref: "#/definitions/" + entitySet.namespace + "." + entitySet.entityType.name
                }
            },
            '204': {
                description: "Empty response.",
            },
            default: defaultResponse
        }
    };
}
function paths(entitySets, oDataVersion) {
    var paths = {};
    entitySets.forEach(function (entitySet) {
        paths["/" + entitySet.name] = entitySetOperations(entitySet, oDataVersion);
        if (entitySet.entityType.key) {
            var keys = entitySet.entityType.key.map(function (property) {
                switch (property.type) {
                    case 'Edm.Int16':
                    case 'Edm.Int32':
                    case 'Edm.Int64':
                    case 'Edm.Double':
                    case 'Edm.Single':
                    case 'Edm.Decimal':
                        return "{" + property.name + "}";
                }
                return "'{" + property.name + "}'";
            });
            var path = "/" + entitySet.name + "(" + keys.join(',') + ")";
            paths[path] = entityTypeOperations(entitySet);
        }
    });
    return paths;
}
function definitions(entitySets) {
    var definitions = {
        'Error': {
            type: 'object',
            properties: {
                error: {
                    type: 'object',
                    properties: {
                        code: {
                            type: 'string'
                        },
                        message: {
                            type: 'string'
                        }
                    }
                }
            }
        }
    };
    entitySets.forEach(function (entitySet) {
        var type = entitySet.namespace + "." + entitySet.entityType.name;
        definitions[type] = schema(entitySet.entityType);
    });
    return definitions;
}
function schema(entityType) {
    var required = entityType.properties.filter(function (property) { return property.required; }).map(function (property) { return property.name; });
    var schema = {
        type: 'object',
        properties: properties(entityType.properties),
    };
    if (required.length > 0) {
        schema.required = required;
    }
    return schema;
}
function properties(properties) {
    var result = {};
    properties.forEach(function (_a) {
        var name = _a.name, type = _a.type;
        result[name] = property(type);
    });
    return result;
}
function property(type) {
    var property = {
        type: type == 'array' ? 'array' : 'object'
    };
    switch (type) {
        case 'Edm.Int16':
        case 'Edm.Int32':
            property.type = 'integer';
            property.format = 'int32';
            break;
        case 'Edm.Int64':
            property.type = 'integer';
            property.format = 'int64';
            break;
        case 'Edm.Boolean':
            property.type = 'boolean';
            break;
        case 'Edm.String':
            property.type = 'string';
            break;
        case 'Edm.Byte':
            property.type = 'string';
            property.format = 'byte';
            break;
        case 'Edm.Binary':
            property.type = 'string';
            property.format = 'base64';
            break;
        case 'Edm.DateTime':
        case 'Edm.DateTimeOffset':
            property.type = 'string';
            property.format = 'date-time';
            break;
        case 'Edm.Decimal':
        case 'Edm.Double':
            property.type = 'number';
            property.format = 'double';
            break;
        case 'Edm.Guid':
            property.type = 'string';
            property.format = 'uuid';
            break;
        case 'Edm.Single':
            property.type = 'number';
            property.format = 'single';
            break;
    }
    return property;
}
function filter(entitySets, wanted) {
    return entitySets.filter(function (entitySet) { return wanted.includes(entitySet.name); });
}
function convert(entitySets, options, oDataVersion) {
    registeredOperations.clear();
    return {
        swagger: '2.0',
        host: options.host,
        produces: ['application/json'],
        basePath: options.basePath || '/',
        info: (_a = {
                title: 'OData Service',
                version: '0.0.1'
            },
            _a['x-odata-version'] = oDataVersion,
            _a),
        paths: paths(options.include ? filter(entitySets, options.include) : entitySets, oDataVersion),
        definitions: definitions(entitySets)
    };
    var _a;
}
exports.default = convert;
//# sourceMappingURL=convert.js.map