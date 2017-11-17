import { Swagger } from './Swagger';
import { Paths } from './Paths';
import { Property } from './Property';
import { Schema } from './Schema';
import { PathItem } from './PathItem';
import { Operation } from './Operation';
import { Definitions } from './Definitions';
import { Options } from './Options';
import { EntitySet } from './EntitySet';
import { EntityType } from './EntityType';
import { EntityProperty } from './EntityProperty';
import { Parameter } from './Parameter';
import { Action } from './Action';
import { Function } from './Function';
import { Response } from './Response';
import { ComplexType } from './ComplexType';
import { ActionAndFunctionParameter } from './ActionAndFunctionParameter';


function nameFromParentPath(parentPath: string): string {
  return parentPath ? parentPath.split('/').map(p => upperFirst(p.split('(').shift())).join('') : ''
}

function operationName(parentPath: string, name: string) {
  return `${upperFirst(nameFromParentPath(parentPath))}${parentPath ? '' : upperFirst(name)}`;
}

function typeNameFromCollectionType(type: string): string {
  return type.split(/[()]/)[1];
}

function typeNameFromType(type: string): string {
  return type.split('.').pop();
}

function fullTypeNameFromCollectionType(type: string): string {
  return typeNameFromType(typeNameFromCollectionType(type));
}

function isCollection(name: string): boolean {
  return name.startsWith('Collection(');
}

function isBindingParameter(name: string): boolean {
  return name.toLowerCase() == 'bindingparameter' || name.toLowerCase() == 'bindparameter';
}

function parametersWithoutBindingParameter(parameters: Array<ActionAndFunctionParameter>): Array<ActionAndFunctionParameter> {
  return parameters.filter(p => !isBindingParameter(p.name));
}

function bindingParameterFromParameters(parameters: Array<ActionAndFunctionParameter>): ActionAndFunctionParameter {
  return parameters ? parameters.find(p => isBindingParameter(p.name)) : null;
}

function pathParametersFromParameters(parameters: Array<ActionAndFunctionParameter>): string {
  return parametersWithoutBindingParameter(parameters || []).map(
    p =>
      p.type == 'string'
        ? `${p.name}='{${p.name}}'`
        : `${p.name}={${p.name}}`
  ).join(',');
}

function isFunction(item: Action | Function, options: Options): boolean {
  return options.functions && options.functions.indexOf(<Function>item) != -1;
}

const defaultResponse = {
  description: 'Unexpected error',
  schema: {
    $ref: '#/definitions/Error'
  }
}

function defaultEntitySetParameters(oDataVersion: string): Array<Parameter> {
  return [{
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
  }];
}

const registeredOperations = new Set<string>();

function verifyOperationIdUniqueness(operationId: string): string {
  if (registeredOperations.has(operationId)) {
    throw new Error(`${operationId} is a duplicate operationId.`);
  }

  registeredOperations.add(operationId);

  return operationId;
}

function parentKeyParameters(parentTypes: Array<EntityType>) {
  const parameters = [];
  let i = 0;

  (parentTypes || []).filter((v, i, a) => a.indexOf(v) === i).forEach(pt => {
    (pt.key || []).forEach(entityProperty => {
      const { type, format } = property(entityProperty.type);

      const parameter: Parameter = {
        name: i > 0 ? `${lowerFirst(pt.name)}${upperFirst(entityProperty.name)}` : `${entityProperty.name}`,
        required: true,
        in: 'path',
        type
      };

      if (format) {
        parameter.format = format;
      }

      if (!parameters.find(p => p.name == parameter.name)) {
        parameters.push(parameter)
      }

      i++;
    })
  })

  return parameters;
}

function keyParameters(entitySet: EntitySet, parentTypes: Array<EntityType>, parentType?: EntityType): Array<Parameter> {
  const parameters = parentKeyParameters(parentTypes);

  entitySet.entityType.key.forEach(entityProperty => {
    const { type, format } = property(entityProperty.type);

    const parameter: Parameter = {
      name: parentType ? `${lowerFirst(entitySet.entityType.name)}${upperFirst(entityProperty.name)}` : `${entityProperty.name}`,
      required: true,
      in: 'path',
      type
    };

    if (format) {
      parameter.format = format;
    }

    if (!parameters.find(p => p.name == parameter.name)) {
      parameters.push(parameter)
    }

  });

  return parameters;
}

