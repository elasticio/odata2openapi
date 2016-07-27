import { odata2openapi } from '../src/';

const url = process.argv[2] || 'http://services.odata.org/V3/Northwind/Northwind.svc/$metadata';

odata2openapi(url)
  .then(swagger => console.log(JSON.stringify(swagger, null, 2)))
  .catch(error => console.error(error))
