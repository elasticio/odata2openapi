import * as xml2js from 'xml2js';

import EntitySet from './EntitySet';
import EntityType from './EntityType';
import EntityProperty from './EntityProperty';

function parseEntitySets(namespace: string, entityContainer: any, entityTypes: any): Array<EntitySet> {
  return entityContainer['EntitySet'].map(entitySet => parseEntitySet(namespace, entitySet, entityTypes));
}

function parseEntitySet(namespace: string, entitySet: any, entityTypes: any): EntitySet {
  const entityType = entitySet['$']['EntityType'].split('.').pop()

  return {
    namespace,
    name: entitySet['$']['Name'],
    entityType: parseEntityType(entityTypes.find(entity => entity['$']['Name'] == entityType))
  }
}

function parseEntityType(entityType: any): EntityType {
  return {
    name: entityType['$']['Name'],
    properties: entityType['Property'].map(parseProperty)
  };
}

function parseProperty(property: any) {
  return {
    name: property['$']['Name'],
    type: property['$']['Type']
  };
}

function parse(xml: string): Promise<Array<EntitySet>> {
  return new Promise<Array<EntitySet>>((resolve, reject) => {
    xml2js.parseString(xml, (error, metadata) => {
      if (error) {
        return reject(error);
      }

      const [dataService] = metadata['edmx:Edmx']['edmx:DataServices']

      const [entityTypeSchema, entityContainerSchema] = dataService['Schema'];

      const [entityContainer] = entityContainerSchema['EntityContainer'];

      const namespace = entityTypeSchema['$']['Namespace']

      const entitySets = parseEntitySets(namespace, entityContainer, entityTypeSchema['EntityType'])

      resolve(entitySets);
    });
  });
}

export default parse;