function keyNames(entitySet: EntitySet, parentType?: EntityType): Array<string> {
  if (entitySet.entityType.key) {
    return entitySet.entityType.key.map(property => {
      switch (property.type) {
        case 'Edm.Int16':
        case 'Edm.Int32':
        case 'Edm.Int64':
        case 'Edm.Double':
        case 'Edm.Single':
        case 'Edm.Decimal':
          return parentType ? `{${lowerFirst(entitySet.entityType.name)}${upperFirst(property.name)}}` : `{${property.name}}`
      }

      return parentType ? `'{${lowerFirst(entitySet.entityType.name)}${upperFirst(property.name)}}'` : `'{${property.name}}'`
    });
  }
  return [];
}

function entitySetParameters(typeAnnotations: Array<any>, parentTypes: Array<EntityType>, oDataVersion?: string) {
  const parameters = parentKeyParameters(parentTypes).concat(defaultEntitySetParameters(oDataVersion));

  if (typeAnnotations) {
    typeAnnotations.forEach(a => {
      if (a.indexOf('SkipSupported') != -1) {
        const skipIndex = parameters.findIndex(p => p.name == '$skip');
        if (skipIndex != -1) {
          parameters.splice(skipIndex, 1);
        }
      }

      if (a.indexOf('TopSupported') != -1) {
        const topIndex = parameters.findIndex(p => p.name == '$top');
        if (topIndex != -1) {
          parameters.splice(topIndex, 1);
        }
      }

      if (a.indexOf('CountRestrictions') != -1) {
        const countIndex = parameters.findIndex(p => p.name == '$count');
        if (countIndex != -1) {
          parameters.splice(countIndex, 1);
        }
      }

      if (a.indexOf('FilterRestrictions') != -1) {
        const filterIndex = parameters.findIndex(p => p.name == '$filter');
        if (filterIndex != -1) {
          parameters.splice(filterIndex, 1);
        }
      }

      if (a.indexOf('ExpandRestrictions') != -1) {
        const expandIndex = parameters.findIndex(p => p.name == '$expand');
        if (expandIndex != -1) {
          parameters.splice(expandIndex, 1);
        }
      }

      if (a.indexOf('SortRestrictions') != -1) {
        const orderbyIndex = parameters.findIndex(p => p.name == '$orderby');
        if (orderbyIndex != -1) {
          parameters.splice(orderbyIndex, 1);
        }
      }
    });
  }

  return parameters;
}

function entitySetGet(entitySet: EntitySet, parentTypes: Array<EntityType>, parentPath?: string, oDataVersion?: string): Operation {
  return {
    operationId: verifyOperationIdUniqueness(`get${operationName(parentPath, entitySet.name)}`),
    parameters: entitySetParameters(entitySet.annotations, parentTypes, oDataVersion),
    responses: {
      '200': {
        description: `List of ${entitySet.entityType.name}`,
        schema: {
          type: 'object',
          properties: {
            value: {
              type: 'array',
              items: {
                $ref: `#/definitions/${entitySet.namespace}.${entitySet.entityType.name}`
              }
            }
          }
        }
      },
      default: defaultResponse
    }
  };
}

function operationNameForType(entityTypeName: string, entitySetName: string, parentPath?: string, prefix?: string, suffix?: string) {
  let operationId = `${prefix || ''}${operationName(parentPath, entityTypeName)}${suffix || ''}`;

  if (registeredOperations.has(operationId)) {
    operationId = `${prefix || ''}${operationName(parentPath, entitySetName + entityTypeName)}${suffix || ''}`;
  }

  return operationId;
}

function entitySetPost(entitySet: EntitySet, parentTypes: Array<EntityType>, parentPath?: string): Operation {
  return {
    operationId: verifyOperationIdUniqueness(`${operationNameForType(entitySet.entityType.name, entitySet.name, parentPath, 'create')}`),
    parameters: parentKeyParameters(parentTypes).concat([
      {
        name: entitySet.entityType.name,
        in: 'body',
        required: true,
        schema: {
          $ref: `#/definitions/${entitySet.namespace}.${entitySet.entityType.name}`
        }
      }
    ]),
    responses: {
      '201': {
        description: "Created entity",
        schema: {
          $ref: `#/definitions/${entitySet.namespace}.${entitySet.entityType.name}`
        }
      },
      default: defaultResponse
    }
  }
}

