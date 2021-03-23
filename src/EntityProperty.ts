export interface EntityProperty {
  name: string;
  type?: string;
  required?: boolean;
  description?: string;  
  items?: any;
  $ref?: any;
  enum?: Array<any>;
  wrapValueInQuotesInUrls: boolean;
}
