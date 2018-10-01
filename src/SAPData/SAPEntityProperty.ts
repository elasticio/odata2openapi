import { EntityProperty } from '../EntityProperty';

//Additional attributes from https://wiki.scn.sap.com/wiki/display/EmTech/SAP+Annotations+for+OData+Version+2.0#SAPAnnotationsforODataVersion2.0-Elementedm:Property
export interface SAPEntityProperty extends EntityProperty {
    creatable: boolean;
    updatable: boolean;
    deleteable: boolean;
    pageable: boolean;
    filterable: boolean;
    sortable: boolean;
    label?: string;
}

//Simple instanceof replacement as we're not working with classes
export function instanceOfSAPEntityProperty(object:EntityProperty){
    return 'creatable' in object; 
}