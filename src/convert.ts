import Swagger from './Swagger';
import Paths from './Paths';
import Property from './Property';
import Schema from './Schema';
import PathItem from './PathItem';
import Operation from './Operation';
import Definitions from './Definitions';
import Options from './Options';
import EntitySet from './EntitySet';
import EntityType from './EntityType';
import EntityProperty from './EntityProperty';

const defaultResponse = {
  description: 'Unexpected error',
  schema: {
    $ref: '#/definitions/Error'
  }
}

function getOperation(entitySet: EntitySet): Operation {
  return {
    operationId: `get${entitySet.name}`,
    responses: {
      '200': {
        description: `List of ${entitySet.entityType.name}`,
        schema: {
          type: 'array',
          items: {
            $ref: `#/definitions/${entitySet.namespace}.${entitySet.entityType.name}`
          }
        }
      },
      default: defaultResponse
    }
  };
}

function postOperation(entitySet: EntitySet): Operation {
  const success = `${entitySet.entityType.name} was successfully created.`;

  return {
    operationId: `create${entitySet.name}`,
    parameters: [
      {
        name: entitySet.entityType.name,
        in: 'body',
        required: true,
        schema: {
          $ref: `#/definitions/${entitySet.namespace}.${entitySet.entityType.name}`
        }
      }
    ],
    responses: {
      '201': {
        description: success
      },
      '204': {
        description: success
      },
      default: defaultResponse
    }
  }
}

function entitySetOperations(entitySet: EntitySet): PathItem {
  return {
    get: getOperation(entitySet),
    post: postOperation(entitySet)
  };
}

function paths(entitySets: Array<EntitySet>): Paths {
  const paths: Paths = {};

  entitySets.forEach(entitySet => {
    const path = `/${entitySet.name}`;

    paths[path] = entitySetOperations(entitySet);
  });

  return paths;
}

function definitions(entitySets: Array<EntitySet>): Definitions {
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

    definitions[type] = schema(entitySet.entityType);
  });

  return definitions;
}

function schema(entityType: EntityType): Schema {
  return {
    type: 'object',
    properties: properties(entityType.properties)
  };
}

function properties(properties: Array<EntityProperty>): {[name: string]: Property} {
  const result: {[name:string]: Property} = {};

  properties.forEach(({name, type}) => {
    result[name] = property(type);
  })

  return result;
}

function property(type: string): Property {
  const property: Property = {
    type: 'string'
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
    case 'Edm.Byte':
      property.format = 'byte';
      break;
    case 'Edm.Date':
      property.format = 'date';
      break;
    case 'Edm.DateTimeOffset':
      property.format = 'date-time';
      break;
    case 'Edm.Double':
      property.type = 'number';
      property.format = 'double';
      break;
    case 'Edm.Single':
      property.type = 'number';
      property.format = 'single';
      break;
  }

  return property;
}

function convert(entitySets, options: Options): Swagger {
  return {
    swagger: '2.0',
    host: options.host,
    produces: ['application/json'],
    basePath: options.basePath,
    info: {
      title: 'OData Service',
      version: '0.0.1'
    },
    paths: paths(entitySets),
    definitions: definitions(entitySets)
  };
}

export default convert;
