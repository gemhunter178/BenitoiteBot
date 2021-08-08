import { API_KEYS } from './constants';
import { gFunc } from './_generalFunctions';

// all functions utilizing wordsAPI
export const WordsApi = {
  // check for/create file
  init: function(fs, fileName, time) {
    let promise = new Promise ( (resolve) => {
      gFunc.readFilePromise(fs, fileName, true).then( data => {
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
  checkCache: function(fs, wordsData, word, arg) {
    if(wordsData.cache[word][arg]) {
      return data.cache[word][arg];
    } else {
      return false;
    }
  },
  
  runCommand: function (fs, channel, wordsData, file, client, message) {
    if (false) {
      // eventual cache implementaion
    } else {
      // word and arg does not exist in cache
      if (Date.now() - wordsData.time > 3600000) {
        wordsData.time = Date.now();
        data.uses = 0;
        wordsData.cache = {};
      }
      if (wordsData.uses < 90) {
        // limit is 2500/day, using this for safety
        message = '/words/' + message.replace(/\s/g, '%20') + '/definitions';
        // taken from rapidapi:
        const http = require('https');
        
        const options = {
          'method': 'GET',
          'hostname': 'wordsapiv1.p.rapidapi.com',
          'port': null,
          'path': message,
          'headers': {
            'x-rapidapi-key': API_KEYS['x-rapidapi-key'],
            'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com',
            'useQueryString': true
          }
        };

        const req = http.request(options, function (res) {
          const chunks = [];

          res.on('data', function (chunk) {
            chunks.push(chunk);
          });

          res.on('end', function () {
            const body = Buffer.concat(chunks);
            // console.log(body.toString());
            // place results here
            wordsData.uses++;
            const wordObj = JSON.parse(body.toString());
            if(wordObj.word) {
              wordsData.cache[wordObj.word] = wordObj;
            }
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
            gFunc.save(fs, wordsData, file);
          });
        });

        req.end();
        
      } else {
        client.say(channel, 'maximum API requests reached, cannot retrieve more data this hour');
      }
    }
  }
}