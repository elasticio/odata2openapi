import { EntityProperty } from "./EntityProperty";

export interface KeyProperty extends EntityProperty {
    wrapKeyInQuotes: boolean;
}