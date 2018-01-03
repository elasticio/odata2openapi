import { EntityProperty } from './EntityProperty';

export interface ComplexType {
  name: string;
  properties: Array<EntityProperty>;
  openType?: boolean;
  unicode?: boolean;
  namespace?: string;
}