function entitySetOperations(entitySet: EntitySet, parentTypes: Array<EntityType>, parentPath?: string, oDataVersion?: string): PathItem {
  return {
    get: entitySetGet(entitySet, parentTypes, parentPath, oDataVersion),
    post: entitySetPost(entitySet, parentTypes, parentPath)
  };
}

function entityTypeOperations(entitySet: EntitySet, parentTypes: Array<EntityType>, parentType?: EntityType, parentPath?: string): PathItem {
  const operations = {
    get: entityTypeGet(entitySet, parentTypes, parentType, parentPath),
    delete: entityTypeDelete(entitySet, parentTypes, parentType, parentPath),
    patch: entityTypeUpdate('update', entitySet, parentTypes, parentType, parentPath)
  };

  if (parentPath) {
    operations['put'] = entityTypeUpdate('put', entitySet, parentTypes, parentType, parentPath)
  }

  return operations;
}

function entityTypeGet(entitySet: EntitySet, parentTypes: Array<EntityType>, parentType?: EntityType, parentPath?: string): Operation {
  return {
    operationId: verifyOperationIdUniqueness(`${operationNameForType(entitySet.entityType.name, entitySet.name, parentPath, 'get', 'ById')}`),
    parameters: keyParameters(entitySet, parentTypes, parentType),
    responses: {
      '200': {
        description: `A ${entitySet.entityType.name}.`,
        schema: {
          $ref: `#/definitions/${entitySet.namespace}.${entitySet.entityType.name}`
        }
      },
      default: defaultResponse
    }
  };
}

function entityTypeDelete(entitySet: EntitySet, parentTypes: Array<EntityType>, parentType?: EntityType, parentPath?: string): Operation {
  return {
    operationId: verifyOperationIdUniqueness(`${operationNameForType(entitySet.entityType.name, entitySet.name, parentPath, 'delete')}`),
    parameters: keyParameters(entitySet, parentTypes, parentType),
    responses: {
      '204': {
        description: `Empty response.`,
      },
      default: defaultResponse
    }
  };
}
function entityTypeUpdate(prefix: string, entitySet: EntitySet, parentTypes: Array<EntityType>, parentType?: EntityType, parentPath?: string): Operation {
  const parameters = keyParameters(entitySet, parentTypes, parentType);

  parameters.push({
    name: entitySet.entityType.name,
    in: 'body',
    required: true,
    schema: {
      $ref: `#/definitions/${entitySet.namespace}.${entitySet.entityType.name}`
    }
  });

  return {
    operationId: verifyOperationIdUniqueness(`${operationNameForType(entitySet.entityType.name, entitySet.name, parentPath, prefix)}`),
    parameters,
    responses: {
      '200': {
        description: `A ${entitySet.entityType.name}.`,
        schema: {
          $ref: `#/definitions/${entitySet.namespace}.${entitySet.entityType.name}`
        }
      },
      '204': {
        description: `Empty response.`,
      },
      default: defaultResponse
    }
  };
}

function addActionsAndFunctionsToPaths(paths: Paths, entitySets: Array<EntitySet>, options: Options) {
  const actionsAndFunctions = [].concat(options.actions || []).concat(options.functions || []);

  actionsAndFunctions.forEach((item: Action | Function) => {
    const isFunc = isFunction(item, options);

    const verb = isFunc ? 'get' : 'post';
    const parameters = actionOrFunctionParameters(item, isFunc);
    const responses = actionOrFunctionResponses(item);

    const pathParameters = isFunc ? pathParametersFromParameters(item.parameters) : '';

    if (item.isBound) {
      const bindingParameter = bindingParameterFromParameters(item.parameters);

      if (bindingParameter) {
        let entitySet;
        let params;
        let keyParams = [];

        if (isCollection(bindingParameter.type)) {
          entitySet = entitySets.find(es => es.entityType.name == fullTypeNameFromCollectionType(bindingParameter.type));
        } else {
          entitySet = entitySets.find(es => es.entityType.name == typeNameFromType(bindingParameter.type));

          if (entitySet && entitySet.entityType.key) {
            entitySet.entityType.key.forEach(property => {
              keyParams.push({
                name: `${property.name}`,
                required: true,
                in: 'path',
                type: edmTypeToSwaggerType(property.type).name
              })
            });

            params = `(${keyNames(entitySet).join(',')})`
          }
        }

        if (entitySet) {
          const itemPath = `${entitySet.name}${params || ''}/${options.defaultNamespace ? options.defaultNamespace + '.' : ''}${item.name}`
          setActionOrFunctionOperation(item, paths, `/${itemPath}(${pathParameters})`, verb, parameters.concat(keyParams), responses, options.defaultNamespace);
        }
      }
    } else {
      setActionOrFunctionOperation(item, paths, `/${item.name}(${pathParameters})`, verb, parameters, responses, options.defaultNamespace);
    }
  });
}

