import { ReturnType } from './ReturnType';
import { ActionAndFunctionParameter } from './ActionAndFunctionParameter';

export interface Function {
  name: string;
  isBound: boolean;
  isComposable: boolean;
  parameters?: Array<ActionAndFunctionParameter>;
  entitySetPath?: string;
  returnType: ReturnType;
}
