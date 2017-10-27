import { EntitySet } from './EntitySet';
import { ComplexType } from './ComplexType';
import { EntityType } from './EntityType';
import { Action } from './Action';
import { Function } from './Function';

export interface Service {
  entitySets: Array<EntitySet>;
  version: string;
  complexTypes: Array<ComplexType>;
  entityTypes: Array<EntityType>;
  singletons: Array<any>;
  actions: Array<Action>;
  functions:  Array<Function>;
  defaultNamespace: string;
}
