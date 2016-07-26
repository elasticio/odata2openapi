import * as http from 'http';
import * as url from 'url';

function get(uri: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const urlObject = url.parse(uri);

    const options = {
      host: urlObject.host,
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'User-Agent': 'odata2openapi'
      },
      path: urlObject.path
    };

    const request = http.request(options, (response) => {
      let result = '';

      response.on('data', (chunk) => {
        result += chunk;
      })

      response.on('end', () => {
        resolve(result);
      })
    });

    request.on('error', reject);

    request.end();
  });
}

export default get;
