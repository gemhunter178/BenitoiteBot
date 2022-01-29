import { CLIENT_ID, CLIENT_SECRET } from '../src/constants.js';

const path = '/oauth2/token?client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET + '&grant_type=client_credentials';
const http = require('https');
const options = {
  'method': 'POST',
  'host': 'id.twitch.tv',
  'path': path,
  'port': null
}
const request = new Promise ( (resolve) => {
  const req = http.request(options, function (res) {
    const chunks = [];

    res.on('data', function (chunk) {
      chunks.push(chunk);
    });

    res.on('end', function () {
      const body = Buffer.concat(chunks);
      // place results here
      console.log(JSON.parse(body.toString()));
    });
  });
  req.end();
});