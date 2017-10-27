import { EntityType } from './EntityType';

export interface EntitySet {
  name: string;
  entityType: EntityType;
  namespace: string;
  annotations?: Array<string>;
}
