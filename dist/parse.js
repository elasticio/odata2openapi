"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var xml2js = require("xml2js");
function parseEntitySets(namespace, entityContainer, entityTypes) {
    return entityContainer['EntitySet'].map(function (entitySet) {
        var type = entitySet['$']['EntityType'].split('.').pop();
        var entityType = entityTypes.find(function (entity) { return entity['$']['Name'] == type; });
        if (entityType) {
            return parseEntitySet(namespace, entitySet, entityType);
        }
    }).filter(function (entitySet) { return !!entitySet; });
}
function parseEntitySet(namespace, entitySet, entityType) {
    return {
        namespace: namespace,
        name: entitySet['$']['Name'],
        entityType: parseEntityType(entityType)
    };
}
function parseEntityType(entityType) {
    var result = {
        name: entityType['$']['Name'],
        properties: entityType['Property'] ? entityType['Property'].map(parseProperty) : []
    };
    var keys = entityType['Key'];
    if (keys && keys.length > 0) {
        result.key = parseKey(keys[0], result.properties);
    }
    var navigationProperties = entityType['NavigationProperty'];
    if (navigationProperties && navigationProperties.length > 0) {
        navigationProperties.forEach(function (property) {
            var type = property['$']['Type'];
            if (type) {
                var ref = "#/definitions/" + type.split(/[()]/)[1];
                var name = property['$']['Name'];
                if (type.startsWith('Collection(')) {
                    result.properties.push({
                        name: name,
                        type: 'array',
                        items: {
                            $ref: ref
                        }
                    });
                }
                else {
                    var prop = {
                        name: name,
                        $ref: "#/definitions/" + type
                    };
                    var refConstraint = property['ReferentialConstraint'];
                    var constraints = refConstraint ? refConstraint.map(function (c) {
                        return {
                            property: c['$']['Property'],
                            refProperty: c['$']['ReferencedProperty']
                        };
                    }) : [];
                    prop['x-ref'] = {
                        name: name,
                        partner: property['$']['Partner'],
                        constraints: constraints
                    };
                    result.properties.push(prop);
                }
            }
        });
    }
    return result;
}
function parseKey(key, properties) {
    var refs = key['PropertyRef'].map(function (propertyRef) { return propertyRef['$']['Name']; });
    return properties.filter(function (property) { return refs.includes(property.name); });
}
function parseProperty(property) {
    return {
        required: property['$']['Nullable'] == 'false',
        name: property['$']['Name'],
        type: property['$']['Type']
    };
}
function parse(xml) {
    return new Promise(function (resolve, reject) {
        xml2js.parseString(xml, function (error, metadata) {
            if (error) {
                return reject(error);
            }
            var version = metadata['edmx:Edmx']['$']['Version'];
            var dataServices = metadata['edmx:Edmx']['edmx:DataServices'][0];
            var schemas = dataServices['Schema'];
            var entityContainerSchema = schemas.find(function (schema) { return schema['EntityContainer']; });
            if (!entityContainerSchema) {
                reject(new Error('Cannot find EntityContainer element.'));
            }
            var entityContainer = entityContainerSchema['EntityContainer'][0];
            var entitySets = [];
            schemas.forEach(function (schema) {
                if (schema['EntityType']) {
                    var namespace = schema['$']['Namespace'];
                    var entityTypes = schema['EntityType'];
                    entitySets.push.apply(entitySets, parseEntitySets(namespace, entityContainer, entityTypes));
                }
            });
            resolve({ entitySets: entitySets, version: version });
        });
    });
}
exports.default = parse;
//# sourceMappingURL=parse.js.map