import tmi from 'tmi.js';
import fs from 'fs';
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
  constructor(name, runFunc, defCooldown, modOnly, desc) {
    this.name = name;
    this.regExp = new RegExp('^' + name + '\\b', 'i');
    this.run = runFunc;
    this.defaultCooldown = defCooldown;
    this.modOnly = modOnly;
    this.desc = desc;
  }
}

let commandArray = [];
for (let i = 0; i < defCommands.length; i++) {
  const passName = prefix + defCommands[i].name;
  commandArray.push(new Command(passName, defCommands[i].run, defCommands[i].cd, defCommands[i].mod, defCommands[i].desc));
}

let cooldown;
// for privacy reasons, saved chats aren't stored in any file
let saveChats = {};
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

/* DEPRECATED reset cooldown states in case edge cases arise
for (let i = 0; i < CHANNELS.length; i++) {
  Cooldown.resetCooldown(CHANNELS[i], cooldown);
} */

// save created config above
Cooldown.saveCooldownFile(cooldown);

// initialize wordsAPI object
let wordsApiData;
WordsApi.init(fs, files.wordsAPI, Date.now())
.then ( data => {
  if (data) {
    wordsApiData = data;
    gFunc.save(fs, wordsApiData, files.wordsAPI);
  } else {
    console.log('error in making wordsApiData object!');
  }
});

// check if trivia categories needs updating
Trivia.getCat(fs, files.triviaCatFile, false);
// initialize trivia files
Trivia.initialize(fs, CHANNELS, files.triviaData);

// timer deletion implementation
let timerObject = Timer.init(CHANNELS);

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
  // Ignore messages from self.
  if (self) return;
  
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
      let accessLvl = true;
      switch (commandArray[i].modOnly) {
        case 1:
          accessLvl = isModUp;
          break;

        case 2:
          accessLvl = isBroadcaster;
          break;

        case -1:
          if(user.username === OWNER) {
            accessLvl = true;
          } else {
            accessLvl = false;
          }
          break;
          
        default:
          // do nothing
          break;
      }
      let query = message.replace(commandArray[i].regExp, '');
      query = query.replace(/^\s+/, '');
      try {
        if (query === 'help') {
          client.say(channel, commandArray[i].desc)
        } else if (Cooldown.checkCooldown(channel, commandArray[i].name, cooldown, current_time, accessLvl)) {
            commandArray[i].run(client, channel, user, query);
        }
      } catch (err){
        console.error(err.message);
        let addReason = '';
        if (err.message.length < 100) {
          addReason = ' [reason] -> ' + err.message;
        }
        client.say(channel, 'error running ' + commandArray[i].name + addReason);
      }
    }
  }
  
  // shut off bot (use only when necesssary)
  if (message.toLowerCase() === '!!goodbye' && user.username === OWNER) {
    const writeCooldown = JSON.stringify(cooldown);
    gFunc.writeFilePromise(fs, files.cooldown, writeCooldown).then( pass => {
      client.say(channel, `Alright, see you later!`);
      console.log('bot terminated by user');
      process.exit(0);
    }, error => {
      client.say(channel, 'error in writing cooldown file before stopping bot');
    });
  }
  
  // command list
  if (firstWord.toLowerCase() === '!!commands' && Cooldown.checkCooldown(channel, '!!commands', cooldown, current_time, true)) {
    let commandmsg = [];
    for (const commanditr in cooldown[channel]) {
      if (cooldown[channel][commanditr][0] > 0) {
        commandmsg.push(commanditr);
      }
    }
    commandmsg = gFunc.formatPrintOptions(commandmsg, false);
    client.say(channel, 'the current enabled commands on this bot are: ' + commandmsg);
  }
  
  // cooldown and command disabling
  if ((firstWord.toLowerCase() === '!!cd' || firstWord.toLowerCase() === '!!cooldown') && isModUp) {
    Cooldown.changeCooldown(channel, message, client, cooldown);
  }
  
  if (firstWord.toLowerCase() === '!!disable' && isModUp) {
    Cooldown.enable(channel, message, client, cooldown, false);
  }
  
  if (firstWord.toLowerCase() === '!!enable' && isModUp) {
    Cooldown.enable(channel, message, client, cooldown, true);
  }
  
  // timer command
  if (/^!!timer\b/i.test(firstWord) && Cooldown.checkCooldown(channel, '!!timer', cooldown, current_time, isModUp)) {
    Timer.addTimer(channel, message, client, timerObject);
  }
  
  //delete last timer
  if (/^!!deltimer\b/i.test(firstWord) && isModUp) {
    Timer.delLastTimer(channel, client, timerObject);
  }
  
  // codewords
  if (/^!!codeword\b/i.test(firstWord) && Cooldown.checkCooldown(channel, '!!codeword', cooldown, current_time, true)) {
    CODEWORDGAME(files.codewordGameFile, fs, user, channel, client, message);
  }
  
  // morse code
  if (/^!!morse\b/i.test(firstWord) && Cooldown.checkCooldown(channel, '!!morse', cooldown, current_time, true)) {
    let query = message.replace(/^!+morse[\s]*/,'');
    MORSE(user, channel, client, query);
  }
  
  //convert
  if (/^!!convert\b/i.test(firstWord) && Cooldown.checkCooldown(channel, '!!convert', cooldown, current_time, true)) {
    let query = message.replace(/^!+convert[\s]*/,'');
    CONVERT(channel, client, query);
  }
  
  //tone indicator search
  if (/^!!tone\b/i.test(firstWord) && Cooldown.checkCooldown(channel, '!!tone', cooldown, current_time, true)) {
    let query = message.replace(/^!+tone[\s]*/,'');
    InternetLang.searchToneInd(channel, client, query);
  }

  // wordsapi command
  if (/^!!define\b/i.test(firstWord) && Cooldown.checkCooldown(channel, '!!define', cooldown, current_time, isModUp)) { 
    let query = message.replace(/^!+define[\s]*/,'');
    if (API_KEYS['x-rapidapi-key']) {
      WordsApi.runCommand(fs, channel, wordsApiData, files.wordsAPI, client, query);
    } else {
      client.say(channel, '!!words requires an API key for wordsAPI (#notspon) to function');
    }
  }

  // trivia commands
  if (/^!!trivia\b/i.test(firstWord) && Cooldown.checkCooldown(channel, '!!trivia', cooldown, current_time, isModUp)) { 
    let query = message.replace(/^!+trivia[\s]*/,'');
    Trivia.useCommand(fs, channel, files.triviaData, files.triviaCatFile, client, query, saveChats);
  }
  
  // purge means ban everyone in the provided list, bans happen 1.5 seconds apart and will only work if bot is modded
  // remove '&& false' if you want this command to be available.
  if (firstWord === '!!purge' && isModUp && false) {
    //future implementaion of not using so many setTimeout objects?
    gFunc.readFilePromise(fs, './data/ban_list.json', false).then( ban_list => {
      ban_list = JSON.parse(ban_list);
      for (let i = 0; i < ban_list.length; i++) {
        setTimeout( function() { client.say(channel, '/ban ' + ban_list[i]);}, 1500*i);
      }
    }, error => {
      client.say(channel, 'no list found');
    });
  }
});