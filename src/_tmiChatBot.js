'use strict';
import tmi from 'tmi.js';
import fs from 'fs';
import homoglyphSearch from 'homoglyph-search';
import { gFunc } from './_generalFunctions';
import { prefix, defCommands } from './_defCommands';
import { BOT_USERNAME , OAUTH_TOKEN, CHANNELS, OWNER, API_KEYS } from './constants';
import { files } from './filePaths';
import { Cooldown } from './cooldown';
import { FISH , FISH_STATS } from './fishCommand';
import { CODEWORDGAME } from './codewordsGame';
import { MORSE } from './morseDecoder';
import { CONVERT } from './convert';
import { InternetLang } from './ILang';
import { WordsApi } from './wordsAPI';
import { Trivia } from './triviaCommands';
import { Timer } from './timer';

const client = new tmi.Client({
  options: { debug: true },
  identity: {
    username: BOT_USERNAME,
    password: OAUTH_TOKEN
  },
  channels: CHANNELS
});

// defining commands
class Command {
  constructor(name, exVar, runFunc, modOnly, desc) {
    this.name = name;
    this.regExp = new RegExp('^' + name + '\\b', 'i');
    this.exVar = exVar;
    this.run = runFunc;
    this.modOnly = modOnly;
    this.desc = desc;
  }
}

let commandArray = [];
for (let i = 0; i < defCommands.length; i++) {
  const passName = prefix + defCommands[i].name;
  commandArray.push(new Command(passName, defCommands[i].exVar, defCommands[i].run, defCommands[i].mod, defCommands[i].desc));
}
console.log('done creating commands from _defCommands');

// for privacy reasons, saved chats aren't stored in any file
let saveChats = {};

// cooldown initialization
let cooldown;

// read cooldown file has to be sync before everything else
try {
  const data = fs.readFileSync(files.cooldown);
  cooldown = JSON.parse(data);
} catch (err) {
  console.log('cooldown file not found, generating a new one');
  try {
    fs.writeFileSync(files.cooldown, '{}');
    console.log(files.cooldown + ' has been created');
    cooldown = {};
  } catch (err) {
    console.error(err);
  }
}

// initialize values for new channels
Cooldown.init_new(cooldown, CHANNELS);

// save created config above
Cooldown.saveCooldownFile(cooldown);

// check if trivia categories needs updating
Trivia.getCat(files.triviaCatFile, false);
// initialize trivia files
Trivia.initialize(CHANNELS, files.triviaData);

// timer deletion implementation
let timerObject = Timer.init(CHANNELS);

// object to pass extra variables to object-generated commands
const extraVar = {
  cooldown: cooldown,
  cdDisable: [cooldown, false],
  cdEnable: [cooldown, true],
  timerObject: timerObject,
  saveChats: saveChats
}

// checking for a banned words list
let bannedWords;
gFunc.readFilePromise(files.bannedWords, true).then(
(result) => {
  bannedWords = JSON.parse(result);
  if(!bannedWords.words){
    bannedWords.words = [];
  }
  extraVar.bannedWords = bannedWords;
  gFunc.save(bannedWords, files.bannedWords);
}, (reject) => {
  console.log('error fetching banned words\n' + reject);
});

// initialize wordsAPI object
let wordsApiData;
WordsApi.init(files.wordsAPI, Date.now())
.then ( data => {
  if (data) {
    wordsApiData = data;
    gFunc.save(wordsApiData, files.wordsAPI);
    return wordsApiData;
  } else {
    console.log('error in making wordsApiData object!');
    return false;
  }
}).then((result) => {
  if(result) {
    extraVar.wordsApiData = result;
    console.log('successfully added wordsApiData to extraVar');
  }
});


// CLIENT CONNECT + REACT TO MESSAGES HERE
client.connect();

client.on('message', (channel, user, message, self) => {
  const current_time = Date.now();
  
  // messages that need to match only the first word
  let firstWord = message.split(' ')[0];
  // mod only stuff
  let isMod = user.mod || user['user-type'] === 'mod';
  let isBroadcaster = channel.slice(1) === user.username;
  let isModUp = isMod || isBroadcaster;
  
  // Ignore messages from self
  if (self) return;
  
  if (bannedWords && false){ // in progress, try not to run in an actual setting yet
    let contains = homoglyphSearch.search(message, bannedWords.words);
    if (contains) {
      let deleteMessage = false;
      try {
        testWordLoop:
        for (let i = 0; i < contains.length; i++) {
          const testAgainst = encodeURIComponent(contains[i].match);
          const testWords = message.split(' ');
          for (let j = 0; j < testWords.length; j++)
            if (encodeURIComponent(testWords[j]) === testAgainst){
              deleteMessage = true;
              break testWordLoop;
            }
        }
      } catch (err) {
        // running some odd characters to try to break the system
        console.log('banned word test tripped! ->' + err.message);
        deleteMessage = true;
      }
      if (deleteMessage) {
        client.say(channel, 'you can\'t say that!');
      }
    }
  }
  
  // test if there are chats to be added into the temp chat array
  if (Object.keys(saveChats).length !== 0) {
    // [debug] console.log(saveChats);
    for (const obj in saveChats) {
      if (channel === saveChats[obj].channel && current_time < saveChats[obj].endTime) {
        saveChats[obj].messages.push({
          current_time,
          "user": user['display-name'],
          message
        });
      }
    }
  }
  
  // commands past this must start with prefix (definied in _defCommands.js)
  if (!message.startsWith(prefix)) return;
  
  // all commands currently defined in _defCommands.js
  for (let i = 0; i < commandArray.length; i++) {
    if (commandArray[i].regExp.test(message)) {
      let query = message.replace(commandArray[i].regExp, '');
      query = query.replace(/^\s+/, '');
      let runCommand = false;
      switch (commandArray[i].modOnly) {
        case 0:
          runCommand = Cooldown.checkCooldown(channel, commandArray[i].name, cooldown, current_time, true)
          break;
        case 1:
          try {
            runCommand = Cooldown.checkCooldown(channel, commandArray[i].name, cooldown, current_time, isModUp);
          } catch {
            // allows a no-cooldown mod only command
            runCommand = isModUp;
          }
          break;

        case 2:
          runCommand = isBroadcaster;
          break;

        case -1:
          if(user.username === OWNER) {
            runCommand = true;
          }
          break;
          
        default:
          //if not defined, do nothing (default is false)
          break;
      }
      try {
        // mods can always access a command's help
        if (runCommand || isModUp) {
          if (query === 'help' && commandArray[i].desc) {
            client.say(channel, commandArray[i].desc)
          } else if (runCommand) {
            commandArray[i].run(client, channel, user, query, extraVar[commandArray[i].exVar]);
          }
        }
      } catch (err){
        console.error(err);
        let addReason = '';
        // to not flood chat
        if (err.message.length < 100) {
          addReason = ' [reason] -> ' + err.message;
        }
        client.say(channel, 'error running ' + commandArray[i].name + addReason);
      }
      return;
    }
  }
});