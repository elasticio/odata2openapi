import { Function } from '../Function';
import { EntityType } from '../EntityType';

export interface SAPFunction extends Function{
    label?: string;
    actionFor: string;
}

//Simple instanceof replacement as we're not working with classes
export function instanceOfSAPFunction(object:Function){
    return 'actionFor' in object; 
}