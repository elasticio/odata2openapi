import { Schema } from './Schema';
import { Reference } from './Reference';
export interface Response {
    description: string;
    schema?: Schema | Reference;
}
