import * as xml2js from 'xml2js';

import Swagger from './Swagger';
import Paths from './Paths';
import Property from './Property';
import Schema from './Schema';
import PathItem from './PathItem';
import Operation from './Operation';
import Definitions from './Definitions';

const defaultResponse = {
  description: 'Unexpected error',
  schema: {
    $ref: '#/definitions/Error'
  }
}

function getOperation(type: string, name: string, entitySet: string): Operation {
  return {
    operationId: `get${entitySet}`,
    responses: {
      '200': {
        description: `List of ${entitySet}`,
        schema: {
          type: 'array',
          items: {
            $ref: `#/definitions/${type}`
          }
        }
      },
      default: defaultResponse
    }
  };
}

function postOperation(type: string, name: string): Operation {
  const success = `${name} was successfully created.`;

  return {
    operationId: `create${name}`,
    parameters: [
      {
        name,
        in: 'body',
        required: true,
        schema: {
          $ref: `#/definitions/${type}`
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

function getAndPostOperations(type: string, name: string, entitySet: string): PathItem {
  return {
    get: getOperation(type, name, entitySet),
    post: postOperation(type, name)
  };
}

function parsePaths(ns: string, entityTypeToPath: {[type: string]: string}, entityTypes: Array<any>): Paths {
  const paths: Paths = {};

  entityTypes.forEach(entityType => {
    const name = entityType['$']['Name'];

    const type = `${ns}.${name}`;

    const entitySet = entityTypeToPath[type];

    const path = `/${entitySet}`;

    paths[path] = getAndPostOperations(type, name, entitySet);
  });

  return paths;
}

function parseDefinitions(ns: string, entityTypes: Array<any>): Definitions {
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

  entityTypes.forEach(entityType => {
    const name = entityType['$']['Name'];

    const type = `${ns}.${name}`;

    definitions[type] = parseSchema(entityType);
  });

  return definitions;
}

function parseSchema(entityType): Schema {
  const properties = entityType['Property'];

  const schema: Schema = {
    type: 'object',
    properties: parseProperties(properties)
  };

  return schema;
}

function parseProperties(properties: Array<any>): {[name: string]: Property} {
  return properties.reduce((properties, property) => {
    const name = property['$']['Name'];

    properties[name] = parseProperty(property);

    return properties;
  }, {})
}

function parseProperty(property: any): Property {
  let type = 'string';
  let format: string = null;

  switch (property['$']['Type']) {
    case 'Edm.Int16':
    case 'Edm.Int32':
      type = 'integer';
      format = 'int32';
      break;
    case 'Edm.Int64':
      type = 'integer';
      format = 'int64';
      break;
    case 'Edm.Boolean':
      type = 'boolean';
      break;
    case 'Edm.Byte':
      format = 'byte';
      break;
    case 'Edm.Date':
      format = 'date';
      break;
    case 'Edm.DateTimeOffset':
      format = 'date-time';
      break;
    case 'Edm.Double':
      type = 'number';
      format = 'double';
      break;
    case 'Edm.Single':
      type = 'number';
      format = 'single';
      break;
  }

  const result: Property = {
    type
  };

  if (format) {
    result.format = format;
  }

  return result;
}

function parse(host: string, path: string, xml: string): Promise<Swagger> {
  return new Promise<Swagger>((resolve, reject) => {
    xml2js.parseString(xml, (error, metadata) => {
      if (error) {
        return reject(error);
      }

      const [dataService] = metadata['edmx:Edmx']['edmx:DataServices']

      const [entityTypeSchema, entityContainerSchema] = dataService['Schema'];

      const [entityContainer] = entityContainerSchema['EntityContainer'];

      const entitySets = entityContainer['EntitySet'];

      const entityTypeToPath = entitySets.reduce((result, entitySet) => {
        const attributes = entitySet['$'];

        return Object.assign(result, {
          [attributes['EntityType']]: attributes['Name']
        });
      }, {});

      const entityTypes: Array<any> = entityTypeSchema['EntityType'];

      const ns = entityTypeSchema['$']['Namespace']

      const swagger: Swagger = {
        swagger: '2.0',
        host,
        produces: ['application/json'],
        basePath: path.replace(/\/\$metadata$/, ''),
        info: {
          title: 'OData Service',
          version: '0.0.1'
        },
        paths: parsePaths(ns, entityTypeToPath, entityTypes),
        definitions: parseDefinitions(ns, entityTypes)
      };

      resolve(swagger);
    });
  });
}

export default parse;

