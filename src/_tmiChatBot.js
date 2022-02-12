'use strict';
import tmi from 'tmi.js';
import fs from 'fs';
import dayjs from 'dayjs';
import homoglyphSearch from 'homoglyph-search';
import { gFunc } from './_generalFunctions.js';
import { prefix, defCommands } from './_defCommands.js';
import { hiddenCommands } from './hiddenCommands.js';
import { BOT_USERNAME, OAUTH_TOKEN, CHANNELS, OWNER, API_KEYS, BANREGEX } from './constants.js';
import { files } from './filePaths.js';
import { Cooldown } from './cooldown.js';
import { ProjectPenguin } from './projectPenguin.js';
import { FISH , FISH_STATS, NB_FISHSTATS } from './fishCommand.js';
import { CODEWORDGAME } from './codewordsGame.js';
import { TWORDLE } from './twordle.js';
import { MORSE, BLOCKLETTER } from './morseDecoder.js';
import { CONVERT } from './convert.js';
import { InternetLang } from './ILang.js';
import { datamuse, WordsApi } from './engCommands.js';
import { Trivia } from './triviaCommands.js';
import { Timer } from './timer.js';

export const client = new tmi.Client({
  options: { debug: false },
  identity: {
    username: BOT_USERNAME,
    password: OAUTH_TOKEN
  },
  channels: CHANNELS
});



// defining the Commands class
class Command {
  constructor(prefix, commandObj, functionList) {
    this.name = commandObj.name;
    if (commandObj.noPrefix) {
      this.regExp = new RegExp('^' + commandObj.name + '\\b', 'i');
    } else {
      this.regExp = new RegExp('^' + prefix + commandObj.name + '\\b', 'i');
    }
    this.exVar = commandObj.exVar;
    if(typeof(commandObj.run) === 'string'){
      this.run = functionList[commandObj.run];
    } else {
      this.run = commandObj.run;
    }
    this.modOnly = commandObj.mod;
    let description = '';
    switch (commandObj.mod) {
        case 0:
          // do nothing
          break;
        case 1:
          description = '[MOD ONLY] ';
          break;
        case 2:
          description = '[BROADCASTER ONLY] ';
          break;
        case -1:
          description = '[BOT OWNER ONLY] ';
          break;
        default:
          // provides a debug
          description = '[UNKNOWN USERLEVEL] ';
          break;
    }
    description += commandObj.desc;
    this.desc = description;
  }
}



// FUNCTION LIST to not have to import everything over on _defCommands
const functionList = {
  STOP: function(client, channel, user, query, cooldown) {
    const writeCooldown = JSON.stringify(cooldown);
    gFunc.writeFilePromise(files.cooldown, writeCooldown).then( pass => {
      client.say(channel, `Alright, see you later!`);
      console.log('bot terminated by ' + user['display-name']);
      process.exit(0);
    }, error => {
      client.say(channel, 'error in writing cooldown file before stopping bot');
    });
  },
  CD_CHANGE: Cooldown.changeCooldown,
  CD_ENABLE: Cooldown.enable,
  PURGE: ProjectPenguin.purge,
  ALLOWPURGE: ProjectPenguin.allowPurge,
  AUTOBAN: ProjectPenguin.autoban,
  BANLISTADD: ProjectPenguin.banListAdd,
  BANLISTREMOVE: ProjectPenguin.banListRemove,
  DATAMUSE_DEFINE: datamuse.define,
  DATAMUSE_RHYME: datamuse.rhyme,
  WORDSAPI_DEFINE: WordsApi.runCommand,
  FISH: FISH,
  FISH_STATS: FISH_STATS,
  NB_FISHSTATS: NB_FISHSTATS,
  CODEWORDGAME: CODEWORDGAME,
  TWORDLE: TWORDLE,
  MORSE: MORSE,
  BLOCKLETTER: BLOCKLETTER,
  CONVERT: CONVERT,
  TONE: InternetLang.searchToneInd,
  TRIVIA_COMMAND: Trivia.useCommand,
  ADD_TIMER: Timer.addTimer,
  DEL_TIMER: Timer.delLastTimer
}



