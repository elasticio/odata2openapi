import { EntitySet } from './EntitySet';

export interface Service {
  entitySets: Array<EntitySet>;
  version: string;
}
