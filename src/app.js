import tmi from 'tmi.js'
import fs from 'fs'
import { BOT_USERNAME , OAUTH_TOKEN, CHANNELS, OWNER } from './constants'
import { files } from './filePaths'
import { FISH , FISH_STATS } from './fishCommand'
import { CODEWORDGAME } from './codewordsGame'
import { MORSE } from './morseDecoder'

const client = new tmi.Client({
  options: { debug: true },
  identity: {
    username: BOT_USERNAME,
    password: OAUTH_TOKEN
  },
  channels: CHANNELS
});

let cooldown = {};

function setCooldown(channel, command, time){
  cooldown[channel][command] = true;
  setTimeout(function(){cooldown[channel][command] = false;},time);
}

client.connect();

//setInterval(function(){client.say('[channel]', `[message]`)},[time,ms]);

client.on('message', (channel, user, message, self) => {
  //initialize cooldown object for channel
  if (!cooldown.hasOwnProperty(channel)){
    //also a good list of all commands this currently has
    cooldown[channel] = {
      hello: false,
      logme: false,
      fish: false,
      fishstats: false,
      timer: false,
      codeword: false,
      morse: false
    };
  }
  //debug
  //console.log(cooldown);
  
  //messages that need to match only the first word
  let firstWord = message.split(' ')[0];
  //mod only stuff
  let isMod = user.mod || user['user-type'] === 'mod';
  let isBroadcaster = channel.slice(1) === user.username;
  let isModUp = isMod || isBroadcaster;
  // Ignore messages from self.
  if (self) return;

  //commands past this must start with !
  if (!message.startsWith('!')) return;

  if (message.toLowerCase() === '!!hello' && !cooldown[channel]['hello']) {
    // "@user, heya!"
    setCooldown(channel, 'hello', 1000);
    client.say(channel, `Heya, ` + user['display-name'] + `!`);
  }
  
  if (message.toLowerCase() === '!!goodbye' && user.username === OWNER) {
    client.say(channel, `Alright, see you later!`);
    console.log('bot terminated by user');
    process.exit(0);
  }

  if (message.toLowerCase() === '!!logme' && !cooldown[channel]['logme']) {
    //mostly for debug purposes
    setCooldown(channel, 'logme', 1000);
    client.say(channel, user['display-name'] + ` has been logged on console`);
    console.log(user);
    console.log(isModUp);
  }
  
  //the famous !fish commands
  if (firstWord.toLowerCase() === '!!fish' && !cooldown[channel]['fish']) { 
    setCooldown(channel, 'fish', 5000); 
    FISH(files.fishDataFiles, fs, user, channel, client);
  }
  
  if (firstWord.toLowerCase() === '!!fishstats' && !cooldown[channel]['fishstats']) {
    setCooldown(channel, 'fishstats', 15000);
    FISH_STATS(files.fishDataFiles, fs, user, channel, client);
  }
  
  if (/^!!timer/i.test(firstWord) && isModUp && !cooldown[channel]['timer']){
    setCooldown(channel, 'timer', 30000);
    let query = message.replace(/^!+timer[\s]*/,'');
    let timeMin = parseInt(query);
    if (timeMin === NaN || timeMin <= 0){
      timeMin = 10;
    }
    let plural = ' minutes';
    if (timeMin === 1) plural = ' minute';
    client.say(channel, `Timer set for ` + timeMin + plural + '!');
    console.log('timer set for ' + timeMin + plural + ' from now');
    setTimeout(function(){client.say(channel, `*TIMER END* This timer was set ` + timeMin + plural + ` ago!`)},timeMin * 60000);
  }
  
  //codewords
  if (/^!!codeword/i.test(firstWord) && !cooldown[channel]['codeword']) {
    setCooldown(channel, 'codeword', 2000);
    CODEWORDGAME(files.codewordGameFile, fs, user, channel, client, message);
  }
  
  //morse code
  if (/^!!morse/i.test(firstWord) && !cooldown[channel]['morse']){ 
    setCooldown(channel, 'morse', 10000);
    let query = message.replace(/^!+morse[\s]*/,'');
    MORSE(user, channel, client, query);
  }
});