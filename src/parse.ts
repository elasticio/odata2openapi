import * as xml2js from 'xml2js';

import { EntitySet } from './EntitySet';
import { EntityType } from './EntityType';
import { EntityProperty } from './EntityProperty';

function parseEntitySets(namespace: string, entityContainer: any, entityTypes: any): Array<EntitySet> {
  return entityContainer['EntitySet'].map(entitySet => {
    const type = entitySet['$']['EntityType'].split('.').pop();

    const entityType = entityTypes.find(entity => entity['$']['Name'] == type);

    if (entityType) {
      return parseEntitySet(namespace, entitySet, entityType);
    }
  }).filter(entitySet => !!entitySet);
}

function parseEntitySet(namespace: string, entitySet: any, entityType: any): EntitySet {
  return {
    namespace,
    name: entitySet['$']['Name'],
    entityType: parseEntityType(entityType)
  }
}

function parseEntityType(entityType: any): EntityType {
  const result: EntityType = {
    name: entityType['$']['Name'],
    properties: entityType['Property'].map(parseProperty)
  };

  const keys = entityType['Key'];

  if (keys && keys.length > 0) {
    result.key = parseKey(keys[0], result.properties)
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

function parse(xml: string): Promise<Array<EntitySet>> {
  return new Promise<Array<EntitySet>>((resolve, reject) => {
    xml2js.parseString(xml, (error, metadata) => {
      if (error) {
        return reject(error);
      }

      const [dataServices] = metadata['edmx:Edmx']['edmx:DataServices']

      const schemas = dataServices['Schema'];

      const entityContainerSchema = schemas.find(schema => schema['EntityContainer'])

      if (!entityContainerSchema) {
        reject(new Error('Cannot find EntityContainer element.'));
      }

      const [entityContainer] = entityContainerSchema['EntityContainer']

      const entitySets: Array<EntitySet> = [];

      schemas.forEach(schema => {
        if (schema['EntityType']) {
          const namespace = schema['$']['Namespace'];
          const entityTypes = schema['EntityType'];
          entitySets.push(...parseEntitySets(namespace, entityContainer, entityTypes));
        }
      });

      resolve(entitySets);
    });
  });
}

export default parse;