// CREATING COMMANDS HERE
const commandArray = [];
const noPrefixCommandArray = [];
for (let i = 0; i < defCommands.length; i++) {
  if (!defCommands[i].noPrefix) {
    commandArray.push(new Command(prefix, defCommands[i], functionList));
  } else {
    noPrefixCommandArray.push(new Command(prefix, defCommands[i], functionList));
  }
}
console.log(gFunc.mkLog('init', '%GENERAL') + 'done creating commands from _defCommands');
for (let i = 0; i < hiddenCommands.length; i++) {
  if (!hiddenCommands[i].noPrefix) {
    commandArray.push(new Command(prefix, hiddenCommands[i], functionList));
  } else {
    noPrefixCommandArray.push(new Command(prefix, hiddenCommands[i], functionList));
  }
}
console.log(gFunc.mkLog('init', '%GENERAL') + 'done creating hidden commands');

// function that runs to test which commands to run
function testForCommand(commands, channel, user, message, current_time, isBroadcaster, isModUp) {
  for (let i = 0; i < commands.length; i++) {
    if (commands[i].regExp.test(message)) {
      console.log('['+ dayjs(current_time).format('HH:mm:ss') + '] cmnd: [' + channel + ']: ' + '<' + user['display-name'] + '>: ' + message);
      let query = message.replace(commands[i].regExp, '');
      query = query.replace(/^\s+/, '');
      let runCommand = false;
      switch (commands[i].modOnly) {
        case 0:
          runCommand = Cooldown.checkCooldown(channel, commands[i].name, cooldown, current_time, true)
          break;
        case 1:
          try {
            runCommand = Cooldown.checkCooldown(channel, commands[i].name, cooldown, current_time, isModUp);
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
          if (query === 'help' && commands[i].desc) {
            client.say(channel, commands[i].desc)
          } else if (runCommand) {
            commands[i].run(client, channel, user, query, extraVar[commands[i].exVar]);
          }
        }
      } catch (err){
        console.error(err);
        let addReason = '';
        // to not flood chat
        if (err.message.length < 100) {
          addReason = ' [reason] -> ' + err.message;
        }
        client.say(channel, 'error running ' + commands[i].name + addReason);
      }
      return;
    }
  }
}



// for privacy reasons, saved chats aren't stored in any file
let saveChats = {};

// COOLDOWN initialization
let cooldown;

// read cooldown file has to be sync before everything else
try {
  const data = fs.readFileSync(files.cooldown);
  cooldown = JSON.parse(data);
} catch (err) {
  console.log(gFunc.mkLog('init', '%GENERAL') + 'cooldown file not found, generating a new one');
  try {
    fs.writeFileSync(files.cooldown, '{}');
    console.log(gFunc.mkLog('init', '%GENERAL') + files.cooldown + ' has been created');
    cooldown = {};
  } catch (err) {
    console.error(err);
  }
}

// initialize values for new channels
Cooldown.init_new(cooldown, CHANNELS);

// save created config above
Cooldown.saveCooldownFile(cooldown);

// cooldown file is prone to deleting on other bot errors, this creates a backup every 30 mins
setInterval(function() {
  gFunc.save(cooldown, files.cooldownBackup);
}, 1800000);



// OTHER initializations

// check if trivia categories needs updating
Trivia.getCat(files.triviaCatFile, false);
// initialize trivia files
Trivia.initialize(CHANNELS, files.triviaData);

// timer deletion implementation
let timerObject = Timer.init(CHANNELS);

// purge permissions
let allowPurge = {allow: false};
// autoban
let autoban = {regex: BANREGEX};
for (let i = 0; i < CHANNELS.length; i++) {
  autoban[CHANNELS[i]] = {enable: true};
}



