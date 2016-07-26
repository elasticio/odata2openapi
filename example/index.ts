import odata2openapi from '../src/';

odata2openapi('http://services.odata.org/V3/Northwind/Northwind.svc/$metadata')
  .then(swagger => console.log(swagger))
  .catch(error => console.error(error))
