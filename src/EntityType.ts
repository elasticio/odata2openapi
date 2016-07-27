import EntityProperty from './EntityProperty';

interface EntityType {
  name: string;
  key?: Array<EntityProperty>;
  properties: Array<EntityProperty>;
}

export default EntityType;
