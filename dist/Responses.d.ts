import { Response } from './Response';
import { Reference } from './Reference';
export interface Responses {
    default?: Response | Reference;
    [httpStatusCode: string]: Response | Reference;
}
