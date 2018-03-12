# OData to OpenAPI converter

This node module converts an existing OData metadata to OpeanAPI format.

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

// Get the OData metadata as a string.
const xml = '';

parse(xml)
  .then(entitySets => convert(entitySets, options))
  .then(swagger => console.log(JSON.stringify(swagger, null, 2)))
  .catch(error => console.error(error))
```

> NOTE: When using Windows 10, you may receive errors related to `rm -fr` not being found. To correct this issue, you need to configure npm to use the Git Bash Shell. Execute this command in PowerShell and rerun `npm install`:
> * 64-bit Git: `npm config set script-shell "C:\Program Files\Git\bin\bash.exe"`
> * 32-bit Git: `npm config set script-shell "C:\Program Files (x86)\Git\bin\bash.exe"`
