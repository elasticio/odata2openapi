import * as http from 'http';
import * as https from 'https';
import * as url from 'url';

function get(protocol, host, path, port): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const options = {
      host,
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'User-Agent': 'odata2openapi'
      },
      path,
      port
    };

    const fetcher = (protocol.startsWith('https:') ? https.request : http.request);
    const request = fetcher(options, (response) => {
      let result = '';

      response.on('data', (chunk) => {
        result += chunk;
      })

      response.on('end', () => {
        const { statusCode, headers } = response
        if (statusCode >= 300 && statusCode < 400) {
          const u = url.parse(headers['location']);
          get(u.protocol, u.host, u.path).then(resolve, reject);
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
