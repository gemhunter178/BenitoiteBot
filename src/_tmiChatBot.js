import tmi from 'tmi.js';
import fs from 'fs';
import { gFunc } from './_generalFunctions';
import { BOT_USERNAME , OAUTH_TOKEN, CHANNELS, OWNER } from './constants';
import { files } from './filePaths';
import { Cooldown } from './cooldown';
import { FISH , FISH_STATS } from './fishCommand';
import { CODEWORDGAME } from './codewordsGame';
import { MORSE } from './morseDecoder';
import { Trivia } from './triviaCommands';
import { CONVERT } from './convert';

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

// reset cooldown states in case edge cases arise
for (let i = 0; i < CHANNELS.length; i++) {
  Cooldown.resetCooldown(CHANNELS[i], cooldown);
}

// save created config above
Cooldown.saveCooldownFile(cooldown, fs, files);

//check if trivia categories needs updating
Trivia.getCat(fs, files.triviaCatFile, false);
//initialize trivia files
Trivia.initialize(fs, CHANNELS, files.triviaData);

client.connect();

client.on('message', (channel, user, message, self) => {
  
  // messages that need to match only the first word
  let firstWord = message.split(' ')[0];
  // mod only stuff
  let isMod = user.mod || user['user-type'] === 'mod';
  let isBroadcaster = channel.slice(1) === user.username;
  let isModUp = isMod || isBroadcaster;
  // Ignore messages from self.
  if (self) return;

  // commands past this must start with !
  if (!message.startsWith('!')) return;
  
  // default command, sort of a !ping
  if (message.toLowerCase() === '!!hello' && !cooldown[channel]['!!hello'][0]) {
    // "@user, heya!"
    Cooldown.setCooldown(channel, '!!hello', cooldown);
    client.say(channel, `Heya, ` + user['display-name'] + `!`);
  }
  
  // shut off bot (use only when necesssary)
  if (message.toLowerCase() === '!!goodbye' && user.username === OWNER) {
    client.say(channel, `Alright, see you later!`);
    console.log('bot terminated by user');
    process.exit(0);
  }
  
  // debugging and such
  if (message.toLowerCase() === '!!logme' && !cooldown[channel]['!!logme'][0]) {
    // mostly for debug purposes
    Cooldown.setCooldown(channel, '!!logme', cooldown);
    client.say(channel, user['display-name'] + ` has been logged on console`);
    console.log(user);
    console.log(isModUp);
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
  
  if ((firstWord.toLowerCase() === '!!resetcd' || firstWord.toLowerCase() === '!!resetcooldown') && isModUp){
    Cooldown.resetCooldown(channel, cooldown);
    Cooldown.saveCooldownFile(cooldown, fs, files);
    client.say(channel, `cooldown file has been reset`);
  }
  
  // the famous !fish commands
  if (firstWord.toLowerCase() === '!!fish' && !cooldown[channel]['!!fish'][0]) { 
    Cooldown.setCooldown(channel, '!!fish', cooldown); 
    FISH(files.fishDataFiles, fs, user, channel, client);
  }
  
  if (firstWord.toLowerCase() === '!!fishstats' && !cooldown[channel]['!!fishstats'][0]) {
    Cooldown.setCooldown(channel, '!!fishstats', cooldown);
    FISH_STATS(files.fishDataFiles, fs, user, channel, client);
  }
  
  // timer command
  if (/^!!timer\b/i.test(firstWord) && isModUp && !cooldown[channel]['!!timer'][0]){
    Cooldown.setCooldown(channel, '!!timer', cooldown);
    let query = message.replace(/^!+timer[\s]*/,'');
    let timeMin = parseFloat(query);
    if (isNaN(timeMin) || timeMin <= 0){
      timeMin = 10;
    } else if (timeMin % 1 != 0) {
      timeMin = timeMin.toFixed(4);
    }
    let plural = ' minutes';
    if (timeMin === 1) plural = ' minute';
    client.say(channel, `Timer set for ` + timeMin + plural + '!');
    console.log('timer set for ' + timeMin + plural + ' from now');
    setTimeout(function(){client.say(channel, `*TIMER END* This timer was set ` + timeMin + plural + ` ago!`)},timeMin * 60000);
  }
  
  // codewords
  if (/^!!codeword\b/i.test(firstWord) && !cooldown[channel]['!!codeword'][0]) {
    Cooldown.setCooldown(channel, '!!codeword', cooldown);
    CODEWORDGAME(files.codewordGameFile, fs, user, channel, client, message);
  }
  
  // morse code
  if (/^!!morse\b/i.test(firstWord) && !cooldown[channel]['!!morse'][0]){ 
    Cooldown.setCooldown(channel, '!!morse', cooldown);
    let query = message.replace(/^!+morse[\s]*/,'');
    MORSE(user, channel, client, query);
  }
  
  //convert
  if (/^!!convert\b/i.test(firstWord) && !cooldown[channel]['!!convert'][0]){ 
    Cooldown.setCooldown(channel, '!!convert', cooldown);
    let query = message.replace(/^!+convert[\s]*/,'');
    CONVERT(channel, client, query);
  }
  
  //trivia commands
  if (/^!!trivia\b/i.test(firstWord) && isModUp && !cooldown[channel]['!!trivia'][0]){ 
    let query = message.replace(/^!+trivia[\s]*/,'');
    Trivia.useCommand(fs, channel, files.triviaData, files.triviaCatFile, client, query, saveChats);
  }
});