import Swagger from './Swagger';

function odata2openapi(metadataUrl:string) : Promise<Swagger> {
  return fetch(metadataUrl)
          .then(response => {
            return Promise.resolve(null);
          })
}

export default odata2openapi;
