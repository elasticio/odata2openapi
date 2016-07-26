import Swagger from './Swagger';
import Paths from './Paths';
import PathItem from './PathItem';
import * as xml2js from 'xml2js';

function parseEntityType(entityType: { [key: string]: any }): PathItem {
  return null
}

function parseDataService(dataService: { [key: string]: any }): Paths {
  const [ entityTypeSchema, entityContainerSchema ] = dataService['Schema'];

  const [ entityContainer ] = entityContainerSchema['EntityContainer']

  const entitySets = entityContainer['EntitySet'];

  const entityTypeToPath = entitySets.reduce((result, entitySet) => {
    const attributes = entitySet['$'];

    return Object.assign(result, {
      [attributes['EntityType']]: attributes['Name']
    });
  }, {});

  const entityTypes: Array<any> = entityTypeSchema['EntityType'];

  const ns = entityTypeSchema['$']['Namespace']

  return entityTypes.reduce((paths: Paths, entityType) => {
    const name = entityType['$']['Name'];
    const type = `${ns}.${name}`;
    const path = `/${entityTypeToPath[type]}`;

    paths[path] = parseEntityType(entityType);

    return paths;
  }, {});
}

function parsePaths(dataServices: Array<any>): Paths {
  return <Paths>Object.assign({}, ...dataServices.map(parseDataService));
}

function parse(host: string, path: string, xml: string): Promise<Swagger> {
  return new Promise<Swagger>((resolve, reject) => {
    xml2js.parseString(xml, (error, metadata) => {
      if (error) {
        return reject(error);
      }

      const swagger: Swagger = {
        swagger: '2.0',
        host,
        basePath: path.replace(/\/$metadata$/, ''),
        info: {
          title: 'OData Service',
          version: '0.0.1'
        },
        paths: parsePaths(metadata['edmx:Edmx']['edmx:DataServices'])
      };

      console.log([0]['Schema']);
      resolve(swagger);
    });
  });
}

export default parse;

