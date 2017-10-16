import * as xml2js from 'xml2js';

import { Service } from './Service';

import { EntitySet } from './EntitySet';
import { EntityType } from './EntityType';
import { EntityProperty } from './EntityProperty';
import { Action } from './Action';
import { Function } from './Function';
import { ReturnType } from './ReturnType';
import { ActionAndFunctionParameter } from './ActionAndFunctionParameter';
import { ComplexType } from './ComplexType';
import { Annotation } from './Annotation';
import { Singleton } from './Singleton';

function typeNameFromType(type: string): string {
  return type ? type.split('.').pop() : null;
}

function getEntityBaseTypes(entityType, entityTypes) {
  const baseTypes = [];

  while (entityType) {
    const baseTypeName = typeNameFromType(entityType['$']['BaseType'])
    entityType = entityTypes.find(entity => entity['$']['Name'] == baseTypeName);
    if (entityType) {
      baseTypes.push(entityType);
    }
  }

  return baseTypes;
}

function parseEntitySets(namespace: string, entityContainer: any, entityTypes: any, annotations?: Array<Annotation>): Array<EntitySet> {
  return entityContainer['EntitySet'].map(entitySet => {
    const type = typeNameFromType(entitySet['$']['EntityType']);

    const entityType = entityTypes.find(entity => entity['$']['Name'] == type);

    if (entityType) {
      return parseEntitySet(namespace, entitySet, entityType, entityTypes, annotations);
    }
  }).filter(entitySet => !!entitySet);
}

function parseEntitySet(namespace: string, entitySet: any, entityType: any, entityTypes: Array<any>, annotations?: Array<Annotation>): EntitySet {
  return {
    namespace,
    name: entitySet['$']['Name'],
    entityType: parseEntityType(entityType, entityTypes, namespace),
    annotations: parseEntityTypeAnnotations(namespace, entityType, entityTypes, annotations)
  }
}

function parseEntityPaths(namespace: string, entityType: any, entityTypes: Array<any>): Array<any> {
  const paths = [];

  if (entityType['NavigationProperty']) {
    entityType['NavigationProperty'].forEach(p => {
      if (p['$']['ContainsTarget']) {
        paths.push({ 
          name: p['$']['Name'],
          type: p['$']['Type'],
        })
      }
    });
  }

  return paths;
}

function parseEntityTypeAnnotations(namespace: string, entityType: any, entityTypes: Array<any>, annotations?: Array<Annotation>): Array<any> {
  const allTypes = [entityType].concat(getEntityBaseTypes(entityType, entityTypes));

  const typeAnnotations: Array<string> = [];

  if (annotations) {
    annotations.forEach(a => {
      allTypes.forEach(t => {
        if (a.target == `${namespace}.${t['$']['Name']}`) {
          a.terms.forEach(term => {
            if (typeAnnotations.indexOf(term) == -1) {
              typeAnnotations.push(term)
            }
          })
        }
      })
    })
  }

  return typeAnnotations;
}

function flatten(a) {
  return Array.isArray(a) ? [].concat(...a.map(flatten)) : a;
}

function parseEntityType(entityType: any, entityTypes: Array<any>, namespace?: string): EntityType {
  const entityBaseTypes = getEntityBaseTypes(entityType, entityTypes);
  const entityBaseProperties = flatten(entityBaseTypes.map(t => (t['Property'] || []).map(parseProperty)))

  const result: EntityType = {
    name: entityType['$']['Name'],
    abstract: entityType['$']['Abstract'],
    properties: entityBaseProperties.concat((entityType['Property'] || []).map(parseProperty)),
    paths: parseEntityPaths(namespace, entityType, entityTypes)
  };

  const baseTypeWithKey = entityBaseTypes.find(t => t['Key']);
  const keys = entityType['Key'] || (baseTypeWithKey && baseTypeWithKey['Key']);

  if (keys && keys.length > 0) {
    result.key = parseKey(keys[0], result.properties)
  }

  const navigationProperties = entityType['NavigationProperty'];

  if (navigationProperties && navigationProperties.length > 0) {
    navigationProperties.forEach(property => {
      const type = property['$']['Type']

      if (type) { // OData V4 only
        const ref = `#/definitions/${type.split(/[()]/)[1]}`
        const name = property['$']['Name']

        if (type.startsWith('Collection(')) {
          result.properties.push({
            name: name,
            type: 'array',
            items: {
              $ref: ref
            }
          })
        } else {
          const prop = {
            name: name,
            $ref: `#/definitions/${type}`
          }

          const refConstraint = property['ReferentialConstraint'];
          const constraints = refConstraint ? refConstraint.map(c => {
            return {
              property: c['$']['Property'],
              refProperty: c['$']['ReferencedProperty']
            }
          }) : [];

          prop['x-ref'] = {
            name: name,
            partner: property['$']['Partner'],
            constraints: constraints
          }

          result.properties.push(prop);
        }
      }
    })
  }

  return result;
}

