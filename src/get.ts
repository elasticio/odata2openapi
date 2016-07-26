import * as http from 'http';

function get(host, path): Promise<string> {
  return new Promise((resolve, reject) => {
    const options = {
      host,
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'User-Agent': 'odata2openapi'
      },
      path
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