function addContainmentActionsAndFunctionsBoundToCollectionToPaths(paths: Paths, path: { name: string, type: string }, entitySet: EntitySet, options: Options, entityTypePath: string, parentTypes: Array<EntityType>) {
  const containmentBoundFunctionsOrActions = [].concat(options.actions || []).concat(options.functions || []).filter(i => i.isBound &&
    i.parameters.find(par => isBindingParameter(par.name) && par.type == path.type));

  containmentBoundFunctionsOrActions.forEach(item => {
    const isFunc = isFunction(item, options);
    const pathParameters = isFunc ? pathParametersFromParameters(item.parameters) : '';
    const itemParameters = actionOrFunctionParameters(item, isFunc);

    let keyParams = parentKeyParameters(parentTypes);
    if (entitySet.entityType.key) {
      entitySet.entityType.key.forEach(property => {
        const paramName = keyParams.length > 0 ? `${lowerFirst(entitySet.entityType.name)}${upperFirst(property.name)}` : `${property.name}`;
        if (!keyParams.find(kp => kp.name == paramName) && !itemParameters.find(p => p.name == paramName)) {
          keyParams.push({
            name: paramName,
            required: true,
            in: 'path',
            type: edmTypeToSwaggerType(property.type).name
          })
        }
      });
    }

    setActionOrFunctionOperation(item,
      paths,
      `${entityTypePath}/${path.name}/${options.defaultNamespace ? options.defaultNamespace + '.' : ''}${item.name}(${pathParameters})`,
      isFunc ? 'get' : 'post',
      itemParameters.concat(keyParams),
      actionOrFunctionResponses(item), options.defaultNamespace);
  })
}

function addContainmentPathsRecursive(paths: Paths, entitySet: EntitySet, options: Options, entityTypePath: string, parentPath: string, parentTypes: Array<EntityType>, parentType: EntityType, oDataVersion?: string) {
  if (entitySet.entityType.paths) {
    entitySet.entityType.paths.filter(p => entityTypePath.indexOf(`/${p.name}`) == -1 || entityTypePath.indexOf(`/${p.name}(`) == -1).forEach(p => {

      if (isCollection(p.type)) {
        // Collection: GET, POST, etc.
        const typeName = typeNameFromCollectionType(p.type);
        const entityType = options.entityTypes.find(et => `${entitySet.namespace}.${et.name}` == typeName);
        if (entityType) {
          addContainmentActionsAndFunctionsBoundToCollectionToPaths(paths, p, entitySet, options, entityTypePath, parentTypes)

          if (!paths[`${entityTypePath}/${p.name}`]) {
            pathsRecursive({
              entitySets: [{
                name: p.name,
                entityType: entityType,
                namespace: entitySet.namespace
              }],
              options,
              oDataVersion,
              paths,
              parentPath: entityTypePath,
              parentTypes: parentTypes ? parentTypes.concat([entitySet.entityType]) : [entitySet.entityType],
              parentType: entitySet.entityType
            });
          }
        }
      } else {
        // Single entity: GET and PUT
        const entityType = options.entityTypes.find(et => `${entitySet.namespace}.${et.name}` == p.type);
        if (entityType) {
          const keyPath = `${entitySet.name}(${keyNames(entitySet, parentType).join(',')})`
          const entityTypePath = `${parentPath || ''}/${keyPath}/${p.name}`
          if (!paths[entityTypePath]) {
            const oid = `${upperFirst(nameFromParentPath(parentPath))}${upperFirst(entitySet.name)}${upperFirst(p.name)}`;
            paths[entityTypePath] = {
              get: {
                operationId: verifyOperationIdUniqueness(`get${oid}`),
                parameters: keyParameters(entitySet, parentTypes, parentType),
                responses: {
                  '200': {
                    description: `A ${p.name}.`,
                    schema: {
                      $ref: `#/definitions/${p.type}`
                    }
                  },
                  default: defaultResponse
                }
              },
              put: {
                operationId: verifyOperationIdUniqueness(`put${oid}`),
                parameters: keyParameters(entitySet, parentTypes, parentType).concat([{
                  name: p.name,
                  in: 'body',
                  required: true,
                  schema: {
                    $ref: `#/definitions/${p.type}`
                  }
                }]),
                responses: {
                  '200': {
                    description: `A ${p.name}.`,
                    schema: {
                      $ref: `#/definitions/${p.type}`
                    }
                  },
                  '204': {
                    description: `Empty response.`,
                  },
                  default: defaultResponse
                }
              }
            }
          }
        }

      }

    });
  }
}

