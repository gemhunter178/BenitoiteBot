'use strict';
import { ClientCredentialsAuthProvider } from '@twurple/auth';
import { ApiClient } from '@twurple/api';
import { DirectConnectionAdapter, EventSubListener } from '@twurple/eventsub';
import { NgrokAdapter } from '@twurple/eventsub-ngrok';
import { client, extraVar } from './_tmiChatBot.js';
import { CLIENT_ID, CLIENT_SECRET, LISTENER_SECRET, APP_OAUTH_TOKEN, OAUTH_TOKEN, CHANNELS, BANREGEX} from './constants.js';
import { gFunc } from './_generalFunctions.js';

export const followerListener = {};
export const follows = {};

//oath token without the 'oauth:' prefix
const TOKEN = OAUTH_TOKEN.slice(6);

const main = async function() {
  //a little delay to allow most things from tmiChatBot to initialize
  const setupListener = new Promise ((resolve, reject) => {
    setTimeout(function() {
      const authProvider = new ClientCredentialsAuthProvider(CLIENT_ID, CLIENT_SECRET);
      const apiClient = new ApiClient({ authProvider });
      const listener = new EventSubListener({
        apiClient,
        adapter: new NgrokAdapter(),
        secret: LISTENER_SECRET
      });
      if (listener) {
        resolve(listener);
      } else {
        reject('listener creation failed');
      }
      console.log(gFunc.mkLog('init', '%GENERAL') + 'event listener has been set up.');
    }, 2500);
  });
  setupListener.then(listener => {
    listener.listen();

    // get user ids
    const path = '/helix/users?login=' + CHANNELS.join('&login=').replace(/#/g, '');
    const http = require('https');
    const options = {
      'method': 'GET',
      'host': 'api.twitch.tv',
      'path': path,
      'port': null,
      'headers': {
        'Authorization': 'Bearer ' + TOKEN,
        'Client-Id': CLIENT_ID
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
          // console.log(body.toString());
          // place results here
          resolve(JSON.parse(body.toString()));
        });
      });
      req.end();
    });

    request.then(data => {
      //DEBUG console.log(data);
      const userIDs = {};
      const rawIDs = [];
      for (let i = 0; i < data.data.length; i++) {
        userIDs[data.data[i].id] = data.data[i].login;
        rawIDs.push(data.data[i].id)
      }
      console.log(gFunc.mkLog('init', '%GENERAL' ) + 'starting to listen to follows');
      let i = 0;
      for (const user in userIDs) {
        if( i < CHANNELS.length ) {
          followerListener[user] = listener.subscribeToChannelFollowEvents(user, e => {
            if(BANREGEX.test(e.userName)){
              console.log(gFunc.mkLog('aBan', userIDs[user]) + e.userName);
              if (extraVar.autoban['#' + userIDs[user]].enable){
                const randTime = 250 + Math.random() * 1000;
                setTimeout(function() {
                  client.say('#' + userIDs[user], '/ban ' + e.userName);
                }, randTime);
              }
            } else {
              console.log(gFunc.mkLog('fllw', userIDs[user]) + e.userName);
            }
          });
        }
        i++;
      }
    });
  }, error => {
    console.log(gFunc.mkLog('!err', 'ERROR') + error);
  });
}

const waitForClear = require('./_clearEventSub.js');
waitForClear.clearEventSub(CLIENT_ID, APP_OAUTH_TOKEN, LISTENER_SECRET).then((done) => {
  main();
})