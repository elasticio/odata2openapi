import Swagger from './Swagger';
import Paths from './Paths';
import * as xml2js from 'xml2js';

function parseEntityType(entityType: { [key: string]: any }): Paths {
  console.log(entityType);

  return null
}

function parseDataService(dataService: { [key: string]: any }): Paths {
  const schemas: Array<any> = dataService['Schema'];

  const entityTypes: Array<any> = schemas.reduce((result, schema) => {
    return result.concat(schema['EntityType']);
  }, []);

  return entityTypes.reduce((paths, entityType) => {
    return Object.assign(paths, parseEntityType(entityType))
  }, {});
}

function parsePaths(dataServices: Array<any>): Paths {
  return <Paths>Object.assign({}, dataServices.map(parseDataService));
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