function addSingletonsToPaths(paths: Paths, options: Options) {
  if (options.singletons) {
    options.singletons.forEach(singleton => {
      const singletonPath = `/${singleton.name}`;
      paths[singletonPath] = {
        get: {
          operationId: verifyOperationIdUniqueness(`get${upperFirst(singleton.name)}`),
          parameters: [],
          responses: {
            '200': {
              description: `A ${singleton.type}.`,
              schema: {
                $ref: `#/definitions/${singleton.type}`
              }
            },
            default: defaultResponse
          }
        }
      };

      if (singleton.properties) {
        singleton.properties.filter(p => singletonPath.indexOf(`/${p.name}`) == -1 || singletonPath.indexOf(`/${p.name}(`) == -1).forEach(p => {
          if (isCollection(p.type)) {
            const typeName = typeNameFromCollectionType(p.type);
            const entityType = options.entityTypes.find(et => `${options.defaultNamespace}.${et.name}` == typeName);
            if (entityType) {

            }
          } else {
            const entityType = options.entityTypes.find(et => `${options.defaultNamespace}.${et.name}` == p.type);
            if (entityType) {
              const entityTypePath = `/${singleton.name}/${p.name}`
              if (!paths[entityTypePath]) {
                const oid = `get${upperFirst(singleton.name)}${upperFirst(p.name)}`;
                paths[entityTypePath] = {
                  get: {
                    operationId: verifyOperationIdUniqueness(oid),
                    parameters: [],
                    responses: {
                      '200': {
                        description: `A ${p.name}.`,
                        schema: {
                          $ref: `#/definitions/${p.type}`
                        }
                      },
                      default: defaultResponse
                    }
                  }
                }
              }
            }
          }
        });
      }
    });
  }
}

function pathsRecursive({ entitySets, options, oDataVersion, paths, parentPath, parentTypes, parentType }: PathsRecursiveOptions): Paths {
  entitySets.forEach(entitySet => {

    const entitySetPath = `${parentPath || ''}/${entitySet.name}`;
    paths[entitySetPath] = entitySetOperations(entitySet, parentTypes, parentType ? entitySetPath : null, oDataVersion);

    if (entitySet.entityType.key) {
      const keyPath = `${entitySet.name}(${keyNames(entitySet, parentType).join(',')})`
      const entityTypePath = `${parentPath || ''}/${keyPath}`

      paths[entityTypePath] = entityTypeOperations(entitySet, parentTypes, parentType, parentType ? entityTypePath : null)

      entitySet.entityType.properties.filter(p => p.type == 'Edm.Stream').forEach(p => {

        const nameParameter = `fileName`;

        const parameters = keyParameters(entitySet, parentTypes, parentType).concat([{
          name: nameParameter,
          in: 'path',
          required: true,
          type: 'object'
        }, {
          name: 'file',
          in: 'body',
          required: true,
          type: 'object'
        }]);

        const propertyPutPath = `${parentPath || ''}/${entitySet.name}('{${nameParameter}}')/${p.name}`;

        if (!paths[propertyPutPath]) {
          paths[propertyPutPath] = {
            put: {
              operationId: verifyOperationIdUniqueness(`upload${operationName(parentPath, entitySet.entityType.name)}${upperFirst(entitySet.name)}${upperFirst(p.name)}`),
              parameters,
              responses: {
                '200': {
                  description: `A ${entitySet.entityType.name}.`,
                  schema: {
                    $ref: `#/definitions/${entitySet.namespace}.${entitySet.entityType.name}`
                  }
                },
                '204': {
                  description: `Empty response.`,
                },
                default: defaultResponse
              }
            }
          }
        }
      })

      addContainmentPathsRecursive(paths, entitySet, options, entityTypePath, parentPath, parentTypes, parentType, oDataVersion)
    }
  });

  if (!parentPath) {
    addSingletonsToPaths(paths, options)
    addActionsAndFunctionsToPaths(paths, entitySets, options)
  }

  return paths;
}

