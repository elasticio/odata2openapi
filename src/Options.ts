import { ComplexType } from './ComplexType';
import { EntityType } from './EntityType';
import { Action } from './Action';
import { Function } from './Function';
import { Singleton } from './Singleton';
import {EnumType} from "./EnumType";

export interface Options {
  host: string;
  basePath: string;
  include?: Array<string>;
  complexTypes?: Array<ComplexType>;
  entityTypes?: Array<EntityType>;
  singletons?: Array<Singleton>;
  actions?: Array<Action>;
  functions?:  Array<Function>;
  enumTypes?: Array<EnumType>;
  defaultNamespace?: string;
}
