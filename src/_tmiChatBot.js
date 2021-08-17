import tmi from 'tmi.js';
import fs from 'fs';
import { gFunc } from './_generalFunctions';
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

const client = new tmi.Client({
  options: { debug: true },
  identity: {
    username: BOT_USERNAME,
    password: OAUTH_TOKEN
  },
  channels: CHANNELS
});

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
Cooldown.saveCooldownFile(cooldown, fs, files);

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

  // commands past this must start with !
  if (!message.startsWith('!')) return;
  
  // default command, sort of a !ping
  if (message.toLowerCase() === '!!hello' && Cooldown.checkCooldown(channel, '!!hello', cooldown, current_time, true)) {
    // "@user, heya!"
    client.say(channel, `Heya, ` + user['display-name'] + `!`);
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
  
  // debugging and such
  if (message.toLowerCase() === '!!logme' && Cooldown.checkCooldown(channel, '!!logme', cooldown, current_time, true)) {
    // mostly for debug purposes
    client.say(channel, user['display-name'] + ` has been logged on console`);
    console.log(user);
    console.log(isModUp);
  }
  
  // command list
  if (firstWord.toLowerCase() === '!!commands' && Cooldown.checkCooldown(channel, '!!commands', cooldown, current_time, true)){
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
  if ((firstWord.toLowerCase() === '!!cd' || firstWord.toLowerCase() === '!!cooldown') && isModUp){
    Cooldown.changeCooldown(channel, message, client, cooldown, fs, files);
  }
  
  if (firstWord.toLowerCase() === '!!disable' && isModUp){
    Cooldown.enable(channel, message, client, cooldown, fs, files, false);
  }
  
  if (firstWord.toLowerCase() === '!!enable' && isModUp){
    Cooldown.enable(channel, message, client, cooldown, fs, files, true);
  }
  
  // the famous !fish commands
  if (firstWord.toLowerCase() === '!!fish' && Cooldown.checkCooldown(channel, '!!fish', cooldown, current_time, true)) { 
    FISH(files.fishDataFiles, fs, user, channel, client);
  }
  
  if (firstWord.toLowerCase() === '!!fishstats' && Cooldown.checkCooldown(channel, '!!fishstats', cooldown, current_time, true)) {
    FISH_STATS(files.fishDataFiles, fs, user, channel, client);
  }
  
  // timer command
  if (/^!!timer\b/i.test(firstWord) && Cooldown.checkCooldown(channel, '!!timer', cooldown, current_time, isModUp)){
    let query = message.replace(/^!+timer[\s]*/,'');
    query = query.split(' ');
    let timeMin = parseFloat(query[0]);
    // to be added back if the next check fails
    const maybeNum = query.shift();
    let addMsg = query.join(' ');
    if (isNaN(timeMin) || timeMin <= 0){
      timeMin = 10;
      addMsg = maybeNum + ' ' + addMsg;
    } else if (timeMin % 1 != 0) {
      timeMin = timeMin.toFixed(4);
    }
    let plural = ' minutes';
    if (timeMin === 1) plural = ' minute';
    client.say(channel, `Timer set for ` + timeMin + plural + '!');
    console.log('timer set for ' + timeMin + plural + ' from now in ' + channel);
    if (addMsg.length === 0) {
      addMsg = '[TIMER END!] this one was set ' + timeMin + plural + ' ago';
    } else {
      addMsg = '[From ' + timeMin + plural + ' ago] -> ' + addMsg;
    }
    setTimeout(function(){client.say(channel, addMsg)},timeMin * 60000);
  }
  
  // codewords
  if (/^!!codeword\b/i.test(firstWord) && Cooldown.checkCooldown(channel, '!!codeword', cooldown, current_time, true)) {
    CODEWORDGAME(files.codewordGameFile, fs, user, channel, client, message);
  }
  
  // morse code
  if (/^!!morse\b/i.test(firstWord) && Cooldown.checkCooldown(channel, '!!morse', cooldown, current_time, true)){
    let query = message.replace(/^!+morse[\s]*/,'');
    MORSE(user, channel, client, query);
  }
  
  //convert
  if (/^!!convert\b/i.test(firstWord) && Cooldown.checkCooldown(channel, '!!convert', cooldown, current_time, true)){
    let query = message.replace(/^!+convert[\s]*/,'');
    CONVERT(channel, client, query);
  }
  
  //tone indicator search
  if (/^!!tone\b/i.test(firstWord) && Cooldown.checkCooldown(channel, '!!tone', cooldown, current_time, true)){
    let query = message.replace(/^!+tone[\s]*/,'');
    InternetLang.searchToneInd(channel, client, query);
  }

  // wordsapi command
  if (/^!!define\b/i.test(firstWord) && Cooldown.checkCooldown(channel, '!!define', cooldown, current_time, isModUp)){ 
    let query = message.replace(/^!+define[\s]*/,'');
    if(API_KEYS['x-rapidapi-key']){
      WordsApi.runCommand(fs, channel, wordsApiData, files.wordsAPI, client, query);
    } else {
      client.say(channel, '!!words requires an API key for wordsAPI (#notspon) to function');
    }
  }

  // trivia commands
  if (/^!!trivia\b/i.test(firstWord) && Cooldown.checkCooldown(channel, '!!trivia', cooldown, current_time, isModUp)){ 
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
        setTimeout( function(){ client.say(channel, '/ban ' + ban_list[i]);}, 1500*i);
      }
    }, error => {
      client.say(channel, 'no list found');
    });
  }
});