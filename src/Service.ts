import { EntitySet } from './EntitySet';

export interface Service {
  schemas: Array<EntitySet>;
  version: string;
}
