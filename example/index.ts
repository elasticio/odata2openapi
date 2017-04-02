import { odata2openapi, Swagger } from '../src/';

const url = process.argv[2] || 'http://services.odata.org/V4/Northwind/Northwind.svc/$metadata';

odata2openapi(url)
  .then((swagger: Swagger) => console.log(JSON.stringify(swagger, null, 2)))
  .catch(error => console.error(error))
