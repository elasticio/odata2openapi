import { EntityType } from './EntityType';
import { FunctionImport } from './FunctionImport';

export interface EntitySet {
  name: string;
  entityType: EntityType;
  namespace: string;
  annotations?: Array<string>;
  functionImports?: Array<FunctionImport>;
}
