import { ComplexType } from './ComplexType';
import { EntityProperty } from './EntityProperty';

export interface EntityType extends ComplexType {
  key?: Array<EntityProperty>;
  abstract?: boolean;
  paths?: Array<{name: string, type: string}>;
}
