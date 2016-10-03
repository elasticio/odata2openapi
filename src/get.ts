import * as http from 'http';

function get(host, path): Promise<string> {
  return new Promise((resolve, reject) => {
  	let hostSplit = host.split(':');
  
    const options = {
      hostname: hostSplit[0],
      port: hostSplit.length > 1 ? hostSplit[1] : 80,
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
