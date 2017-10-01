import { Responses } from './Responses';
import { Parameter } from './Parameter';
export interface Operation {
    operationId: string;
    parameters?: Array<Parameter>;
    responses: Responses;
}
