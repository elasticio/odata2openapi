import { ComplexType } from './ComplexType';
import { KeyProperty } from './KeyProperty';

export interface EntityType extends ComplexType {
  key?: Array<KeyProperty>;
  abstract?: boolean;
  paths?: Array<{name: string, type: string}>;
}
