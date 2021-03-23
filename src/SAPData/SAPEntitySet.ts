import { EntitySet } from '../EntitySet';

//Additional attributes from https://wiki.scn.sap.com/wiki/display/EmTech/SAP+Annotations+for+OData+Version+2.0#SAPAnnotationsforODataVersion2.0-Elementedm:EntitySet
export interface SAPEntitySet extends EntitySet {
    creatable: boolean;
    updatable: boolean;
    deleteable: boolean;
    pageable: boolean;
    searchable: boolean;    
    label?: string;
}

//Simple instanceof replacement as we're not working with classes
export function instanceOfSAPEntitySet(object:EntitySet){
    return 'creatable' in object; 
}