function parseKey(key: any, properties: Array<EntityProperty>): Array<EntityProperty> {
  const refs = key['PropertyRef'].map(propertyRef => propertyRef['$']['Name'])

  return properties.filter(property => refs.includes(property.name));
}

function parseProperty(property: any) {
  return {
    required: property['$']['Nullable'] == 'false',
    name: property['$']['Name'],
    type: property['$']['Type']
  };
}

function parseActions(actions: Array<any>): Array<Action> {
  return actions && actions.length ? actions.map(action => {
    return {
      name: action['$']['Name'],
      isBound: action['$']['IsBound'],
      entitySetPath: action['$']['EntitySetPath'],
      returnType: parseReturnTypes(action['ReturnType']),
      parameters: parseActionAndFunctionParameters(action['Parameter']),
    }
  }) : [];
}

function parseFunctions(functions: Array<any>): Array<Function> {
  return functions && functions.length ? functions.map(func => {
    return {
      name: func['$']['Name'],
      isBound: func['$']['IsBound'],
      isComposable: func['$']['IsComposable'],
      entitySetPath: func['$']['EntitySetPath'],
      returnType: parseReturnTypes(func['ReturnType']),
      parameters: parseActionAndFunctionParameters(func['Parameter']),
    }
  }) : [];
}

function parseReturnTypes(returnType: any): ReturnType {
  return returnType && returnType[0] ? {
    type: returnType[0]['$']['Type'],
    nullable: !(returnType[0]['$']['Nullable'] == 'false'),
  } : null;
}

function parseActionAndFunctionParameters(parameters: any): Array<ActionAndFunctionParameter> {
  return parameters && parameters.length ? parameters.map(parameter => {
    return {
      name: parameter['$']['Name'],
      type: parameter['$']['Type'],
      nullable: !(parameter['$']['Nullable'] == 'false'),
    }
  }) : [];
}

function parseComplexType(complexTypes: Array<any>): Array<ComplexType> {
  return complexTypes && complexTypes.length ? complexTypes.map(t => {
    return {
      name: t['$']['Name'],
      properties: (t['Property'] || []).map(parseProperty)
    }
  }) : [];
}

function parseAnnotations(annotations: Array<any>): Array<Annotation> {
  return annotations && annotations.length ? annotations.map(t => {
    return {
      target: t['$']['Target'],
      terms: (t['Annotation'] || []).map(a => a['$']['Term'])
    }
  }) : [];
}

function parseSingletons(singletons: Array<any>, entitySets: Array<EntitySet>): Array<Singleton> {
  return singletons && singletons.length ? singletons.map(s => {
    return {
      name: s['$']['Name'],
      type: s['$']['Type'],
      properties: (s['NavigationPropertyBinding'] || []).map(n => {
        const entitySet = entitySets.find(es => es.name == n['$']['Target']);
        return {
          name: n['$']['Path'].split('/').pop(),
          type: n['$']['Path'].indexOf('/') != -1 ? `${entitySet.namespace}.${entitySet.entityType.name}` :
            `Collection(${entitySet.namespace}.${entitySet.entityType.name})`
        };
      })
    }
  }) : [];
}

function parseEntityTypes(entityTypes: Array<any>) : Array<EntityType> {
  return entityTypes.map(et => {
    return parseEntityType(et, entityTypes)
  });
}

function parse(xml: string): Promise<Service> {
  return new Promise<Service>((resolve, reject) => {
    xml2js.parseString(xml, (error, metadata) => {
      if (error) {
        return reject(error);
      }

      const version = metadata['edmx:Edmx']['$']['Version']

      const [dataServices] = metadata['edmx:Edmx']['edmx:DataServices']

      const schemas = dataServices['Schema'];

      const entityContainerSchema = schemas.find(schema => schema['EntityContainer'])

      if (!entityContainerSchema) {
        reject(new Error('Cannot find EntityContainer element.'));
      }

      const [entityContainer] = entityContainerSchema['EntityContainer']

      const complexTypes = parseComplexType(entityContainerSchema['ComplexType']);
      const actions = parseActions(entityContainerSchema['Action']);
      const functions = parseFunctions(entityContainerSchema['Function']);
      const annotations = parseAnnotations(entityContainerSchema['Annotations']);

      const entitySets: Array<EntitySet> = [];
      const allEntityTypes: Array<any> = [];

      schemas.forEach(schema => {
        if (schema['EntityType']) {
          const namespace = schema['$']['Namespace'];
          const schemaEntityTypes = schema['EntityType'];
          allEntityTypes.push(...schemaEntityTypes);
          entitySets.push(...parseEntitySets(namespace, entityContainer, schemaEntityTypes, annotations));
        }
      });

      const singletons = parseSingletons(entityContainer['Singleton'], entitySets);

      const defaultNamespace = entityContainerSchema['$']['Namespace'];

      const entityTypes = parseEntityTypes(allEntityTypes)

      resolve({ entitySets: entitySets, version: version, complexTypes, singletons, actions, functions, defaultNamespace, entityTypes });
    });
  });
}

export default parse;
