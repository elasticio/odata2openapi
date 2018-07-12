export interface EntityProperty {
  name: string;
  type?: string;
  required?: boolean;
  items?: any;
  $ref?: any;
  enum?: Array<any>;
  wrapValueInQuotesInUrls: boolean;
}
