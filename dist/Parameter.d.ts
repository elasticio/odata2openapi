import { Reference } from './Reference';
export interface Parameter {
    name: string;
    in: string;
    required: boolean;
    schema?: Reference;
    type?: string;
    format?: string;
}
