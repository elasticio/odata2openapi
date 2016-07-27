import EntityProperty from './EntityProperty';

interface EntityType {
  name: string;
  key?: Array<string>;
  properties: Array<EntityProperty>;
}

export default EntityType;
