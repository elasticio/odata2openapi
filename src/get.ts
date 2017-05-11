import * as http from 'http';

function get(host, path): Promise<string> {
  return new Promise<string>((resolve, reject) => {
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
        const { statusCode, headers } = response
        if (statusCode >= 300 && statusCode < 400) {
          get(host, headers['location']).then(resolve, reject);
        } else if (statusCode >= 200 && statusCode < 300) {
          resolve(result);
        } else {
          reject(new Error(`Unexpected response: ${response}`));
        }
      })
    });

    request.on('error', reject);

    request.end();
  });
}

export default get;
