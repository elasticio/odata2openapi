import { EntityProperty } from './EntityProperty';

export interface Singleton {
  name: string;
  type: string;
  properties?: Array<EntityProperty>;
}
