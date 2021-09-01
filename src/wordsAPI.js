import fs from 'fs';
import { files } from './filePaths.js';
import { API_KEYS } from './constants.js';
import { gFunc } from './_generalFunctions.js';

// all functions utilizing wordsAPI
export const WordsApi = {
  // check for/create file
  init: function(fileName, time) {
    let promise = new Promise ( (resolve) => {
      gFunc.readFilePromise(fileName, true).then( data => {
        data = JSON.parse(data);
        if (!data.time) {
          // initialize empty file
          data.time = time;
          data.uses = 0;
          data.cache = {};
        } else if (time - data.time > 3600000) {
          // day has passed
          data.time = time;
          data.uses = 0;
          data.cache = {};
        }
        resolve(data);
      }, error => {
        console.log('error in reading ' + fileName);
        resolve(false);
      });
    });
    return promise;
  },
  
  // check cached items
  checkCache: function(wordsData, word, arg) {
    if(wordsData.cache[word][arg]) {
      return wordsData.cache[word][arg];
    } else {
      return false;
    }
  },
  
  // display based on object fed into it
  disp: function(wordObj, channel, client){
    if (wordObj.definitions) {
      if (wordObj.definitions.length > 0) {
        let msg = wordObj.word + '-> ';
        for (let i = 0; i < wordObj.definitions.length; i++) {           
          const addon = ' [' + wordObj.definitions[i].partOfSpeech + ']: ' + wordObj.definitions[i].definition;
          if (msg.length + addon.length > 275) {
            break;
          } else {
            if (i !== 0) {
              msg += ' *OR*';
            }
            msg += addon;
          }
        }
        client.say(channel, msg);
      } else {
        client.say(channel, 'no definition known');
      }
    } else {
      if (wordObj.message) {
        client.say(channel, wordObj.message);
      } else {
        client.say(channel, 'unknown error');
      }
    }
  },
  
  runCommand: function (client, channel, user, query, wordsData) {
    // tests if API key exists
    if(wordsData[0]) {
      if (query.length === 0){
        client.say(channel, 'define, powered by wordsAPI (#notspon). Please enter a query. Example -> \'!!define peanut butter\'');
        return;
      }
      if (wordsData[1].cache[query]) {
        // cache implementaion
        console.log( query + ' found in cache');
        WordsApi.disp(wordsData[1].cache[query], channel, client);
      } else {
        // word and arg does not exist in cache
        if (Date.now() - wordsData[1].time > 3600000) {
          wordsData[1].time = Date.now();
          wordsData[1].uses = 0;
          wordsData[1].cache = {};
        }
        if (wordsData[1].uses < 95) {
          // limit is 2500/day, using this for safety
          query = '/words/' + query.replace(/\s/g, '%20') + '/definitions';
          // taken from rapidapi:
          const http = require('https');

          const options = {
            'method': 'GET',
            'hostname': 'wordsapiv1.p.rapidapi.com',
            'port': null,
            'path': query,
            'headers': {
              'x-rapidapi-key': API_KEYS['x-rapidapi-key'],
              'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com',
              'useQueryString': true
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
                wordsData[1].uses++;
                resolve(JSON.parse(body.toString()));
              });

            });
            req.end();
          });
          request.then ( wordObj => {
            if(wordObj.word) {
              wordsData[1].cache[wordObj.word] = wordObj;
            }
            WordsApi.disp(wordObj, channel, client);
            gFunc.save(wordsData[1], files.wordsAPI);
          });
        } else {
          client.say(channel, 'maximum API requests reached, cannot retrieve more data this hour');
        }
      }
    } else {
      // if API key does not exist
      client.say(channel, 'this command requires an API key for wordsAPI (#notspon) to function');
    }
  }
}