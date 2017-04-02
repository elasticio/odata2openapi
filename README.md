# OData to OpenAPI converter

This node module converts an existing OData metadata to OpeanAPI format.

## Install

Run `npm install --save odata2openapi`

## Usage

### Converting metadata from URL

Use the `odata2openapi` method to download a particular OData metadata and convert it.

#### JavaScript

```JavaScript
const { odata2openapi } = require('odata2openapi');

odata2openapi('http://services.odata.org/V4/Northwind/Northwind.svc/$metadata')
  .then(swagger => console.log(JSON.stringify(swagger, null, 2)))
  .catch(error => console.error(error))
```

#### TypeScript

```TypeScript
import { odata2openapi } from 'odata2openapi';

odata2openapi('http://services.odata.org/V4/Northwind/Northwind.svc/$metadata')
  .then(swagger => console.log(JSON.stringify(swagger, null, 2)))
  .catch(error => console.error(error))
```

### Converting existing XML string

Use the `parse` and `convert` methods if you have the metadata as XML.

#### JavaScript

```JavaSript
const { parse, convert } = require('odata2openapi');

const xml = '';

const options = {
  host: 'services.odata.org',
  path: '/V4/Northwind/Northwind.svc'
};

parse(xml)
  .then(entitySets => convert(entitySets, options))
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

const xml = '';

parse(xml)
  .then(entitySets => convert(entitySets, options))
  .then(swagger => console.log(JSON.stringify(swagger, null, 2)))
  .catch(error => console.error(error))
```
