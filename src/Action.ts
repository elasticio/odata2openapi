import { ReturnType } from './ReturnType';
import { ActionAndFunctionParameter } from './ActionAndFunctionParameter';

export interface Action {
  name: string;
  parameters: Array<ActionAndFunctionParameter>;
  isBound?: boolean;
  entitySetPath?: string;
  returnType?: ReturnType;
}
