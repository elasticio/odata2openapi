# OData to OpenAPI converter

This node module converts an existing OData metadata to OpenAPI format.

## Install

Run `npm install --save odata2openapi`

## Usage

### Converting existing XML string

Use the `parse` and `convert` methods if you have the metadata as XML.

#### JavaScript

```js
const { parse, convert } = require('odata2openapi');

// Get the OData metadata as a string.
const xml = '';

const options = {
  host: 'services.odata.org',
  path: '/V4/Northwind/Northwind.svc'
};

parse(xml)
  .then(service => convert(service.entitySets, options, service.version))
  .then(swagger => console.log(JSON.stringify(swagger, null, 2)))
  .catch(error => console.error(error))
```

#### TypeScript
```TypeScript
import { parse, convert, Options } from 'odata2openapi';

const options: Options = {
  host: 'services.odata.org',
  path: '/V4/Northwind/Northwind.svc'
};

// Get the OData metadata as a string.
const xml = '';

parse(xml)
  .then(service => convert(service.entitySets, options, service.version))
  .then(swagger => console.log(JSON.stringify(swagger, null, 2)))
  .catch(error => console.error(error))
```