// object to pass extra variables to object-generated commands
export const extraVar = {
  cooldown: cooldown,
  cdDisable: [cooldown, false],
  cdEnable: [cooldown, true],
  timerObject: timerObject,
  saveChats: saveChats,
  allowPurge: allowPurge,
  autoban: autoban
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
  console.log(gFunc.mkLog('init', '%GENERAL') + 'error fetching banned words\n' + reject);
});



// getting a list of known/verified? bots from FFZ
let botList = [];
gFunc.readHttps('https://api.frankerfacez.com/v1/badge/bot').then( (list) => {
  botList = JSON.parse(list).users['2'];
  if(botList) {
    console.log(gFunc.mkLog('init', '%GENERAL') + 'bot list successfully fetched from FFZ');
  } else {
    console.log(gFunc.mkLog('init', '%GENERAL') + 'error in fetching bot list');
  }
}, (err) => {
  console.error(err);
});

// initialize datamuse object
let datamuseData;
datamuse.init(files.datamuseDef, Date.now())
.then ( data => {
  if (data) {
    datamuseData = data;
    gFunc.save(datamuseData, files.datamuseDef);
    return datamuseData;
  } else {
    console.log(gFunc.mkLog('init', '%datamus') + 'error in making datamuseData object!');
    return false;
  }
}).then((result) => {
  if(result) {
    extraVar.datamuseData = result;
    console.log(gFunc.mkLog('init', '%datamus') + 'successfully added datamuseData to extraVar');
  }
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
    console.log(gFunc.mkLog('init', '%wordAPI') + 'error in making wordsApiData object!');
    return false;
  }
}).then((result) => {
  if(result) {
    extraVar.wordsApiData = [API_KEYS["x-rapidapi-key"],result];
    console.log(gFunc.mkLog('init', '%wordAPI') + 'successfully added wordsApiData to extraVar');
  }
});



// CLIENT CONNECT + REACT TO MESSAGES HERE
client.connect();

setInterval(function() {
  if(client.getChannels().length === CHANNELS.length){
    console.log(gFunc.mkLog('init', '%GENERAL') + 'all channels connected -> ' + client.getChannels().join(' | '));
    clearInterval(this);
  }
}, 500);

// will also move this elsewhere eventually
client.on('join', (channel, username, self) => {
  // gives users joining the channel

  //'penguin' autoban feature
  if (!self && autoban[channel].enable && BANREGEX){
    if (BANREGEX.test(username)) {
      console.log(gFunc.mkLog('aBan', channel) + username);
      const randDelay = 1500 + Math.floor(Math.random() * 10000);
      setTimeout(function() {
        client.say(channel, '/ban ' + username);
      }, randDelay);
    }
  }
});

// output notices
client.on('notice', (channel, msgid, message) => {
  console.log(gFunc.mkLog('note', channel) + message);
});

client.on('chat', (channel, user, message, self) => {
  const current_time = Date.now();
  
  // mod only stuff
  let isMod = user.mod || user['user-type'] === 'mod';
  let isBroadcaster = channel.slice(1) === user.username;
  let isModUp = isMod || isBroadcaster;

  // Ignore messages from self, but log it
  if (self) {
    console.log(gFunc.mkLog('msge', channel) + '<' + user['display-name'] + '>: ' + message);
    return;
  }
  /*if (bannedWords){ // in progress, try not to run in an actual setting yet. Also, should eventually move to a different location
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
  } */

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

  // NoPrefix commands (defined in _defCommands.js and hiddenCommands.js)
  testForCommand(noPrefixCommandArray, channel, user, message, current_time, isBroadcaster, isModUp);

  // commands past this must start with prefix (definied in _defCommands.js)
  if (!message.startsWith(prefix)) return;

  // all other commands with prefixes (defined in _defCommands.js and hiddenCommands.js)
  testForCommand(commandArray, channel, user, message, current_time, isBroadcaster, isModUp);
});