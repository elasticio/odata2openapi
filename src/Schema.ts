import { Property } from './Property';
import { Reference } from './Reference';

export interface Schema {
  type: string;
  required?: Array<string>;
  items?: Schema | Reference;
  properties?: {[propertyName: string]: Property};
}
