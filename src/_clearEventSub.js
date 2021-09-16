//with some help from code by timcole: https://gist.github.com/timcole/e2fe6c7a98c9b8d72f74d7de7f0aecdb
import { gFunc } from './_generalFunctions.js';

export function clearEventSub(clientID, appOAuth) {
  'use strict';
  return new Promise((finish) => {
    let path = '/helix/eventsub/subscriptions';
    const http = require('https');
    const options = {
      'method': 'GET',
      'host': 'api.twitch.tv',
      'path': path,
      'port': null,
      'headers': {
        'Authorization': 'Bearer ' + appOAuth,
        'Client-Id': clientID
      }
    };
    const request = new Promise ( (resolve) => {
      const req = http.request(options, function (res) {
        const chunks = [];

        res.on('data', function (chunk) {
          chunks.push(chunk);
        });

        res.on('end', function () {
          const body = Buffer.concat(chunks);
          // console.log(JSON.parse(body.toString()));
          // place results here
          resolve(JSON.parse(body.toString()));
        });
      });
      req.end();
    });
    request.then((subData) => {
      if (subData.data) {
        const eventSubReqs = [];
        options.method = 'DELETE';
        for (let i = 0; i < subData.data.length; i++) {
          path = '/helix/eventsub/subscriptions?id=' + subData.data[i].id;
          options.path = path;
          const req2 = http.request(options, function (res) {
            const chunks = [];

            res.on('data', function (chunk) {
              chunks.push(chunk);
            });

            res.on('end', function () {
              const body = Buffer.concat(chunks);
            });
          });
          req2.end();
        }
        console.log(gFunc.mkLog('updt', '%EvntSub') + 'events cleared');
        setTimeout(function() {
          finish(0);
        }, 1000);
      } else if (subData.message) {
        console.log(gFunc.mkLog('!err', '%EvntSub') + subData.message);
        finish(1);
      } else {
        console.log(gFunc.mkLog('!err', '%EvntSub') + 'unknown error in fetching subscription data');
        finish(1);
      }
    })
  });
}

/* 
module.exports = {
  clearEventSub: clearEventSub
}; */
