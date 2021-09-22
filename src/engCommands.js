import fs from 'fs';
import { files } from './filePaths.js';
import { API_KEYS } from './constants.js';
import { gFunc } from './_generalFunctions.js';
import { prefix } from './_defCommands.js';

function init(fileName, time) {
  return new Promise ( (resolve) => {
    gFunc.readFilePromise(fileName, true).then( data => {
      data = JSON.parse(data);
      if (!data.time) {
        // initialize empty file
        data.time = time;
        data.uses = 0;
        data.cache = {};
      } else if (time - data.time > 3600000) {
        // hour has passed
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
}

// commands that use datamuse: http://www.datamuse.com/api/. very similar to WordsApi in implementation
export const datamuse = {
  init: init,

  defDisp: function(wordObj, channel, client, arg){
    const dispArg = arg;
    if (arg) {
      arg = arg.toLowerCase();
      const convToPartOfSpeech = {
        verb: 'v',
        noun: 'n',
        adjective: 'adj',
        adverb: 'adv'
      };
      if (convToPartOfSpeech[arg]) {
        arg = convToPartOfSpeech[arg];
      }
      arg = new RegExp('^' + arg);
    }

    if (wordObj.defs) {
      if (wordObj.defs.length > 0) {
        let msg = wordObj.word + '-> ';
        for (let i = 0; i < wordObj.defs.length; i++) {
          if (arg) {
            if (!arg.test(wordObj.defs[i])) {
              continue;
            }
          }
          let addon = '';
          if(wordObj.defs[i].includes('\t')){
            addon = '[' + wordObj.defs[i].replace(/\t/, ']: ');
          } else {
            addon = wordObj.defs[i];
          }
          if (msg.length + addon.length > 275) {
            break;
          } else {
            if (!/->\s$/.test(msg)) {
              msg += ' | ';
            }
            msg += addon;
          }
        }
        if (/->\s$/.test(msg)) {
          client.say(channel, wordObj.word + ' does not contain a definition with part of speech \'' + dispArg + '\'');
        } else {
          client.say(channel, msg);
        }
      } else {
        client.say(channel, 'no definition known from datamuse - note: only n, v, adj, and adv are defined');
      }
    } else {
      client.say(channel, 'word doesn\'t contain a definition...');
    }
  },

  define: function (client, channel, user, query, datamuseData) {
    if (query.length === 0){
      client.say(channel, 'define, powered by datamuse running off WordNet (#notspon). Please enter a query. Example -> \'' + prefix + 'define peanut butter /noun\'');
      return;
    }
    query = query.split(/\s*\//);
    if (datamuseData.cache[query[0]]) {
      // cache implementaion
      console.log(gFunc.mkLog('info', '%datamus') + query[0] + ' found in cache');
      datamuse.defDisp(datamuseData.cache[query[0]], channel, client, query[1]);
    } else {
      // word and arg does not exist in cache
      if (Date.now() - datamuseData.time > 3600000) {
        datamuseData.time = Date.now();
        datamuseData.uses = 0;
        datamuseData.cache = {};
      }
      if (datamuseData.uses < 3750) {
        // limit is 100000/day, using this for safety
        datamuseData.uses++;
        query[0] = 'https://api.datamuse.com/words?sp=' + query[0].replace(/\s/g, '%20') + '&md=d&max=3';
        gFunc.readHttps(query[0]).then ( (wordObj) => {
          wordObj = JSON.parse(wordObj);
          if(wordObj.length !== 0) {
            datamuse.defDisp(wordObj[0], channel, client, query[1]);
            for (let i = 0; i < wordObj.length; i++) {
              datamuseData.cache[wordObj[i].word] = wordObj[i];
            }
          } else {
            client.say(channel, 'no word found...');
          }
          gFunc.save(datamuseData, files.datamuseDef);
        }, (reject) => {
          console.log(gFunc.mkLog('!err', '%datamus') + 'error detected in getting data');
        });
      } else {
        client.say(channel, 'maximum API requests reached, cannot retrieve more data this hour');
      }
    }
  },

  rhyme: function (client, channel, user, query, datamuseData) {
    if (query.length === 0){
      client.say(channel, 'rhyme finder, powered by datamuse running off RhymeZone (#notspon). Please enter a query. Example -> \'' + prefix + 'rhyme rhyme\'');
      return;
    }
    if (datamuseData.uses < 3750) {
      // limit is 100000/day, using this for safety
      datamuseData.uses++;
      const keepQueryWord = query;
      query = 'https://api.datamuse.com/words?rel_rhy=' + query.replace(/\s/g, '') + '&max=10';
      gFunc.readHttps(query).then ( (wordObj) => {
        wordObj = JSON.parse(wordObj);
        if(wordObj.length !== 0) {
          let msg = keepQueryWord + ' rhymes with: ';
          for (let i = 0; i < wordObj.length; i++) {
            if (msg.length > 275) {
              break;
            }
            msg += wordObj[i].word + ', ';
          }
          client.say(channel, msg.slice(0,msg.length - 2));
        } else {
          client.say(channel, 'no rhymes found...');
        }
        gFunc.save(datamuseData, files.datamuseDef);
      }, (reject) => {
        console.log(gFunc.mkLog('!err', '%datamus') + 'error detected in getting data');
      });
    } else {
      client.say(channel, 'maximum API requests reached, cannot retrieve more data this hour');
    }
  }
}

// all functions utilizing wordsAPI
export const WordsApi = {
  // check for/create file
  init: init,

  /* check cached items (unused for now)
  checkCache: function(wordsData, word, arg) {
    if(wordsData.cache[word][arg]) {
      return wordsData.cache[word][arg];
    } else {
      return false;
    }
  },*/

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
        client.say(channel, 'no definition known from wordsAPI');
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
        console.log(gFunc.mkLog('info', '%wordAPI') + query + ' found in cache');
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