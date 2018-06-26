import { Reference } from './Reference';
import { Schema } from './Schema';

export interface Property {
  type: string;
  enum?: Array<any>;
  format?: string;
  minimum?: number;
  maximum?: number;
  default?: any;
  items?: Schema | Reference;
  properties?: {[propertyName: string]: Property};
}