function setActionOrFunctionOperation(actionOrFunction, paths, path, verb, parameters, responses, defaultNamespace) {
  if (!paths[path]) {
    const oid = actionOrFunctionName(actionOrFunction, registeredOperations, path, defaultNamespace);
    const operationId = verifyOperationIdUniqueness(oid);
    paths[path] = {};
    paths[path][verb] = {
      operationId,
      parameters,
      responses
    };
  }
}

function upperFirst(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function lowerFirst(string: string): string {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

function actionOrFunctionName(action: Action | Function, registeredOperations: Set<string>, path?: string, defaultNamespace?: string): string {
  const parameters = action.parameters ? parametersWithoutBindingParameter(action.parameters).map(p => upperFirst(p.name)).join('') : '';

  if (action.isBound) {
    let boundType;

    const bindingParameter = bindingParameterFromParameters(action.parameters);
    if (bindingParameter) {
      boundType = isCollection(bindingParameter.type) ? typeNameFromCollectionType(bindingParameter.type) : bindingParameter.type;
    }

    const parentPath = nameFromParentPath(path.replace(`/${defaultNamespace ? defaultNamespace + '.' + action.name : action.name}`, ''));

    return `${lowerFirst(parentPath)}${boundType ? upperFirst(typeNameFromType(boundType)) : ''}${upperFirst(action.name)}${parameters ? 'By' + parameters : ''}`;
  } else {
    if (!registeredOperations.has(action.name)) {
      return lowerFirst(action.name);
    } else {
      return `${lowerFirst(action.name)}${parameters ? 'By' + parameters : ''}`;
    }
  }
}

function actionOrFunctionResponses(action: Action | Function): any {
  const response = {
    default: defaultResponse
  }

  if (action.returnType) {
    if (isCollection(action.returnType.type)) {
      const swaggerType = edmTypeToSwaggerType(typeNameFromCollectionType(action.returnType.type));
      response['200'] = swaggerType.isPrimitive ? {
        schema: {
          properties: {
            value: {
              items: {
                type: swaggerType.name
              },
              type: "array"
            }
          },
          type: "object"
        }
      } : {
          schema: {
            properties: {
              value: {
                items: {
                  $ref: `#/definitions/${swaggerType.name}`
                },
                type: "array"
              }
            },
            type: "object"
          }
        }
    } else {
      const swaggerType = edmTypeToSwaggerType(action.returnType.type);
      response['200'] = swaggerType.isPrimitive ? {
        schema: {
          type: swaggerType.name
        }
      } : {
          schema: {
            $ref: `#/definitions/${swaggerType.name}`
          }
        }
    }
  } else {
    response['204'] = { description: `Empty response.` }
  }

  return response;
}

function actionOrFunctionParameters(action: Action | Function, isFunction: boolean): Array<Parameter> {
  const inValue = isFunction ? 'path' : 'body';
  const parameters = (action.parameters || []);

  return (action.isBound ? parametersWithoutBindingParameter(parameters) : parameters)
    .map(actionParameter => {
      const { type, name, nullable } = actionParameter;

      if (isCollection(type)) {
        return {
          name,
          required: nullable == false ? true : false,
          in: inValue,
          type: 'array',
          items: {
            type: edmTypeToSwaggerType(typeNameFromCollectionType(type)).name
          }
        };
      } else {
        return {
          name,
          required: nullable == false ? true : false,
          in: inValue,
          type: edmTypeToSwaggerType(type).name
        };
      }
    });
}

function definitions(entitySets: Array<EntitySet>, complexTypes?: Array<ComplexType>, singletons?: Array<any>): Definitions {
  const definitions: Definitions = {
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

  entitySets.forEach(entitySet => {
    const type = `${entitySet.namespace}.${entitySet.entityType.name}`;

    definitions[definitions[type] ? `${entitySet.namespace}.${entitySet.name}` : type] = schema(entitySet.entityType);

  });

  if (complexTypes) {
    complexTypes.forEach(complexType => {
      definitions[complexType.name] = schema(complexType);
    });
  }

  if (singletons) {
    singletons.forEach(s => {
      definitions[s.name] = singleton(s);
    });
  }

  return definitions;
}

function schema(entityType: EntityType): Schema {
  const required = entityType.properties ? entityType.properties.filter(property => property.required).map(property => property.name) : [];

  const schema: Schema = {
    type: 'object'
  };

  if (entityType.properties) {
    schema.properties = properties(entityType.properties);
  }

  if (required.length > 0) {
    schema.required = required;
  }

  return schema;
}

function singleton(entityType: EntityType): any {
  const schema = {
    type: 'object',
    properties: entityType.properties ? singletonProperties(entityType.properties) : []
  };

  return schema;
}

function singletonProperties(properties: Array<EntityProperty>) {
  const result = {};

  properties.forEach(({ name, type }) => {
    result[name] = {
      type: isCollection(type) ? 'array' : 'object'
    };

    if (isCollection(type)) {
      result[name]['items'] = {
        $ref: `#/definitions/${fullTypeNameFromCollectionType(type)}`
      }
    } else {
      result[name]['$ref'] = `#/definitions/${fullTypeNameFromCollectionType(type)}`
    }
  })

  return result;
}

function properties(properties: Array<EntityProperty>): { [name: string]: Property } {
  const result: { [name: string]: Property } = {};

  properties.forEach(({ name, type }) => {
    result[name] = property(type);
  })

  return result;
}

function edmTypeToSwaggerType(type: string): { isPrimitive: boolean, name: string } {
  let swaggerType;

  switch (type) {
    case 'Edm.Int16':
    case 'Edm.Int32':
    case 'Edm.Int64':
      swaggerType = 'integer';
      break;
    case 'Edm.Boolean':
      swaggerType = 'boolean';
      break;
    case 'Edm.String':
    case 'Edm.Byte':
    case 'Edm.Binary':
    case 'Edm.DateTime':
    case 'Edm.DateTimeOffset':
    case 'Edm.Guid':
    case 'Edm.Duration':
      swaggerType = 'string';
      break;
    case 'Edm.Decimal':
    case 'Edm.Double':
    case 'Edm.Single':
      swaggerType = 'number';
      break;
  }

  return swaggerType ? {
    isPrimitive: true,
    name: swaggerType
  } : {
      isPrimitive: false,
      name: type
    };
}

function property(type: string): Property {
  const property: Property = {
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
    case 'Edm.Duration':
      property.type = 'string';
      property.format = 'duration';
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

function filter(entitySets: Array<EntitySet>, wanted: Array<string>): Array<EntitySet> {
  return entitySets.filter(entitySet => wanted.includes(entitySet.name))
}

function convert(allEntitySets: Array<EntitySet>, options: Options, oDataVersion?: string): Swagger {
  registeredOperations.clear();

  const entitySets = options.include ? filter(allEntitySets, options.include) : allEntitySets;

  const paths = pathsRecursive({ entitySets, options, oDataVersion, paths: {} });

  return {
    swagger: '2.0',
    host: options.host,
    produces: ['application/json'],
    basePath: options.basePath || '/',
    info: {
      title: 'OData Service',
      version: '0.0.1',
      ['x-odata-version']: oDataVersion
    },
    paths,
    definitions: definitions(entitySets, options.complexTypes, options.singletons)
  };
}

interface PathsRecursiveOptions {
  entitySets: Array<EntitySet>;
  options: Options;
  oDataVersion: string;
  paths: Paths;
  parentPath?: string;
  parentTypes?: Array<EntityType>;
  parentType?: EntityType;
}

export default convert;
