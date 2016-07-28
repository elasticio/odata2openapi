import { EntityProperty } from './EntityProperty';

export interface EntityType {
  name: string;
  key?: Array<EntityProperty>;
  properties: Array<EntityProperty>;
}
