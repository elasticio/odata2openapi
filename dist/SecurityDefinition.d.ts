export interface SecurityDefinition {
    type: string;
    flow: string;
    authorizationUrl: string;
    scopes: {
        [key: string]: string;
    };
}
